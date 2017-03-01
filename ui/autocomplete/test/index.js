const h = require('snabbdom/h').default
const test = require('tape')
const render = require('../../../render')

const autocomplete = require('../')

function init() {
  const container = document.createElement('div')
  const state = {
    autocomplete: autocomplete.init({values: ['finn','frank','filbert','finnish','french']})
  }
  const view = state => h('div', [autocomplete.view(h('input', {props: {type: 'text', name: 'test'}}), state.autocomplete)])
  const streams = render(view, state, container)
  streams.container = container
  streams.state = state
  return streams
}

test('test', t=> {
  t.plan(1)
  const streams = init()
  document.body.appendChild(streams.container)
  t.equal(0,0)
})
