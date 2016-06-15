import R from 'ramda'
import h from 'snabbdom/h'
import flyd from 'flyd'
flyd.filter = require('flyd/module/filter')

const mapIndex = R.addIndex(R.map)

// User can pass in any default state data
const init = state => {
  // set defaults
  state = R.merge({
    currentStep$: flyd.stream(0)
  , jump$: flyd.stream()
  , isCompleted$: flyd.stream(false)
  , steps: []
  , followup: ''
  }, state || {})
  
  // Stream of valid jump step indexes -- can only jump backwards
  const validJump$ = flyd.map(R.head, flyd.filter(R.apply(R.lte), state.jump$))
  // Merge in valid jumps into the existing currentStep stream
  state.currentStep$ = flyd.merge(state.currentStep$, validJump$)

  return state
}

// state has a steps array and followup object
// each step object has a name and body
// followup is just snabbdom content
const view = state => {
  let stepNames  = R.map(R.prop('name'), state.steps)
  let stepBodies = R.map(R.prop('body'), state.steps)
  return h('div.ff-wizard-body', [
    stepIndex(state, stepNames)
  , body(state, stepBodies)
  , followup(state, state.followup)
  ])
}

const followup = (state, content) =>
  h('div.ff-wizard-followup', {
    style: {display: state.isCompleted$() ? 'block' : 'none'}
  }, [content])


const stepIndex = (state, stepNames) => {
  let width = 100 / stepNames.length + '%'
  let stepHeaders = mapIndex(stepHeader(state, width), stepNames)
  return h('div.ff-wizard-index', { 
    style: { display: state.isCompleted$() ? 'none' : 'block' } 
  }, stepHeaders)
}

// A step label/header thing to go in the step index/listing
const stepHeader = (state, width) => (name, idx) => 
  h('span.ff-wizard-index-label', {
    style: {width: width}
  , class: {
      'ff-wizard-index-label--current':    state.currentStep$() === idx
    , 'ff-wizard-index-label--accessible': state.currentStep$() > idx
    }
  , on: {click: ev => state.jump$([idx, state.currentStep$()])}
  }, name)


const body = (state, stepBodies) => {
  let bodies = mapIndex(stepBody(state), stepBodies)
  return h('div.ff-wizard-steps', {
    style: {display: state.isCompleted$() ? 'none' : 'block'}
  }, bodies)
}

const stepBody = state => (content, idx) =>
  h('div.ff-wizard-body-step', {
    style: { display: state.currentStep$() === idx ? 'block' : 'none' }
  }, [content])

module.exports = {view, init}

