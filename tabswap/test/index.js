import flyd from 'flyd'
import R from 'ramda'
import assert from 'assert'
import h from 'snabbdom/h'
import snabbdom from 'snabbdom'
import carousel from '../index.es6'
import render from '../../render'


const patch = snabbdom.init([
  require("snabbdom/modules/class")
, require("snabbdom/modules/style")
, require("snabbdom/modules/props")
, require("snabbdom/modules/eventlisteners")
, require("snabbdom/modules/attributes")
])

function init() {
  const state = {
    active$: flyd.stream(1)
  }
  const view = state => h('div', [
    carousel({
      labels: ['a', 'b']
    , content: ['content a', 'content b']
    , active$: state.active$
    })
  ])
  const container = document.createElement('div')
  const streams = render({container, patch, view, state})
  streams.container = container
  streams.state = state
  return streams
}

test('it renders the labels', ()=> {
  const streams = init()
  const labels = streams.container.querySelectorAll('[data-ff-tabswap-label]')
  document.body.appendChild(streams.container)
  assert.strictEqual(labels.length, 2)
})

test('it renders the content', ()=> {
  const streams = init()
  const content = streams.container.querySelectorAll('[data-ff-tabswap-content]')
  assert.strictEqual(content.length, 2)
})

test('it renders the text content', ()=> {
  const streams = init()
  const content = streams.container.textContent
  assert.strictEqual(content, 'abcontent acontent b')
})

test('on click of a label, it swaps data states of labels', ()=> {
  const streams = init()
  const content = streams.container.textContent
  streams.container.querySelectorAll('[data-ff-tabswap-label]')[1].click()
  const states = R.map(
    node => node.getAttribute('data-ff-tabswap-label')
  , streams.container.querySelectorAll('[data-ff-tabswap-label]')
  )
  assert.deepEqual(states, ['inactive', 'active'])
})

test('on click of a label, it swaps data states of content', ()=> {
  const streams = init()
  const content = streams.container.textContent
  streams.container.querySelectorAll('[data-ff-tabswap-label]')[1].click()
  const states = R.map(
    node => node.getAttribute('data-ff-tabswap-content')
  , streams.container.querySelectorAll('[data-ff-tabswap-content]')
  )
  assert.deepEqual(states, ['inactive', 'active'])
})
