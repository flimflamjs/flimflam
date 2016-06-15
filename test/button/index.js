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

var button = require('../../button')

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
  var streams = initButton()
  streams.state.loading$(true)
  var btn = streams.dom$().querySelector('.ff-button')
  assert.equal(btn.disabled, true)
})

test('setting loading true displays loading text', () => {
  var streams = initButton()
  streams.state.loading$(true)
  var btn = streams.dom$().querySelector('.ff-button')
  assert.equal(btn.textContent, 'Thinking...')
})

