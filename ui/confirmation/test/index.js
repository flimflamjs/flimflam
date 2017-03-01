const flyd = require('flyd')
const h  = require('snabbdom/h').default
const test = require('tape')
const render = require('../../../render')
const confirmation = require('../')

function initComponent() {
  const container = document.createElement('div')
  const openConf$ = flyd.stream()
  const state = {
    conf: confirmation.init(openConf$)
  , openConf$
  }
  const view = state => h('div', [
    confirmation.view(state.conf, {
      prompt: 'custom prompt'
    , confirmText: 'yeup'
    , denyText: 'noooooo'
    })
  ])
  const streams = render(view, state, container)
  streams.container = container
  streams.state = state
  return streams
}

test('it sets the prompt', t => {
  t.plan(1)
  const streams = initComponent()
  const text = streams.container.querySelector('[data-ff-confirmation-prompt]').textContent
  t.equal(text, 'custom prompt')
})

test('it sets the confirm text', t => {
  t.plan(1)
  const streams = initComponent()
  const text = streams.container.querySelector('[data-ff-confirmation-button="yes"]').textContent
  t.equal(text, 'yeup')
})

test('it sets the deny text', t => {
  t.plan(1)
  const streams = initComponent()
  const text = streams.container.querySelector('[data-ff-confirmation-button="no"]').textContent
  t.equal(text, 'noooooo')
})

test('emitting truthy in the open confirmation streams sets the modal stream', t => {
  t.plan(1)
  const streams = initComponent()
  streams.state.openConf$(true)
  t.equal(streams.state.conf.showModal$(), true)
})

test('responding to the confirmation sets the modal stream to false', t => {
  t.plan(1)
  const streams = initComponent()
  streams.state.openConf$(true)
  streams.dom$().querySelector('button').click()
  t.equal(streams.state.conf.showModal$(), false)
})

test('clicking yes emits true in confirm$', t => {
  t.plan(2)
  const streams = initComponent()
  streams.container.querySelector('[data-ff-confirmation-button="yes"]').click()
  t.equal(streams.state.conf.confirmed$(), true)
  t.equal(streams.state.conf.denied$(), undefined)
})

test('clicking no emits true in denied$', t => {
  t.plan(2)
  const streams = initComponent()
  streams.container.querySelector('[data-ff-confirmation-button="no"]').click()
  t.equal(streams.state.conf.denied$(), true)
  t.equal(streams.state.conf.confirmed$(), undefined)
})

test('clicking no emits false in response$', t => {
  t.plan(1)
  const streams = initComponent()
  streams.container.querySelector('[data-ff-confirmation-button="no"]').click()
  t.equal(streams.state.conf.response$(), false)
})

test('clicking yes emits true in response$', t => {
  t.plan(1)
  const streams = initComponent()
  streams.container.querySelector('[data-ff-confirmation-button="yes"]').click()
  t.equal(streams.state.conf.response$(), true)
})

