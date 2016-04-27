// Wizards are subtle and quick to anger

// Notes on usage:
// - You can use the stream from wizard.advance$ and wizard.jump% to move steps.
// - Push a truthy value to the .advance$ stream to advance
// - Push a step index to the jump$ stream to jump to that step if accessible 
// - You need to be careful and have form validation (and whole wizard validation) on your steps
// - Pass your step names and content + followup content into the second arg to wizard.view as an immutable Map
//   wizard.view(state.wizard, {steps: [{name: 'Payment', paymentStep(state)}, ...], followup: thankYouMessage(state)})

import h from 'snabbdom/h'
import flyd from 'flyd'
import R from 'ramda'

// You can pass in a jump stream: a stream of indexes for the wizard to jump to
function init(streams) {
  return {
    streams
  , state: { currentStep: 0, accessible: 0, isCompleted: false }
  , updates: {
      advance:   advanceStep
    , jump:      jumpStep
    , complete:  R.assoc('isCompleted')
    }
  }
}

// -- Updater functions

// Jump to a given step if it is accessible
const jumpStep = (i, state) =>
  i <= state.accessible ? R.merge(state, {currentStep: i, accessible: i}) : state

// Increment the current step and increment the maximum accessible step
// If you advance past the length of the steps, then isCompleted gets set to true
const advanceStep = (_, state) =>
  R.evolve({ currentStep: R.inc, accessible: R.inc }, state)

const view = (ctx, config) => {
  let stepNames  = R.map(R.prop('name'), config.steps)
  let stepBodies = R.map(R.prop('body'), config.steps)
  return h('div.wizard-body', [
    stepIndex(ctx, stepNames)
  , body(ctx.state, stepBodies)
  , followup(ctx.state, config.followup)
  ])
}

const followup = (state, content) =>
  h('div.wizard-followup.padded', {style: {display: state.isCompleted ? 'block' : 'none'}}, [content])


const stepIndex = (ctx, stepNames) => {
  let width = 100 / stepNames.length + '%'
  return h('div.wizard-index'
  , { style: { display: ctx.state.isCompleted ? 'none' : 'block' } }
  , R.addIndex(R.map)( (name, idx) => stepHeader(ctx, name, idx, width) , stepNames)
  )
}

// A step label/header thing to go in the step index/listing
const stepHeader = (ctx, name, idx, width) =>
  h('span.wizard-index-label', {
    style: {width: width}
  , class: {
      'is-current': ctx.state.currentStep === idx
    , 'is-accessible': ctx.state.accessible >= idx
    }
  , on: {click: [ctx.streams.jump, idx]}
  }, name)

const body = (state, stepContents) =>
  h('div.wizard-steps', {style: {display: state.isCompleted ? 'none' : 'table'}}, stepContents.map((content, idx) => stepBody(state, idx, content)))

const stepBody = (state, idx, content) =>
  h('div.wizard-body-step', {
    style: { display: state.currentStep === idx ? 'block' : 'none' }
  }, [content])

module.exports = {view, init}

