const test = require('tape')
const R = require("ramda")
const flyd = require("flyd")
const render = require('../../../render')
const h = require('snabbdom/h').default

const modal = require('../')

function initModals(state) {
  const show1$ = flyd.stream()
  const show2$ = flyd.stream()
  state = R.merge({
    modal1: {
      show$: show1$
    , title: 'modal1-title'
    , body: 'modal1-body'
    , footer: 'modal1-footer'
    }
  , modal2: {
      show$: show2$
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
  const streams = render(view, state, container)
  streams.state = state
  return streams
}

test('it sets shown state when show stream is true', t => {
  t.plan(2)
  const streams = initModals()

  streams.state.modal1.show$(true)
  const el1 = streams.dom$().querySelector('[data-ff-modal]').getAttribute('data-ff-modal')
  t.strictEqual(el1, 'shown')

  streams.state.modal2.show$(true)
  const el2 = streams.dom$().querySelectorAll('[data-ff-modal]')[1].getAttribute('data-ff-modal')
  t.strictEqual(el2, 'shown')
})

test('it sets hidden state when show stream contains false', t => {
  t.plan(2)
  const streams = initModals()

  streams.state.modal2.show$(true)
  streams.state.modal2.show$(false)
  const el2 = streams.dom$().querySelectorAll('[data-ff-modal]')[1].getAttribute('data-ff-modal')
  t.strictEqual(el2, 'hidden')

  streams.state.modal1.show$(true)
  streams.state.modal1.show$(false)
  const el1 = streams.dom$().querySelector('[data-ff-modal]').getAttribute('data-ff-modal')
  t.strictEqual(el1, 'hidden')
})

test('the show$ stream contains false when the backdrop is clicked', t => {
  t.plan(1)
  const streams = initModals()
  streams.state.modal1.show$(true)
  streams.dom$().querySelector('[data-ff-modal-backdrop]').click()
  t.equal(streams.state.modal1.show$(), false)
})

test('it does not close on non-closeable modals when the backdrop is clicked', t => {
  t.plan(1)
  const streams = initModals()
  streams.state.modal2.show$(true)
  streams.dom$().querySelectorAll('[data-ff-modal-backdrop]')[1].click()
  t.equal(streams.state.modal2.show$(), true)
})

test('the show$ stream contains false when the close button is clicked', t => {
  t.plan(1)
  const streams = initModals()
  streams.state.modal1.show$(true)
  streams.dom$().querySelector('[data-ff-modal-close-button]').click()
  t.equal(streams.state.modal1.show$(), false)
})

test('it vertically centers', t => {
  t.plan(1)
  const state = {
    show$: flyd.stream(true)
  , title: 'Title Goes Here'
  , body: "Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there Hi there "
  , footer: 'what!'
  }

  const view = state => h('div', [ modal(state) ])
  const container = document.createElement('div')
  document.body.appendChild(container)
  const streams = render(view, state, container)
  const body = streams.dom$().querySelector('[data-ff-modal-body]')
  t.ok(body.offsetHeight > 0)
})

