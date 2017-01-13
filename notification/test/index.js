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

test('it sets text content on a new notification message', t => {
  t.plan(1)
  const streams = initNotification()
  streams.state.message$('hi!')
  const msg = streams.dom$().querySelector('[data-ff-notification]').textContent
  t.equal(msg, 'hi!')
})

test('it sets "hidden" state without a notification message', t => {
  t.plan(1)
  const streams = initNotification()
  const state = streams.dom$().querySelector('[data-ff-notification]').getAttribute('data-ff-notification')
  t.equal(state, 'hidden')
})

test('it sets "shown" state on a new notification message', t => {
  t.plan(1)
  const streams = initNotification()
  streams.state.message$('hi!')
  const state = streams.dom$().querySelector('[data-ff-notification]').getAttribute('data-ff-notification')
  t.equal(state, 'shown')
})

test('it removes notification after a ms delay', t => {
  t.plan(2)
  const streams = initNotification({hideDelay: 100})
  streams.state.message$('hi!')
  t.equal(streams.dom$().querySelector('[data-ff-notification]').textContent, 'hi!')
  setTimeout(
    ts => { t.equal(streams.dom$().querySelector('[data-ff-notification]').textContent, '') }
  , 100)
})
