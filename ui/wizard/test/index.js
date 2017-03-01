const test = require('tape')
const R = require("ramda")
const flyd = require("flyd")
const render = require('../../../render')
const h = require('snabbdom/h').default

const wizard = require('../')

function wizComponent(obj) {
  const container = document.createElement('div')
  const state = wizard.init()
  const view = state => h('div', [ 
    wizard.labels(state, obj.labels || [])
  , wizard.content(state, obj.content || [])
  ])
  let streams = render(view, state, container)
  streams.state = state
  streams.container = container
  return streams
}

test('sets the label content', t => {
  t.plan(1)
  const streams = wizComponent({labels: [h('label', 'one')]})
  t.equal(streams.dom$().querySelector('[data-ff-wizard-label]').textContent, 'one')
})

test('sets the content content', t => {
  t.plan(1)
  const streams = wizComponent({content: [h('div', 'hi')]})
  t.equal(streams.dom$().querySelector('[data-ff-wizard-content]').textContent, 'hi')
})

test('advancing currentStep sets the label data state for the new step', t => {
  t.plan(1)
  const streams = wizComponent({
    labels: [h('label', 'one'), h('label', 'two')]
  , content: [h('div', 'content1'), h('div', 'content2')]
  })
  streams.state.currentStep$(1)
  const state = streams.dom$().querySelectorAll('[data-ff-wizard-label]')[1]
    .getAttribute('data-ff-wizard-label')
  t.strictEqual(state, 'current')
})

test('advancing currentStep sets the previous step label state', t => {
  t.plan(1)
  const streams = wizComponent({
    labels: [h('label', 'one'), h('label', 'two')]
  , content: [h('div', 'content1'), h('div', 'content2')]
  })
  streams.state.currentStep$(1)
  const state = streams.dom$().querySelector('[data-ff-wizard-label]')
    .getAttribute('data-ff-wizard-label')
  t.strictEqual(state, 'accessible')
})

test('advancing currentstep sets the step content to have data state as current for the new step', t => {
  t.plan(1)
  const streams = wizComponent({
    labels: [h('label', 'one'), h('label', 'two')]
  , content: [h('div', 'content1'), h('div', 'content2')]
  })
  streams.state.currentStep$(1)
  const state = streams.dom$().querySelectorAll('[data-ff-wizard-content]')[1]
    .getAttribute('data-ff-wizard-content')
  t.strictEqual(state, 'current')
})

test('advancing currentStep sets the first step content to data state not-current', t => {
  t.plan(1)
  const streams = wizComponent({
    labels: [h('label', 'one'), h('label', 'two')]
  , content: [h('div', 'content1'), h('div', 'content2')]
  })
  streams.state.currentStep$(1)
  const state = streams.dom$().querySelector('[data-ff-wizard-content]')
    .getAttribute('data-ff-wizard-content')
  t.strictEqual(state, 'not-current') 
})

test('jumping past the currentStep does not change currentStep', t => {
  t.plan(1)
  const streams = wizComponent({
    labels: [h('label', 'one'), h('label', 'two')]
  , content: [h('div', 'content1'), h('div', 'content2')]
  })
  streams.dom$().querySelectorAll('[data-ff-wizard-label]')[1].click()
  t.equal(streams.state.currentStep$(), 0)
})

test('jumping previous to the currentStep changes the currentStep', t => {
  t.plan(1)
  const streams = wizComponent({
    labels: [h('label', 'one'), h('label', 'two')]
  , content: [h('div', 'content1'), h('div', 'content2')]
  })
  streams.state.currentStep$(1)
  streams.dom$().querySelectorAll('[data-ff-wizard-label]')[0].click()
  t.equal(streams.state.currentStep$(), 0)
})

test('setting isCompleted to true sets the step label data state to complete', t => {
  t.plan(1)
  const streams = wizComponent({
    labels: [h('label', 'one'), h('label', 'two')]
  , content: [h('div', 'content1'), h('div', 'content2')]
  })
  streams.state.isCompleted$(true)
  const state = streams.dom$().querySelector('[data-ff-wizard-label-wrapper]')
    .getAttribute('data-ff-wizard-label-wrapper')
  t.equal(state, 'complete')
})

test('setting isCompleted to true sets the followup data state to complete', t => {
  t.plan(1)
  const streams = wizComponent({
    labels: [h('label', 'one'), h('label', 'two')]
  , content: [h('div', 'content1'), h('div', 'content2')]
  })
  streams.state.isCompleted$(true)
  const state = streams.dom$().querySelector('[data-ff-wizard-followup]')
    .getAttribute('data-ff-wizard-followup')
  t.equal(state, 'complete')
})


