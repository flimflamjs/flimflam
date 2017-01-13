const test = require('tape')
const R = require("ramda")
const flyd = require("flyd")
const render = require('../../render')
const h = require('snabbdom/h')
const snabbdom =require('snabbdom')
const patch = snabbdom.init([ // Init patch function with choosen modules
  require('snabbdom/modules/class') // makes it easy to toggle classes
, require('snabbdom/modules/props') // for setting properties on DOM elements
, require('snabbdom/modules/style') // handles styling on elements with support for animations
, require('snabbdom/modules/eventlisteners') // attaches event listeners
, require('snabbdom/modules/attributes')
])

const wizard = require('../index.es6')

function wizComponent(steps) {
  const container = document.createElement('div')
  const view = wizard.view
  const state = wizard.init({steps})
  const streams = render({view, state, container, patch})
  streams.state = state
  streams.container = container
  return streams
}

test('sets the header content', t => {
  t.plan(1)
  const streams = wizComponent([ {name: 'x', body: h('div','hi')} ])
  t.equal(streams.dom$().querySelector('[data-ff-wizard-index-label]').textContent, 'x')
})

test('sets the body content', t => {
  t.plan(1)
  const streams = wizComponent([ {name: 'x', body: h('div','hi')} ])
  t.equal(streams.dom$().querySelector('[data-ff-wizard-body-step]').textContent, 'hi')
})

test('advancing currentStep sets the label data state for the new step', t => {
  t.plan(1)
  const streams = wizComponent([ {name: '1', body: '1body'}, {name: '2', body: '2body'}, {name: '3', body: '3body'} ])
  streams.state.currentStep$(1)
  const state = streams.dom$().querySelectorAll('[data-ff-wizard-index-label]')[1]
    .getAttribute('data-ff-wizard-index-label')
  t.strictEqual(state, 'current')
})

test('advancing currentStep sets the previous step label state', t => {
  t.plan(1)
  const streams = wizComponent([ {name: '1', body: '1body'}, {name: '2', body: '2body'}, {name: '3', body: '3body'} ])
  streams.state.currentStep$(1)
  const state = streams.dom$().querySelector('[data-ff-wizard-index-label]')
    .getAttribute('data-ff-wizard-index-label')
  t.strictEqual(state, 'accessible')
})

test('advancing currentStep sets the step body to have data state as current for the new step', t => {
  t.plan(1)
  const streams = wizComponent([ {name: '1', body: '1body'}, {name: '2', body: '2body'}, {name: '3', body: '3body'} ])
  streams.state.currentStep$(1)
  const state = streams.dom$().querySelectorAll('[data-ff-wizard-body-step]')[1]
    .getAttribute('data-ff-wizard-body-step')
  t.strictEqual(state, 'current')
})

test('advancing currentStep sets the first step body to data state not-current', t => {
  t.plan(1)
  const streams = wizComponent([ {name: '1', body: '1body'}, {name: '2', body: '2body'}, {name: '3', body: '3body'} ])
  streams.state.currentStep$(1)
  const state = streams.dom$().querySelector('[data-ff-wizard-body-step]')
    .getAttribute('data-ff-wizard-body-step')
  t.strictEqual(state, 'not-current') 
})

test('jumping past the currentStep does not change currentStep', t => {
  t.plan(1)
  const streams = wizComponent([ {name: '1', body: '1body'}, {name: '2', body: '2body'}, {name: '3', body: '3body'} ])
  streams.dom$().querySelectorAll('[data-ff-wizard-index-label]')[1].click()
  t.equal(streams.state.currentStep$(), 0)
})

test('jumping previous to the currentStep changes the currentStep', t => {
  t.plan(1)
  const streams = wizComponent([ {name: '1', body: '1body'}, {name: '2', body: '2body'}, {name: '3', body: '3body'} ])
  streams.state.currentStep$(1)
  streams.dom$().querySelectorAll('[data-ff-wizard-index-label]')[0].click()
  t.equal(streams.state.currentStep$(), 0)
})

test('setting isCompleted to true sets the step index data state to complete', t => {
  t.plan(1)
  const streams = wizComponent([ {name: '1', body: '1body'}, {name: '2', body: '2body'}, {name: '3', body: '3body'} ])
  streams.state.isCompleted$(true)
  const state = streams.dom$().querySelector('[data-ff-wizard-index]')
    .getAttribute('data-ff-wizard-index')
  t.equal(state, 'complete')
})

test('setting isCompleted to true sets the followup data state to complete', t => {
  t.plan(1)
  const streams = wizComponent([ {name: '1', body: '1body'}, {name: '2', body: '2body'}, {name: '3', body: '3body'} ])
  streams.state.isCompleted$(true)
  const state = streams.dom$().querySelector('[data-ff-wizard-followup]')
    .getAttribute('data-ff-wizard-followup')
  t.equal(state, 'complete')
})


