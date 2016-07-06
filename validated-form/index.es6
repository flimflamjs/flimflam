import R from 'ramda'
import flyd from 'flyd'
import h from 'snabbdom/h'
import serializeForm from 'form-serialize'
flyd.filter = require('flyd/module/filter')
flyd.mergeAll = require('flyd/module/mergeall')
flyd.sampleOn = require('flyd/module/sampleon')
flyd.scanMerge = require('flyd/module/scanmerge')

import emailRegex from './email-regex.es6'
import currencyRegex from './currency-regex.es6'

// constraints: a hash of key/vals where each key is the name of an input
// and each value is an object of validator names and arguments
//
// validators: a hash of validation names mapped to boolean functions
//
// messages: a hash of validator names and field names mapped to error messages 
//
// messages match on the most specific thing in the messages hash
// - first checks if there is an exact match on field name
// - then checks for match on validator name
//
// Given a constraint like:
// {name: {required: true}}
//
// All of the following will set an error for above, starting with most specific first:
// {name: {required: 'Please enter a valid name'}
// {name: 'Please enter your name'}
// {required: 'This is required'}

function init(state) {
  state = state || {}
  state = R.merge({
    focus$:  flyd.stream()
  , change$: flyd.stream()
  , submit$: flyd.stream()
  , validators: {}
  , messages: {}
  , constraints: {}
  } , state )

  state.validators = R.merge(defaultValidators, state.validators)
  state.messages = R.merge(defaultMessages, state.messages)
  state.constraints = state.constraints || {}

  const fieldErr$ = flyd.map(validateField(state), state.change$)
  const submitErr$ = flyd.map(validateForm(state), state.submit$)
  const formErr$ = flyd.filter(R.identity, submitErr$)
  // Clear all errors on input focus
  const clearErr$ = flyd.map(ev => [ev.target.name, null], state.focus$)
  // stream of error pairs of [field_name, error_message]
  const allErrs$ = flyd.mergeAll([fieldErr$, formErr$, clearErr$])
  // Stream of all errors scanned into one object
  state.errors$ = flyd.scan((data, pair) => R.assoc(pair[0], pair[1], data), {}, allErrs$)

  // Stream of field names and new values
  state.nameVal$ = flyd.map(node => [node.name, node.value], state.change$)
  // Stream of all data scanned into one object
  state.data$ = flyd.scanMerge([
    [state.nameVal$, (data, pair) => R.assoc(pair[0], pair[1], data)]  // change sets a single key/val into data
  , [state.submit$, (data, form) => serializeForm(form, {hash: true})] // submit overrides all data by serializing the whole form
  ], state.data || {})

  state.invalidSubmit$ = flyd.filter(R.apply((key, val) => val), submitErr$)
  state.validSubmit$ = flyd.filter(R.apply((key, val) => !val), submitErr$)
  state.validData$ = flyd.sampleOn(state.validSubmit$, state.data$)

  return state
}

// Generate a stream of objects of errors
const errorsStream = state => {
  const fieldErr$ = flyd.map(validateField(state), state.change$)
  const formErr$ = flyd.filter(R.identity, flyd.map(validateForm(state), state.submit$))
  // Clear all errors on input focus
  const clearErr$ = flyd.map(ev => [ev.target.name, null], state.focus$)
  // stream of error pairs of [field_name, error_message]
  const allErrs$ = flyd.mergeAll([fieldErr$, formErr$, clearErr$])
  // Stream of all errors scanned into one object
  return flyd.scan((data, pair) => R.assoc(pair[0], pair[1], data), {}, allErrs$)
}

// -- Views

const form = R.curry((state, elm) => {
  elm.data = R.merge(elm.data, {
    on: {submit: ev => {ev.preventDefault(); state.submit$(ev.currentTarget)}}
  })
  return elm
})


// A single form field
// Data takes normal snabbdom data for the input/select/textarea (eg props, style, on)
const field = R.curry((state, elm) => {
  if(!elm.data.props || !elm.data.props.name) throw new Error("You need to provide a field name for validation (using the 'props.name' property)")
  let err = state.errors$()[elm.data.props.name]
  let invalid = err && err.length

  elm.data = R.merge(elm.data, {
    on: {
      focus: state.focus$
    , change: ev => state.change$(ev.currentTarget)
    }
  , class: { 'ff-field-input--invalid': invalid }
  })

  return h('div.ff-field', {
    class: {'ff-field--invalid': invalid}
  }, [
    invalid 
      ? h('p.ff-field-errorMessage', {
          hook: {insert: scrollToThis}
        }, err) 
    : ''
  , elm
  ])
})


const scrollToThis = vnode => {
  vnode.elm.scrollIntoView({block: 'start', behavior: 'smooth'})
}


// Pass in an array of validation functions and the event object
// Will return a pair of [name, errorMsg] (errorMsg will be null if no errors present)
const validateField = R.curry((state, node) => {
  const value = node.value
  const name = node.name
  if(!state.constraints[name]) return [name, null] // no validators for this field present

  // Do not validate non-required blank fields
  if(!state.constraints[name].required && valIsUnset(value)) return [name, null]

  // Find the first constraint that fails its validator 
  for(var valName in state.constraints[name]) {
    const arg = state.constraints[name][valName]
    if(!state.validators[valName]) {
      console.warn("Form validation constraint does not exist:", valName)
    } else if(!state.validators[valName](value, arg)) {
      const msg = getErr(state.messages, name, valName, arg)
      return [name, String(msg)]
    }
  }
  return [name, null] // no error found
})

// Retrieve errors for the entire set of form data, used on form submit events,
// using the form data saved into the state
const validateForm = R.curry((state, node) => {
  const formData = serializeForm(node, {hash: true})
  for(var fieldName in state.constraints) { 
    const value = state.data$()[fieldName]
    if(state.constraints[fieldName] && (state.constraints[fieldName].required || ! valIsUnset(value))) { // dont validate undefined non-required fields
      for(var valName in state.constraints[fieldName]) {
        const arg = state.constraints[fieldName][valName]
        if(!state.validators[valName]) {
          console.warn("Form validation constraint does not exist:", valName)
        } else if(!state.validators[valName](value, arg)) {
          const msg = getErr(state.messages, fieldName, valName, arg)
          return [fieldName, String(msg)]
        }
      }
    }
  }
})

// Given the messages object, the validator argument, the field name, and the validator name
// Retrieve and apply the error message function
const getErr = (messages, name, valName, arg) => {
  const err = messages[name] 
    ? messages[name][valName] || messages[name]
    : messages[valName]
  if(typeof err === 'function') return err(arg)
  else return err
}

// Test for an unset value
// Can't use just !val because we want 0 to be true
const valIsUnset = val =>
  val === undefined || val === '' || val === null

let defaultMessages = {
  email: 'Please enter a valid email address'
, required: 'This field is required'
, currency: 'Please enter valid currency'
, format: "This doesn't look like the right format"
, isNumber: 'This should be a number'
, max: n => `This should be less than ${n}`
, min: n => `This should be at least ${n}`
, equalTo: n => `This should be equal to ${n}`
, maxLength: n => `This should be no longer than ${n}`
, minLength: n => `This should be longer than ${n}`
, lengthEquals: n => `This should have a length of ${n}`
, includedIn: arr => `This should be one of: ${arr.join(', ')}`
}

let defaultValidators = {
  email: val => String(val).match(emailRegex)
, required: val => !valIsUnset(val)
, currency: val => String(val).match(currencyRegex)
, format: (val, arg) => String(val).match(arg)
, isNumber: val => !isNaN(val)
, max: (val, n) => val <= n
, min: (val, n) => val >= n
, equalTo:  (val, n) => n === val
, maxLength: (val, n) => val.length <= n
, minLength: (val, n) => val.length >= n
, lengthEquals: (val, n) => val.length === n
, includedIn: (val, arr) => arr.indexOf(val) !== -1
}

module.exports = {init, field, form}

