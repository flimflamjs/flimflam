const h = require('snabbdom/h').default
const test = require('tape')
const R = require("ramda")
const flyd = require("flyd")
const render = require('../../../render')

const validatedForm = require('../')

function initForm(state) {
  const view = state => {
    const form = validatedForm.form(state)
    const input = validatedForm.field(state)
    return form(h('form', [
      input(h('input', {props: {name: 'email'}}))
    , input(h('input', {props: {name: 'password'}}))
    ]))
  }
  state = validatedForm.init(state)

  const container = document.createElement('div')
  const streams = render(view, state, container)
  streams.state = state
  return streams
}

test('sets invalid state when the field does not satisfy contraints', t => {
  t.plan(1)
  const streams = initForm({ constraints: {email: {email: true, required: true}} })
  const change = new Event('change')
  const input = streams.dom$().querySelector('input')
  input.value = 'xyz'
  input.dispatchEvent(change)
  const state = input.getAttribute('data-ff-field-input')
  t.equal(state, 'invalid')
})

test('it appends an error message when the field is invalid', t => {
  t.plan(1)
  const streams = initForm({ constraints: {email: {email: true, required: true}} })
  const change = new Event('change')
  const input = streams.dom$().querySelector('input')
  input.value = 'xyz'
  input.dispatchEvent(change)
  const err = streams.dom$().querySelector('[data-ff-field-error]')
    .getAttribute('data-ff-field-error')  
  t.equal(err, streams.state.messages.email)
})

test("it clears a field's error message on focus", t => {
  t.plan(2)
  const streams = initForm({ constraints: {email: {email: true, required: true}} })
  const change = new Event('change')
  const input = streams.dom$().querySelector('input')
  input.value = 'xyz'
  input.dispatchEvent(change)
  const state1 = input.getAttribute('data-ff-field-input')
  t.equal(state1, 'invalid')
  const focus = new Event('focus')
  input.dispatchEvent(focus)
  const state2 = input.getAttribute('data-ff-field-input')
  t.equal(state2, 'valid')
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
  t.deepEqual(R.keys(streams.state.errors$()), ['email', 'password'])
})

test('it does not invalidate blank fields that are not required on change', t => {
  t.plan(1)
  const streams = initForm({ constraints: {email: {email: true }} })
  const change = new Event('change')
  const input = streams.dom$().querySelector('input')
  input.dispatchEvent(change)
  const state = input.getAttribute('data-ff-field-input')
  t.equal(state, 'valid')
})
test('it does not invalidate blank fields that are not required on submit', t => {
  t.plan(1)
  const streams = initForm({ constraints: {email: {email: true}} })
  const submit = new Event('submit')
  const form = streams.dom$()
  const input = streams.dom$().querySelector('input')
  form.dispatchEvent(submit)
  const state = input.getAttribute('data-ff-field-input')
  t.equal(state, 'valid')
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
test('matchesField', t => {
  t.plan(2)
  const state = validatedForm.init()
  t.ok(state.validators.matchesField(1, 'y', {y: 1}))
  t.ok(!state.validators.matchesField(1, 'y', {y: 2}))
})
