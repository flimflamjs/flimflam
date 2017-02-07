const test = require('tape')
const R = require("ramda")
const flyd = require("flyd")
const render = require('flimflam-render')
const h = require('snabbdom/h')

const wizard = require('../index.es6')

function wizComponent(obj) {
  const container = document.createElement('div')
  const state = wizard.init()
  const view = state => h('div', [ 
    wizard.index(state, obj.index || [])
  , wizard.body(state, obj.body || [])
  ])
  let streams = render(view, state, container)
  streams.state = state
  streams.container = container
  return streams
}

test('sets the index content', t => {
  t.plan(1)
  const streams = wizComponent({index: [h('label', 'one')]})
  t.equal(streams.dom$().querySelector('[data-ff-wizard-index-label] label').textContent, 'one')
})

test('sets the body content', t => {
  t.plan(1)
  const streams = wizComponent({body: [h('div', 'hi')]})
  t.equal(streams.dom$().querySelector('[data-ff-wizard-body-step]').textContent, 'hi')
})

test('advancing currentStep sets the label data state for the new step', t => {
  t.plan(1)
  const streams = wizComponent({
    index: [h('label', 'one'), h('label', 'two')]
  , body: [h('div', 'body1'), h('div', 'body2')]
  })
  streams.state.currentStep$(1)
  const state = streams.dom$().querySelectorAll('[data-ff-wizard-index-label]')[1]
    .getAttribute('data-ff-wizard-index-label')
  t.strictEqual(state, 'current')
})

test('advancing currentStep sets the previous step label state', t => {
  t.plan(1)
  const streams = wizComponent({
    index: [h('label', 'one'), h('label', 'two')]
  , body: [h('div', 'body1'), h('div', 'body2')]
  })
  streams.state.currentStep$(1)
  const state = streams.dom$().querySelector('[data-ff-wizard-index-label]')
    .getAttribute('data-ff-wizard-index-label')
  t.strictEqual(state, 'accessible')
})

test('advancing currentstep sets the step body to have data state as current for the new step', t => {
  t.plan(1)
  const streams = wizComponent({
    index: [h('label', 'one'), h('label', 'two')]
  , body: [h('div', 'body1'), h('div', 'body2')]
  })
  streams.state.currentStep$(1)
  const state = streams.dom$().querySelectorAll('[data-ff-wizard-body-step]')[1]
    .getAttribute('data-ff-wizard-body-step')
  t.strictEqual(state, 'current')
})

test('advancing currentStep sets the first step body to data state not-current', t => {
  t.plan(1)
  const streams = wizComponent({
    index: [h('label', 'one'), h('label', 'two')]
  , body: [h('div', 'body1'), h('div', 'body2')]
  })
  streams.state.currentStep$(1)
  const state = streams.dom$().querySelector('[data-ff-wizard-body-step]')
    .getAttribute('data-ff-wizard-body-step')
  t.strictEqual(state, 'not-current') 
})

test('jumping past the currentStep does not change currentStep', t => {
  t.plan(1)
  const streams = wizComponent({
    index: [h('label', 'one'), h('label', 'two')]
  , body: [h('div', 'body1'), h('div', 'body2')]
  })
  streams.dom$().querySelectorAll('[data-ff-wizard-index-label]')[1].click()
  t.equal(streams.state.currentStep$(), 0)
})

test('jumping previous to the currentStep changes the currentStep', t => {
  t.plan(1)
  const streams = wizComponent({
    index: [h('label', 'one'), h('label', 'two')]
  , body: [h('div', 'body1'), h('div', 'body2')]
  })
  streams.state.currentStep$(1)
  streams.dom$().querySelectorAll('[data-ff-wizard-index-label]')[0].click()
  t.equal(streams.state.currentStep$(), 0)
})

test('setting isCompleted to true sets the step index data state to complete', t => {
  t.plan(1)
  const streams = wizComponent({
    index: [h('label', 'one'), h('label', 'two')]
  , body: [h('div', 'body1'), h('div', 'body2')]
  })
  streams.state.isCompleted$(true)
  const state = streams.dom$().querySelector('[data-ff-wizard-index]')
    .getAttribute('data-ff-wizard-index')
  t.equal(state, 'complete')
})

test('setting isCompleted to true sets the followup data state to complete', t => {
  t.plan(1)
  const streams = wizComponent({
    index: [h('label', 'one'), h('label', 'two')]
  , body: [h('div', 'body1'), h('div', 'body2')]
  })
  streams.state.isCompleted$(true)
  const state = streams.dom$().querySelector('[data-ff-wizard-followup]')
    .getAttribute('data-ff-wizard-followup')
  t.equal(state, 'complete')
})


