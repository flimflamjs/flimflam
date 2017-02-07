const R = require('ramda')
const h = require('snabbdom/h')
const serializeForm  = require('form-serialize')

const flyd  = require('flyd')
flyd.filter = require('flyd/module/filter')
flyd.mergeAll = require('flyd/module/mergeall')
flyd.sampleOn = require('flyd/module/sampleon')
flyd.scanMerge = require('flyd/module/scanmerge')

const emailRegex = require('./email-regex')
const currencyRegex = require('./currency-regex')

// constraints: a hash of key/vals where each key is the name of an input
// and each value is an object of validator names and arguments
//
// validators: a hash of validation names mapped to boolean functions
//
// messages: a hash of validator names and field names mapped to error messages 
//
// messages match to validation errors hierarchically:
// - first checks if there is an exact match on both field name and validator name
// - then checks for a match on just the field name
// - then checks for a match on the validator name
//
// Given a constraint like:
// {name: {required: true}}
//
// All of the following will set an error for above, starting with most specific first:
// {name: {required: 'Please enter a valid name'}
// {name: 'Please enter your name'}
// {required: 'This is required'}

function init(config) {
  config = config || {}
  let state = {
    focus$:  flyd.stream()
  , change$: flyd.stream()
  , submit$: flyd.stream()
  , formData$: config.formData$ || flyd.stream({})
  }
  state.validators = R.merge(defaultValidators, config.validators || {})
  state.messages = R.merge(defaultMessages, config.messages || {})
  state.constraints = config.constraints || {}

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
  // Stream of all user-inputted data scanned into one object
  state.userData$ = flyd.scanMerge([
    [state.nameVal$, (data, pair) => R.assoc(pair[0], pair[1], data)]  // change sets a single key/val into data
  , [state.submit$, (data, form) => serializeForm(form, {hash: true})] // submit overrides all data by serializing the whole form
  ], state.formData$() || {})

  state.invalidSubmit$ = flyd.filter(R.apply((key, val) => val), submitErr$)
  state.validSubmit$ = flyd.filter(R.apply((key, val) => !val), submitErr$)
  state.validData$ = flyd.sampleOn(state.validSubmit$, state.userData$)

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

const form = R.curryN(4, (state, sel, data={}, children=[]) => {
  let elm = h('form', data, children)
  elm.data = R.merge(data, {
    on: {
      submit: ev => {
        if(data.on && data.on.submit) data.on.submit(ev)
        ev.preventDefault()
        state.submit$(ev.currentTarget)
      }
    }
  })
  return elm
})


// A single form field
// Data takes normal snabbdom data for the input/select/textarea (eg props, style, on)
const field = R.curryN(4, (state, sel, data={}, children=[]) => {
  if(!data.props || !data.props.name) throw new Error("You need to provide a field name for validation (using the 'props.name' property)")
  const err = state.errors$()[data.props.name]
  const invalid = err && err.length

  const elm = h(sel, R.merge(data, {
    on: {
      focus: state.focus$
    , change: ev => state.change$(ev.currentTarget)
    }
  , props: R.merge({
      value: state.formData$()[data.props.name]
    }, data.props)
  , attrs: {'data-ff-field-input': invalid ? 'invalid' : 'valid'}
  }))

  return h('div', {
    attrs: {
      'data-ff-field': invalid ? 'invalid' : 'valid'
    , 'data-ff-field-error': err ? err : ''
    }
  , hook: {insert: scrollToThis} 
  }, [elm])
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
    } else if(!state.validators[valName](value, arg, state.userData$())) {
      const msg = getErrMsg(state.messages, name, valName, arg)
      return [name, String(msg)]
    }
  }
  return [name, null] // no error found
})

// Retrieve errors for the entire set of form data, used on form submit events,
// using the form data saved into the state
const validateForm = R.curry((state, node) => {
  const formData = serializeForm(node, {hash: true})
  // For every field name in the provided contraints
  for(const fieldName in state.constraints) { 
    const value = state.userData$()[fieldName]
    // Skip the validation of non-required fields that are missing
    if(state.constraints[fieldName] && (state.constraints[fieldName].required || !valIsUnset(value))) { 
      for(const valName in state.constraints[fieldName]) {
        const arg = state.constraints[fieldName][valName]
        if(!state.validators[valName]) {
          console.warn("Form validator function does not exist:", valName)
        } else if(!state.validators[valName](value, arg, formData)) {
          const msg = getErrMsg(state.messages, fieldName, valName, arg)
          return [fieldName, String(msg)]
        }
      }
    }
  }
})

// Given the messages object, the field name, and the validator name, and the validator argument
// Retrieve and apply the error message function
const getErrMsg = (messages, name, valName, arg) => {
  const err = 
    messages[name] && messages[name][valName] ? messages[name][valName]
  : messages[valName]                         ? messages[valName]
  : messages[name]                            ? messages[name]
  : messages.fallback
  if(typeof err === 'function') return err(arg)
  else return err
}

const defaultMessages = {
  fallback: 'This looks invalid'
, email: 'Please enter a valid email address'
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
, matchesField: n => `This field should match the ${n} field`
}

// Does a field value match another field value, given the other's name and the full form data?
const matchesField = (val, otherName, data) => {
  const otherVal = data[otherName]
  return val === otherVal
}

const defaultValidators = {
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
, matchesField
}

// Test for an unset value
// Can't use just !val because we want 0 to be true
const valIsUnset = val =>
  val === undefined || val === '' || val === null

module.exports = {init, field, form}
