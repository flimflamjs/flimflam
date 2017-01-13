const test = require('tape')
const R = require("ramda")
const flyd = require("flyd")
const render = require('flimflam-render')
const h = require('snabbdom/h')
const snabbdom =require('snabbdom')
const patch = snabbdom.init([ // Init patch function with choosen modules
  require('snabbdom/modules/class') // makes it easy to toggle classes
, require('snabbdom/modules/props') // for setting properties on DOM elements
, require('snabbdom/modules/style') // handles styling on elements with support for animations
, require('snabbdom/modules/eventlisteners') // attaches event listeners
, require('snabbdom/modules/attributes') // attaches event listeners
])

import '../index.css'
import modal from '../index.es6'

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
  const container = document.createElement('div')
  const streams = render({state, view, patch, container})
  streams.state = state
  return streams
}

test('it sets shown state when id matches id stream', t => {
  t.plan(2)
  const streams = initModals()

  streams.state.modal1.id$('modal1')
  const el1 = streams.dom$().querySelector('[data-ff-modal]').getAttribute('data-ff-modal')
  t.strictEqual(el1, 'shown')

  streams.state.modal1.id$('modal2')
  const el2 = streams.dom$().querySelectorAll('[data-ff-modal]')[1].getAttribute('data-ff-modal')
  t.strictEqual(el2, 'shown')
})

test('it sets hidden state when id does not match id stream', t => {
  t.plan(2)
  const streams = initModals()

  streams.state.modal1.id$('modal1')
  const el2 = streams.dom$().querySelectorAll('[data-ff-modal]')[1].getAttribute('data-ff-modal')
  t.strictEqual(el2, 'hidden')

  streams.state.modal1.id$('modal2')
  const el1 = streams.dom$().querySelector('[data-ff-modal]').getAttribute('data-ff-modal')
  t.strictEqual(el1, 'hidden')
})

test('it pushes null to the id stream when backdrop is clicked', t => {
  t.plan(2)
  const streams = initModals()
  streams.state.modal1.id$('modal1')
  t.equal(streams.state.modal1.id$(), 'modal1')
  streams.dom$().querySelector('[data-ff-modal-backdrop]').click()
  t.equal(streams.state.modal1.id$(), null)
})

test('it does not close on non-closeable modals when the backdrop is clicked', t => {
  t.plan(2)
  const streams = initModals()
  streams.state.modal2.id$('modal2')
  t.equal(streams.state.modal2.id$(), 'modal2')
  streams.dom$().querySelectorAll('[data-ff-modal-backdrop]')[1].click()
  t.equal(streams.state.modal2.id$(), 'modal2')
})

test('it pushes null to the id stream when close button is clicked', t => {
  t.plan(2)
  const streams = initModals()
  streams.state.modal1.id$('modal1')
  t.equal(streams.state.modal1.id$(), 'modal1')
  streams.dom$().querySelector('[data-ff-modal-close-button]').click()
  t.equal(streams.state.modal1.id$(), null)
})

test('it vertically centers', t => {
  t.plan(1)
  const id$ = flyd.stream()
  const state = {
    id$: flyd.stream('flimflam')
  , thisID: 'flimflam'
  , title: 'Title Goes Here'
  , body: "Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there "
  , footer: 'what!'
  }

  const view = state => h('div', [ modal(state) ])
  const container = document.createElement('div')
  document.body.appendChild(container)

  const streams = render({state, view, patch, container})
  const body = streams.dom$().querySelector('[data-ff-modal-body]')
  t.ok(body.offsetHeight > 0)
})

