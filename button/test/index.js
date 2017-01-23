import test from 'tape'
import R from 'ramda'
import flyd from 'flyd'
import render from 'flimflam-render'
import h from 'snabbdom/h'
import button from '../index.es6'


function initButton(state) {
  state = R.merge({
    loading$: flyd.stream()
  , error$: flyd.stream()
  , buttonText: 'Submit'
  , loadingText: 'Thinking...'
  }, state || {})

  const container = document.createElement('div')
  var streams = render(button, state, container)
  streams.state = state
  return streams
}

test('setting loading true disables the button', t => {
  t.plan(1)
  const streams = initButton()
  streams.state.loading$(true)
  const btn = streams.dom$().querySelector('[data-ff-button]')
  t.equal(btn.disabled, true)
})

test('setting loading true displays loading text', t => {
  t.plan(1)
  const streams = initButton()
  streams.state.loading$(true)
  const btn = streams.dom$().querySelector('[data-ff-button]')
  t.equal(btn.textContent, 'Thinking...')
})
