import flyd from 'flyd'
import R from 'ramda'
import test from 'tape'
import h from 'snabbdom/h'
import snabbdom from 'snabbdom'
import tabswap from '../index.es6'
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
    tabswap({
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

test('it renders the labels', t=> {
  t.plan(1)
  const streams = init()
  const labels = streams.container.querySelectorAll('[data-ff-tabswap-label]')
  document.body.appendChild(streams.container)
  t.strictEqual(labels.length, 2)
})

test('it renders the content', t=> {
  t.plan(1)
  const streams = init()
  const content = streams.container.querySelectorAll('[data-ff-tabswap-content]')
  t.strictEqual(content.length, 2)
})

test('it renders the text content', t=> {
  t.plan(1)
  const streams = init()
  const content = streams.container.textContent
  t.strictEqual(content, 'abcontent acontent b')
})

test('on click of a label, it swaps data states of labels', t=> {
  t.plan(1)
  const streams = init()
  const content = streams.container.textContent
  streams.container.querySelectorAll('[data-ff-tabswap-label]')[1].click()
  const states = R.map(
    node => node.getAttribute('data-ff-tabswap-label')
  , streams.container.querySelectorAll('[data-ff-tabswap-label]')
  )
  t.deepEqual(states, ['inactive', 'active'])
})

test('on click of a label, it swaps data states of content', t=> {
  t.plan(1)
  const streams = init()
  const content = streams.container.textContent
  streams.container.querySelectorAll('[data-ff-tabswap-label]')[1].click()
  const states = R.map(
    node => node.getAttribute('data-ff-tabswap-content')
  , streams.container.querySelectorAll('[data-ff-tabswap-content]')
  )
  t.deepEqual(states, ['inactive', 'active'])
})
