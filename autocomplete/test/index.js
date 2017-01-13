import autocomplete from '../index.es6'
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
  const state = {
    autocomplete: autocomplete.init({values: ['finn','frank','filbert','finnish','french']})
  }
  const view = state => h('div', [autocomplete.view(h('input', {props: {type: 'text', name: 'test'}}), state.autocomplete)])
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
