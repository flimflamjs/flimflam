const test = require('tape')
const R = require("ramda")
const flyd = require("flyd")
const render = require('../../render')
const h = require('snabbdom/h')
const snabbdom =require('snabbdom')
const patch = snabbdom.init([ // Init patch function with choosen modules
  require('snabbdom/modules/class') // makes it easy to toggle classes
, require('snabbdom/modules/props') // for setting properties on DOM elements
, require('snabbdom/modules/style') // handles styling on elements with support for animations
, require('snabbdom/modules/eventlisteners') // attaches event listeners
, require('snabbdom/modules/attributes')
])

const validatedForm = require('../index.es6')

function initForm(state) {
  const view = state =>
    validatedForm.form(state, h('form', [
      validatedForm.field(state, h('input', {
        props: {name: 'email'}
      }))
    , validatedForm.field(state, h('input', {
        props: {name: 'password'}
      }))
    ]))

  state = validatedForm.init(state)

  let container = document.createElement('div')
  let streams = render({state, view, patch, container})
  streams.state = state
  return streams
}

test('sets invalid class when the field does not satisfy contraints', t => {
  t.plan(1)
  const streams = initForm({ constraints: {email: {email: true, required: true}} })
  const change = new Event('change')
  const input = streams.dom$().querySelector('input')
  input.value = 'xyz'
  input.dispatchEvent(change)
  t.ok(R.contains('invalid', input.className))
})

test('it appends an error message when the field is invalid', t => {
  t.plan(1)
  const streams = initForm({ constraints: {email: {email: true, required: true}} })
  const change = new Event('change')
  const input = streams.dom$().querySelector('input')
  input.value = 'xyz'
  input.dispatchEvent(change)
  const errElm = streams.dom$().querySelector('[data-ff-field-error]')
  t.equal(errElm.textContent, streams.state.messages.email)
})

test("it clears a field's error message on focus", t => {
  t.plan(1)
  const streams = initForm({ constraints: {email: {email: true, required: true}} })
  const change = new Event('change')
  const input = streams.dom$().querySelector('input')
  input.value = 'xyz'
  input.dispatchEvent(change)
  const focus = new Event('focus')
  input.dispatchEvent(focus)
  t.ok(!R.contains('invalid', input.className))
})

test("it finds the first error on submit", t => {
  t.plan(1)
  const streams = initForm({ constraints: {
    email: {email: true, required: true}
  , password: {required: true, minLength: 7}
  } })
  const submit = new Event('submit')
  const form = streams.dom$()
  form.dispatchEvent(submit)
  t.deepEqual(R.keys(streams.state.errors$()), ['email'])
})

test('it does not invalidate blank fields that are not required on change', t => {
  t.plan(1)
  const streams = initForm({ constraints: {email: {email: true }} })
  const change = new Event('change')
  const input = streams.dom$().querySelector('input')
  input.dispatchEvent(change)
  t.ok(!R.contains('invalid', input.className))
})
test('it does not invalidate blank fields that are not required on submit', t => {
  t.plan(1)
  const streams = initForm({ constraints: {email: {email: true}} })
  const submit = new Event('submit')
  const form = streams.dom$()
  const input = streams.dom$().querySelector('input')
  form.dispatchEvent(submit)
  t.ok(!R.contains('invalid', input.className))
})

test('it gives data hash on valid submit', t => {
  t.plan(1)
  const streams = initForm({ constraints: {email: {email: true}} })
  const submit = new Event('submit')
  const change = new Event('change')
  const form = streams.dom$()
  const em = 'user@example.com'
  const input = streams.dom$().querySelector('input')
  input.value = em
  input.dispatchEvent(change)
  form.dispatchEvent(submit)
  t.deepEqual(streams.state.validData$(), {email: em})
})

// -- tests of validator functions

test('email', t => {
  t.plan(2)
  const state = validatedForm.init()
  t.ok(state.validators.email('user@example.com'))
  t.ok(!state.validators.email('xxyy'))
})
test('required', t => {
  t.plan(5)
  const state = validatedForm.init()
  t.ok(state.validators.required('user@example.com'))
  t.ok(state.validators.required(0))
  t.ok(!state.validators.required(null))
  t.ok(!state.validators.required(undefined))
  t.ok(!state.validators.required(''))
})
test('currency', t => {
  t.plan(6)
  const state = validatedForm.init()
  t.ok(state.validators.currency('$10.00'))
  t.ok(state.validators.currency('10.00'))
  t.ok(state.validators.currency('10'))
  t.ok(!state.validators.currency('10.0'))
  t.ok(!state.validators.currency('.0'))
  t.ok(!state.validators.currency('x'))
})
test('format', t => {
  t.plan(2)
  const state = validatedForm.init()
  t.ok(state.validators.format(/xyz/, 'xyz'))
  t.ok(!state.validators.format(/xyz/, 'zyx'))
})
test('isNumber', t => {
  t.plan(5)
  const state = validatedForm.init()
  t.ok(state.validators.isNumber(123))
  t.ok(state.validators.isNumber('123'))
  t.ok(state.validators.isNumber('123.0000'))
  t.ok(state.validators.isNumber('000123.0000'))
  t.ok(!state.validators.isNumber('x123'))
})
test('max', t => {
  t.plan(3)
  const state = validatedForm.init()
  t.ok(state.validators.max(9, 10))
  t.ok(state.validators.max(10, 10))
  t.ok(!state.validators.max(11, 10))
})
test('min', t => {
  t.plan(3)
  const state = validatedForm.init()
  t.ok(state.validators.min(11, 10))
  t.ok(state.validators.min(10, 10))
  t.ok(!state.validators.min(9, 10))
})
test('equalTo', t => {
  t.plan(2)
  const state = validatedForm.init()
  t.ok(state.validators.equalTo(10, 10))
  t.ok(!state.validators.equalTo(9, 10))
})
test('maxLength', t => {
  t.plan(3)
  const state = validatedForm.init()
  t.ok(state.validators.maxLength([1,1], 3))
  t.ok(state.validators.maxLength([1,1,1], 3))
  t.ok(!state.validators.maxLength([1,1,1,1], 3))
})
test('minLength', t => {
  t.plan(3)
  const state = validatedForm.init()
  t.ok(state.validators.minLength([1,1,1], 3))
  t.ok(state.validators.minLength([1,1,1,1], 3))
  t.ok(!state.validators.minLength([1,1], 3))
})
test('lengthEquals', t => {
  t.plan(2)
  const state = validatedForm.init()
  t.ok(state.validators.lengthEquals([1,1,1], 3))
  t.ok(!state.validators.lengthEquals([1,1], 3))
})
test('includedIn', t => {
  t.plan(2)
  const state = validatedForm.init()
  t.ok(state.validators.includedIn(1, [1,1,1]))
  t.ok(!state.validators.includedIn(3, [1,1,1]))
})


