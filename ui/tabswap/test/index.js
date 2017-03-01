const flyd = require('flyd')
const R = require('ramda')
const test = require('tape')
const h = require('snabbdom/h').default
const tabswap = require('../')
const render = require('../../../render')

function init(labelOptions) {
  const state = {
    active$: flyd.stream(1)
  }
  const view = state => h('div', [
    tabswap.labels(R.merge({
      names: ['a', 'b']
    , active$: state.active$
    }, labelOptions))
  , tabswap.content({
      sections: ['content a', 'content b']
    , active$: state.active$
    })
  ])
  const container = document.createElement('div')
  let streams = render(view, state, container)
  streams.container = container
  streams.state = state
  return streams
}

test('it renders the labels', t=> {
  t.plan(1)
  const streams = init()
  const labels = streams.container.querySelectorAll('[data-ff-tabswap-label]')
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

test('it sets the width of the label wrappers when setWidth option is true', t=> {
  t.plan(1)
  const streams = init({setWidth: true})
  const label = streams.container.querySelector('[data-ff-tabswap-label-wrapper]')
  t.strictEqual(label.style.width, '50%')
})

test('it does not set the width of the label wrappers when setWidth option is false', t=> {
  t.plan(1)
  const streams = init()
  const label = streams.container.querySelector('[data-ff-tabswap-label-wrapper]')
  t.strictEqual(label.style.width, '')
})

