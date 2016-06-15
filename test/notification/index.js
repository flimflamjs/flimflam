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

var notification = require('../../notification')

function initNotification(state) {
  state = notification.init(state)
  var container = document.createElement('div')
  var view = state => h('div', [ notification.view(state) ])
  var streams = render({patch, state, view, container})
  streams.state = state
  return streams
}

suite('notification')

test('it sets text content on a new notification message', () => {
  var streams = initNotification()
  streams.state.message$('hi!')
  var msg = streams.dom$().querySelector('.ff-notification').textContent
  assert.equal(msg, 'hi!')
})

test('it sets inView class on a new notification message', () => {
  var streams = initNotification()
  streams.state.message$('hi!')
  var clss = streams.dom$().querySelector('.ff-notification').className
  assert(R.contains('ff-notification--inView', clss))
})

test('it removes notification after a ms delay', done => {
  var streams = initNotification({hideDelay: 100})
  streams.state.message$('hi!')
  assert.equal(streams.dom$().querySelector('.ff-notification').textContent, 'hi!')
  setTimeout(
    ts => { console.log('yup'); assert.equal(streams.dom$().querySelector('.ff-notification').textContent, ''); done() }
  , 100)
})
