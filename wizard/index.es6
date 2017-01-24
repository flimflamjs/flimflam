const R = require('ramda')
const h = require('snabbdom/h')
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

// each step object has a name and body
// followup is just snabbdom content
const view = (state, steps, followup) => {
  let stepNames  = R.map(R.prop('name'), steps)
  let stepBodies = R.map(R.prop('body'), steps)
  return h('div', {
    attrs: {'data-ff-wizard-body': state.isCompleted$() ? 'complete' : 'incomplete'}
  }, [
    stepIndex(state, stepNames)
  , body(state, stepBodies)
  , followupDiv(state, followup || '')
  ])
}

const followupDiv = (state, content) =>
  h('div', {
    attrs: {'data-ff-wizard-followup': state.isCompleted$() ? 'complete' : 'incomplete'}
  }, [content])


const stepIndex = (state, stepNames) => {
  let width = 100 / stepNames.length + '%'
  let stepHeaders = mapIndex(stepHeader(state, width), stepNames)
  return h('div', { 
    attrs: {'data-ff-wizard-index': state.isCompleted$() ? 'complete' : 'incomplete'}
  }, stepHeaders)
}

// A step label/header thing to go in the step index/listing
const stepHeader = (state, width) => (name, idx) => 
  h('span', {
    style: {width: width}
  , attrs: {
      'data-ff-wizard-index-label': 
          state.currentStep$() === idx ? 'current'
        : state.currentStep$() > idx ? 'accessible'
        : 'inaccessible'
    }
  , on: {click: ev => state.jump$([idx, state.currentStep$()])}
  }, name)


const body = (state, stepBodies) => {
  const bodyDivs = mapIndex(stepBody(state), stepBodies)
  return h('div', {
    attrs: {'data-ff-wizard-steps': state.isCompleted$() ? 'complete' : 'incomplete' }
  }, bodyDivs)
}

const stepBody = state => (content, idx) =>
  h('div', {
    attrs: {'data-ff-wizard-body-step': state.currentStep$() === idx ? 'current' : 'not-current'}
  }, [content])

module.exports = {view, init}
