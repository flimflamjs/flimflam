const flyd = require('flyd')
const h = require('snabbdom/h').default
const validatedForm = require('../../ui/validated-form')
const notification = require('../../ui/notification')

const constraints = {
  email: {required: true, email: true}
, age: {required: true, min: 65}
, password: {required: true, minLength: 7}
, password_confirmation: {required: true, matchesField: 'password'}
}
const messages = {
  age: {min: "You must be at least 65 years old! This is a senior's club"}
}

const init = ()=> {
  const form = validatedForm.init({constraints, messages})
  const message$ = flyd.map(()=> 'You made a valid submit! Salud!', form.validSubmit$)
  const notif = notification.init({message$})
  return { form , notif }
}

const view = state => {
  const form = validatedForm.form(state.form)
  return h('div', [
    form(h('form', [
      fieldset(state, 'email', 'text', 'Email address')
    , fieldset(state, 'age', 'number', 'Your age')
    , fieldset(state, 'password', 'password', 'New password')
    , fieldset(state, 'password_confirmation', 'password', 'Confirm password')
    , h('button', 'Create account')
    ]))
  , notification.view(state.notif)
  ])
}

const fieldset = (state, name, type, placeholder) => {
  const field = validatedForm.field(state.form)
  return h('fieldset', [
    h('p', state.form.errors$()[name] || placeholder)
  , field(h('input', { props: {type, name, placeholder} }))
  ])
}

module.exports = {view, init}
