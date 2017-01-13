const assert = require('assert')
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

suite('validated-form')

test('sets invalid class when the field does not satisfy contraints', () => {
  const streams = initForm({ constraints: {email: {email: true, required: true}} })
  const change = new Event('change')
  const input = streams.dom$().querySelector('input')
  input.value = 'xyz'
  input.dispatchEvent(change)
  assert(R.contains('invalid', input.className))
})

test('it appends an error message when the field is invalid', () => {
  const streams = initForm({ constraints: {email: {email: true, required: true}} })
  const change = new Event('change')
  const input = streams.dom$().querySelector('input')
  input.value = 'xyz'
  input.dispatchEvent(change)
  const errElm = streams.dom$().querySelector('[data-ff-field-error]')
  assert.equal(errElm.textContent, streams.state.messages.email)
})

test("it clears a field's error message on focus", () => {
  const streams = initForm({ constraints: {email: {email: true, required: true}} })
  const change = new Event('change')
  const input = streams.dom$().querySelector('input')
  input.value = 'xyz'
  input.dispatchEvent(change)
  const focus = new Event('focus')
  input.dispatchEvent(focus)
  assert(!R.contains('invalid', input.className))
})

test("it finds the first error on submit", () => {
  const streams = initForm({ constraints: {
    email: {email: true, required: true}
  , password: {required: true, minLength: 7}
  } })
  const submit = new Event('submit')
  const form = streams.dom$()
  form.dispatchEvent(submit)
  assert.deepEqual(R.keys(streams.state.errors$()), ['email'])
})

test('it does not invalidate blank fields that are not required on change', () => {
  const streams = initForm({ constraints: {email: {email: true }} })
  const change = new Event('change')
  const input = streams.dom$().querySelector('input')
  input.dispatchEvent(change)
  assert(!R.contains('invalid', input.className))
})
test('it does not invalidate blank fields that are not required on submit', () => {
  const streams = initForm({ constraints: {email: {email: true}} })
  const submit = new Event('submit')
  const form = streams.dom$()
  const input = streams.dom$().querySelector('input')
  form.dispatchEvent(submit)
  assert(!R.contains('invalid', input.className))
})

test('it gives data hash on valid submit', () => {
  const streams = initForm({ constraints: {email: {email: true}} })
  const submit = new Event('submit')
  const change = new Event('change')
  const form = streams.dom$()
  const em = 'user@example.com'
  const input = streams.dom$().querySelector('input')
  input.value = em
  input.dispatchEvent(change)
  form.dispatchEvent(submit)
  assert.deepEqual(streams.state.validData$(), {email: em})
})

// -- tests of validator functions

suite('validated-form/validators')

test('email', () => {
  const state = validatedForm.init()
  assert(state.validators.email('user@example.com'))
  assert(!state.validators.email('xxyy'))
})
test('required', () => {
  const state = validatedForm.init()
  assert(state.validators.required('user@example.com'))
  assert(state.validators.required(0))
  assert(!state.validators.required(null))
  assert(!state.validators.required(undefined))
  assert(!state.validators.required(''))
})
test('currency', () => {
  const state = validatedForm.init()
  assert(state.validators.currency('$10.00'))
  assert(state.validators.currency('10.00'))
  assert(state.validators.currency('10'))
  assert(!state.validators.currency('10.0'))
  assert(!state.validators.currency('.0'))
  assert(!state.validators.currency('x'))
})
test('format', () => {
  const state = validatedForm.init()
  assert(state.validators.format(/xyz/, 'xyz'))
  assert(!state.validators.format(/xyz/, 'zyx'))
})
test('isNumber', () => {
  const state = validatedForm.init()
  assert(state.validators.isNumber(123))
  assert(state.validators.isNumber('123'))
  assert(state.validators.isNumber('123.0000'))
  assert(state.validators.isNumber('000123.0000'))
  assert(!state.validators.isNumber('x123'))
})
test('max', () => {
  const state = validatedForm.init()
  assert(state.validators.max(9, 10))
  assert(state.validators.max(10, 10))
  assert(!state.validators.max(11, 10))
})
test('min', () => {
  const state = validatedForm.init()
  assert(state.validators.min(11, 10))
  assert(state.validators.min(10, 10))
  assert(!state.validators.min(9, 10))
})
test('equalTo', () => {
  const state = validatedForm.init()
  assert(state.validators.equalTo(10, 10))
  assert(!state.validators.equalTo(9, 10))
})
test('maxLength', () => {
  const state = validatedForm.init()
  assert(state.validators.maxLength([1,1], 3))
  assert(state.validators.maxLength([1,1,1], 3))
  assert(!state.validators.maxLength([1,1,1,1], 3))
})
test('minLength', () => {
  const state = validatedForm.init()
  assert(state.validators.minLength([1,1,1], 3))
  assert(state.validators.minLength([1,1,1,1], 3))
  assert(!state.validators.minLength([1,1], 3))
})
test('lengthEquals', () => {
  const state = validatedForm.init()
  assert(state.validators.lengthEquals([1,1,1], 3))
  assert(!state.validators.lengthEquals([1,1], 3))
})
test('includedIn', () => {
  const state = validatedForm.init()
  assert(state.validators.includedIn(1, [1,1,1]))
  assert(!state.validators.includedIn(3, [1,1,1]))
})


