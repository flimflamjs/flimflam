const assert = require('assert')
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
, require('snabbdom/modules/attributes') // attaches event listeners
])

const notification = require('../index.es6')

function initNotification(state) {
  state = notification.init(state)
  const container = document.createElement('div')
  const view = state => h('div', [ notification.view(state) ])
  const streams = render({patch, state, view, container})
  streams.state = state
  return streams
}

suite('notification')

test('it sets text content on a new notification message', () => {
  const streams = initNotification()
  streams.state.message$('hi!')
  const msg = streams.dom$().querySelector('[data-ff-notification]').textContent
  assert.equal(msg, 'hi!')
})

test('it sets "hidden" state without a notification message', () => {
  const streams = initNotification()
  const state = streams.dom$().querySelector('[data-ff-notification]').getAttribute('data-ff-notification')
  assert.equal(state, 'hidden')
})

test('it sets "shown" state on a new notification message', () => {
  const streams = initNotification()
  streams.state.message$('hi!')
  const state = streams.dom$().querySelector('[data-ff-notification]').getAttribute('data-ff-notification')
  assert.equal(state, 'shown')
})

test('it removes notification after a ms delay', done => {
  const streams = initNotification({hideDelay: 100})
  streams.state.message$('hi!')
  assert.equal(streams.dom$().querySelector('[data-ff-notification]').textContent, 'hi!')
  setTimeout(
    ts => { assert.equal(streams.dom$().querySelector('[data-ff-notification]').textContent, ''); done() }
  , 100)
})
