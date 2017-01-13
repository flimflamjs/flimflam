import flyd from 'flyd'
import button from '../index.es6'
import R from 'ramda'
import snabbdom from 'snabbdom'
import h from 'snabbdom/h'
import assert from 'assert'
import render from '../../render'

import '../index.css'

const patch = snabbdom.init([
  require("snabbdom/modules/class")
, require("snabbdom/modules/style")
, require("snabbdom/modules/props")
, require("snabbdom/modules/eventlisteners")
, require("snabbdom/modules/attributes")
])

function init() {
  const container = document.createElement('div')
  const state = {loading$: flyd.stream(false)}
  const view = state => h('div', [
    h('form', {
      on: {submit: [state.loading$, true]}
    }, [
      button({loading$: state.loading$})
    ])
  ])
  const streams = render({container, view, state, patch})
  streams.container = container
  streams.state = state
  return streams
}

test('test', ()=> {
  const streams = init()
  document.body.appendChild(streams.container)
  assert.equal(0,0)
})
