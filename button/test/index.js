import assert from 'assert'
import R from 'ramda'
import flyd from 'flyd'
import render from '../../render'
import h from 'snabbdom/h'
import snabbdom from 'snabbdom'
import button from '../index.es6'

const patch = snabbdom.init([
  require('snabbdom/modules/class')
, require('snabbdom/modules/props')
, require('snabbdom/modules/style')
, require('snabbdom/modules/eventlisteners')
, require('snabbdom/modules/attributes')
])


function initButton(state) {
  state = R.merge({
    loading$: flyd.stream()
  , error$: flyd.stream()
  , buttonText: 'Submit'
  , loadingText: 'Thinking...'
  }, state || {})

  let container = document.createElement('div')
  let streams = render({state, view: button, patch, container})
  streams.state = state
  return streams
}

suite('button')

test('setting loading true disables the button', () => {
  const streams = initButton()
  streams.state.loading$(true)
  const btn = streams.dom$().querySelector('[data-ff-button]')
  assert.equal(btn.disabled, true)
})

test('setting loading true displays loading text', () => {
  const streams = initButton()
  streams.state.loading$(true)
  const btn = streams.dom$().querySelector('[data-ff-button]')
  assert.equal(btn.textContent, 'Thinking...')
})

