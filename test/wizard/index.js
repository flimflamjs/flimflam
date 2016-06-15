var assert = require('assert')
var R = require("ramda")
var flyd = require("flyd")
var render = require('flimflam-render')
var h = require('snabbdom/h')
var snabbdom =require('snabbdom')
var patch = snabbdom.init([ // Init patch function with choosen modules
  require('snabbdom/modules/class') // makes it easy to toggle classes
, require('snabbdom/modules/props') // for setting properties on DOM elements
, require('snabbdom/modules/style') // handles styling on elements with support for animations
, require('snabbdom/modules/eventlisteners') // attaches event listeners
])

var wizard = require('../../wizard')

function wizComponent(steps) {
  var container = document.createElement('div')
  var view = wizard.view
  var state = wizard.init({steps})
  var streams = render({view, state, container, patch})
  streams.state = state
  return streams
}

suite('wizard')

test('sets the header content', () => {
  var streams = wizComponent([ {name: 'x', body: h('div','hi')} ])
  assert.equal(streams.dom$().querySelector('.ff-wizard-index-label').textContent, 'x')
})

test('sets the body content', () => {
  var streams = wizComponent([ {name: 'x', body: h('div','hi')} ])
  assert.equal(streams.dom$().querySelector('.ff-wizard-body-step').textContent, 'hi')
})

test('advancing currentStep sets the step header class for the new step', () => {
  var streams = wizComponent([ {name: '1', body: '1body'}, {name: '2', body: '2body'}, {name: '3', body: '3body'} ])
  streams.state.currentStep$(1)
  var className = streams.dom$().querySelectorAll('.ff-wizard-index-label')[1].className
  assert(R.contains('ff-wizard-index-label--current', className))
})

test('advancing currentStep sets the previous step to accessible class', () => {
  var streams = wizComponent([ {name: '1', body: '1body'}, {name: '2', body: '2body'}, {name: '3', body: '3body'} ])
  streams.state.currentStep$(1)
  var className = streams.dom$().querySelectorAll('.ff-wizard-index-label')[0].className
  assert(R.contains('ff-wizard-index-label--accessible', className))
})

test('advancing currentStep sets the step body to display block header class for the new step', () => {
  var streams = wizComponent([ {name: '1', body: '1body'}, {name: '2', body: '2body'}, {name: '3', body: '3body'} ])
  streams.state.currentStep$(1)
  var display = streams.dom$().querySelectorAll('.ff-wizard-body-step')[1].style.display
  assert.equal(display, 'block')
})

test('advancing currentStep sets the first step body to display block none', () => {
  var streams = wizComponent([ {name: '1', body: '1body'}, {name: '2', body: '2body'}, {name: '3', body: '3body'} ])
  streams.state.currentStep$(1)
  var display = streams.dom$().querySelectorAll('.ff-wizard-body-step')[0].style.display
  assert.equal(display, 'none')
})

test('jumping past the currentStep does not change currentStep', () => {
  var streams = wizComponent([ {name: '1', body: '1body'}, {name: '2', body: '2body'}, {name: '3', body: '3body'} ])
  streams.state.jump$([2, 0])
  assert.equal(streams.state.currentStep$(), 0)
})

test('jumping previous to the currentStep changes the currentStep', () => {
  var streams = wizComponent([ {name: '1', body: '1body'}, {name: '2', body: '2body'}, {name: '3', body: '3body'} ])
  streams.state.currentStep$(1)
  streams.state.jump$([0, 1])
  assert.equal(streams.state.currentStep$(), 0)
})

test('setting isCompleted to true hides the step index', () => {
  var streams = wizComponent([ {name: '1', body: '1body'}, {name: '2', body: '2body'}, {name: '3', body: '3body'} ])
  streams.state.isCompleted$(true)
  assert.equal(streams.dom$().querySelector('.ff-wizard-index').style.display, 'none')
})

test('setting isCompleted to true shows the followup content', () => {
  var streams = wizComponent([ {name: '1', body: '1body'}, {name: '2', body: '2body'}, {name: '3', body: '3body'} ])
  streams.state.isCompleted$(true)
  assert.equal(streams.dom$().querySelector('.ff-wizard-followup').style.display, 'block')
})
