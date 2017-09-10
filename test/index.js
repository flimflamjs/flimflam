const test = require('tape')
const flyd = require("flyd")
const h = require('snabbdom/h').default
const render = require('../index.js')

test('will render static data', t => {
  t.plan(1)
  const container = document.createElement('div')
  const view = state => h('p', state.x)
  const state = {x: 'hallo!'}
  const streams = render(view, state, container)
  t.equal(streams.dom$().textContent, 'hallo!')
})

test('it will render stream data', t => {
  t.plan(1)
  const container = document.createElement('div')
  const state = {streamVal: flyd.stream('wat!!')}
  const view = state => h('p', state.streamVal())
  const streams = render(view, state, container)
  t.equal(streams.dom$().textContent, 'wat!!')
})

test('it will patch on new stream data over time', t => {
  t.plan(2)
  const container = document.createElement('div')
  const view = state => h('p', state.streamVal())
  const s = flyd.stream('wat!!')
  const state = {streamVal: s}
  const streams = render(view, state, container)
  t.equal(streams.dom$().textContent, 'wat!!')
  s('goodbye')
  t.equal(streams.dom$().textContent, 'goodbye')
})

test('it patches on nested streams', t => {
  t.plan(2)
  const container = document.createElement('div')
  const view = state => h('p', [view2(state.x.y.z.s)])
  const view2 = s => h('span', s())
  const s = flyd.stream('wat!!')
  const state = {x: {y: {z: {s}}}}
  const streams = render(view, state, container)
  t.equal(streams.dom$().textContent, 'wat!!')
  s('bye')
  t.equal(streams.dom$().textContent, 'bye')
})

test('it patches with multiple empty streams', t => {
  t.plan(3)
  const container = document.createElement('div')
  const view = state => h('p', state.s1() || 'hi')
  const state = {s1: flyd.stream(), s2: flyd.stream()}
  const streams = render(view, state, container)
  t.equal(streams.dom$().textContent, 'hi')
  state.s1('x')
  t.equal(streams.dom$().textContent, 'x')
  state.s2('y')
  state.s1('z')
  t.equal(streams.dom$().textContent, 'z')
})

