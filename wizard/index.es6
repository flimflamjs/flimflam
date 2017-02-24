const R = require('ramda')
const h = require('snabbdom/h').default
const flyd = require('flyd')
flyd.filter = require('flyd/module/filter')
const mapIndex = R.addIndex(R.map)

// User can pass in any default state data
const init = state => {
  // set defaults
  state = R.merge({
    currentStep$: flyd.stream(0)
  , jump$: flyd.stream() // Stream of step jumps: pairs of [destinationStep, currentStep]
  , isCompleted$: flyd.stream(false) // Is the wizard completed?
  }, state || {})
  
  // Stream of valid jump step indexes -- can only jump backwards
  // Filter out all jumps where the destinationStep (first in pair) is less than currentStep (second in pair)
  const validJump$ = flyd.map(R.head, flyd.filter(R.apply(R.lte), state.jump$))
  // Merge in valid jumps into the existing currentStep stream
  state.currentStep$ = flyd.merge(state.currentStep$, validJump$)
  return state
}

// index view for keeping track of step 
// content should be an array of vnodes or strings 
const labels = (state, content) => {
  let width = 100 / content.length + '%'
  return h('div', { 
    attrs: {'data-ff-wizard-label-wrapper': state.isCompleted$() ? 'complete' : 'incomplete'}
  }, mapIndex(labelStep(state, width), content))
}

const labelStep = (state, width) => (content, idx) => 
  h('span', {
    style: {width: width}
  , attrs: {
      'data-ff-wizard-label': 
          state.currentStep$() === idx ? 'current'
        : state.currentStep$() > idx ? 'accessible'
        : 'inaccessible'
    }
  , on: {click: ev => state.jump$([idx, state.currentStep$()])}
  }, [content])

// content should be an array of vnodes or strings
const content = (state, content, followup) => 
  h('div', {
    attrs: {'data-ff-wizard-content-wrapper': state.isCompleted$() ? 'complete' : 'incomplete'}
  }, [
    bodySteps(state, content)
  , followupDiv(state, followup || '')
  ])

const bodySteps = (state, content) => 
  h('div', {
    attrs: {'data-ff-wizard-steps': state.isCompleted$() ? 'complete' : 'incomplete' }
  }, mapIndex(bodyStepDiv(state), content))

const bodyStepDiv = state => (content, idx) =>
  h('div', {
    attrs: {'data-ff-wizard-content': state.currentStep$() === idx ? 'current' : 'not-current'}
  }, [content])

const followupDiv = (state, content) =>
  h('div', {
    attrs: {'data-ff-wizard-followup': state.isCompleted$() ? 'complete' : 'incomplete'}
  }, [content])

module.exports = {init, labels, content}

