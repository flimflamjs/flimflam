const R = require('ramda')
const h = require('snabbdom/h').default
const serializeForm  = require('form-serialize')
const mergeVNodes = require('snabbdom-merge')

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

function init(config={}) {
  const validators = R.merge(defaultValidators, config.validators || {})
  const messages = R.merge(defaultMessages, config.messages || {})
  const constraints = config.constraints || {}

  // Stream of all errors scanned into one object
  const errors$ = flyd.stream({})

  // Stream of all user-inputted data scanned into one object
  const data$ = flyd.stream({})
  const invalidSubmit$ = flyd.stream()
  const validSubmit$ = flyd.stream()
  const validData$ = flyd.stream()

  return {
    constraints
  , validators
  , messages
  , errors$
  , validSubmit$
  , validData$
  , data$
  , invalidSubmit$
  }
}

const handleSubmit = state => ev => {
  ev.preventDefault()
  const err = validateForm(state, ev.currentTarget)
  const data = serializeForm(ev.currentTarget, {hash: true})
  state.data$(data)
  if(err) {
    const updatedErrors = R.assoc(err[0], err[1], state.errors$())
    state.errors$(updatedErrors)
    state.invalidSubmit$(true)
  } else {
    state.validSubmit$(true)
    state.validData$(data)
  }
}

const handleChange = state => ev => {
  const err = validateField(state, ev.currentTarget)
  if(err) {
    const updatedErrors = R.assoc(err[0], err[1], state.errors$())
    state.errors$(updatedErrors)
  }
  const [name, value] = [ev.currentTarget.name, ev.currentTarget.value]
  const updatedData = R.assoc(name, value, state.data$())
  state.data$(updatedData)
}

const handleFocus = state => ev => {
  // Clear errors on input focus
  state.errors$({})
}

// -- Views

const form = R.curryN(2, (state, node) => {
  const vform = h('form', {on: {submit: handleSubmit(state)}})
  var merged = mergeVNodes(vform, node)
  return merged
})


const field = R.curryN(2, (state, node) => {
  const name = R.path(['data', 'props', 'name'], node)
  if(!name) throw new Error("You need to provide a field name for validation (using the 'props.name' property)")
  const err = state.errors$()[name]
  const invalid = err && err.length
  const vfield = h(node.sel, {
    on: {
      focus: handleFocus(state)
    , change: handleChange(state)
    }
  , attrs: {
      'data-ff-field-input': invalid ? 'invalid' : 'valid'
    , 'data-ff-field-error': err
    }
  })
  return mergeVNodes(vfield, node)
})

// Pass in an array of validation functions and the event object
// Will return a pair of [name, errorMsg] (errorMsg will be null if no errors present)
const validateField = R.curryN(2, (state, node) => {
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
    } else if(!state.validators[valName](value, arg, state.data$())) {
      const msg = getErrMsg(state.messages, name, valName, arg)
      return [name, String(msg)]
    }
  }
  return [name, null] // no error found
})

// Retrieve errors for the entire set of form data, used on form submit events,
// using the form data saved into the state
const validateForm = R.curryN(2, (state, node) => {
  const formData = serializeForm(node, {hash: true})
  // For every field name in the provided contraints
  for(const fieldName in state.constraints) { 
    const value = state.data$()[fieldName]
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
, currency: 'Please enter valid amount'
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
