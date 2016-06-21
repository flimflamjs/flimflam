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

var css = require('../../modal/index.css')

var modal = require('../../modal')

function initModals(state) {
  const id$ = flyd.stream()
  state = R.merge({
    modal1: {
      id$
    , thisID: 'modal1'
    , title: 'modal1-title'
    , body: 'modal1-body'
    , footer: 'modal1-footer'
    }
  , modal2: {
      id$
    , thisID: 'modal2'
    , title: 'modal2-title'
    , notCloseable: true
    , body: 'modal2-body'
    , footer: 'modal2-footer'
    }
  }, state || {})
  const view = state => h('div', [
    modal(state.modal1)
  , modal(state.modal2)
  ])
  let container = document.createElement('div')
  let streams = render({state, view, patch, container})
  streams.state = state
  return streams
}

suite('modal')

test('it sets inView class when id matches id stream', () => {
  var streams = initModals()
  streams.state.modal1.id$('modal1')
  var el = streams.dom$().querySelectorAll('.ff-modal')[0]
  assert(R.contains('ff-modal--inView', el.className))
  streams.state.modal1.id$('modal2')
  var el = streams.dom$().querySelectorAll('.ff-modal')[1]
  assert(R.contains('ff-modal--inView', el.className))
})

test('it removes inView class when id does not match id stream', () => {
  var streams = initModals()
  streams.state.modal1.id$('modal1')
  var el = streams.dom$().querySelectorAll('.ff-modal')[1]
  assert(!R.contains('ff-modal--inView', el.className))
  streams.state.modal1.id$('modal2')
  var el = streams.dom$().querySelectorAll('.ff-modal')[0]
  assert(!R.contains('ff-modal--inView', el.className))
})

test('it pushes null to the id stream when backdrop is clicked', () => {
  var streams = initModals()
  streams.state.modal1.id$('modal1')
  assert.equal(streams.state.modal1.id$(), 'modal1')
  streams.dom$().querySelector('.ff-modalBackdrop').click()
  assert.equal(streams.state.modal1.id$(), null)
})

test('it pushes null to the id stream when close button is clicked', () => {
  var streams = initModals()
  streams.state.modal1.id$('modal1')
  assert.equal(streams.state.modal1.id$(), 'modal1')
  streams.dom$().querySelector('.ff-modal-closeButton').click()
  assert.equal(streams.state.modal1.id$(), null)
})

test('it vertically centers', () => {
  const id$ = flyd.stream()
  let state = {
    id$: flyd.stream('filmflam')
  , thisID: 'filmflam'
  , title: 'Title Goes Here'
  , body: "Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there "
  , footer: 'what!'
  }

  const view = state => h('div', [ modal(state) ])
  let container = document.createElement('div')
  document.body.appendChild(container)

  let streams = render({state, view, patch, container})
  assert(streams.dom$().querySelector('.ff-modal-body').offsetHeight > 0)
})

