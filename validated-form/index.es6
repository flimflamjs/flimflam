//npm
const R = require('ramda')
const h = require('snabbdom/h').default
const serializeForm  = require('form-serialize')
const mergeVNodes = require('snabbdom-merge')
const flyd  = require('flyd')
flyd.filter = require('flyd/module/filter')
flyd.mergeAll = require('flyd/module/mergeall')
flyd.sampleOn = require('flyd/module/sampleon')
flyd.scanMerge = require('flyd/module/scanmerge')
//local
const emailRegex = require('./email-regex')
const currencyRegex = require('./currency-regex')

function init(config={}) {
  const events = {change$: flyd.stream(), submit$: flyd.stream(), focus$: flyd.stream()}
  const userData = config.userData || flyd.stream()
  const constraints = config.constraints
  const messages = R.merge(defaultMessages, config.messages)
  const validators = R.merge(defaultValidators, config.validators)
  const data$ = flyd.scanMerge([
    [config.data$,           (data, newData) => newData]
  , [events.change$,         setChangedData]
  ], {})

  // Partially apply validate function to configure it
  const validateChangeConfigured = validateChange({constraints, validators, messages, data$})
  const validateSubmitConfigured = validateSubmit({constraints, validators, messages})
  // Stream of an object of error messages, where the keys are field names and values are string error messages
  const errors$ = flyd.scanMerge([
    [events.change$, validateChangeConfigured]
  , [events.focus$,  R.always({})]
  , [events.submit$, validateSubmitConfigured]
  ], {})

  // Stream of all user-inputted data scanned into one object
  const submitErrs$ = flyd.sampleOn(events.submit$, errors$)
  const validSubmit$ = flyd.filter(R.empty, submitErrs$)
  const notEmpty = R.compose(R.not, R.empty)
  const invalidSubmit$ = flyd.filter(notEmpty, submitErrs$)
  const validData$ = flyd.sampleOn(validSubmit$, data$)

  return {
    constraints
  , validators
  , messages
  , errors$
  , validSubmit$
  , validData$
  , data$
  , invalidSubmit$
  , events
  }
}

const validateChange = config => (errors, changeEvent) => {
  const node = changeEvent.currentTarget
  const [fieldName, value] = [node.name, node.value]
  config.fullData = config.data$()
  return validateField(config, errors, fieldName, value)
}

const validateSubmit = config => (errors, submitEvent) => {
  const node = submitEvent.currentTarget
  config.fullData = serializeForm(node, {hash: true})
  for(const fieldName in config.constraints) {
    const value = config.fullData[fieldName]
    errors = validateField(config, errors, fieldName, value)
  }
  // For loop completed: no additional errors found
  return errors
}

const validateField = (config, errors, fieldName, value) => {
  // Do not validate non-required blank fields
  if(!config.constraints[fieldName] || (!config.constraints[fieldName].required && valIsUnset(value))) return errors
  // Find the first constraint that fails its validator 
  for(const validatorName in config.constraints[fieldName]) {
    const err = getErrorMessage(config, validatorName, fieldName, value, config.fullData)
    if(err) return R.assoc(fieldName, err, errors)
  }
  // For loop completed: no additional errors found
  return errors
}

// Returns an error message if invalid and false if valid
const getErrorMessage = (config, validatorName, fieldName, value, fullData) => {
  const arg = config.constraints[fieldName][validatorName]
  if(config.validators[validatorName]) {
    const isValid = config.validators[validatorName](value, arg, fullData)
    if(!isValid) {
      return getErrMsg(config.messages, fieldName, validatorName, arg)
    }
  }
  return false
}

const setChangedData = (data, changeEvent) => {
  const node = changeEvent.currentTarget
  const name = node.name
  const value = node.value
  return R.assoc(name, value, data)
}

const handleFocus = state => ev => {
  // Clear errors on input focus
  state.errors$({})
}

// -- Views

const form = R.curryN(2, (state, node) => {
  const vform = h('form', {on: {submit: state.events.submit$}})
  return mergeVNodes(vform, node)
})


const field = R.curryN(2, (state, node) => {
  const name = R.path(['data', 'props', 'name'], node)
  if(!name) throw new Error("You need to provide a field name for validation (using the 'props.name' property)")
  const err = state.errors$()[name]
  const invalid = err && err.length
  const vfield = h(node.sel, {
    on: {
      focus: state.events.focus$
    , change: state.events.change$
    }
  , attrs: {
      'data-ff-field-input': invalid ? 'invalid' : 'valid'
    , 'data-ff-field-error': err
    }
  })
  return mergeVNodes(vfield, node)
})

// Given the messages object, the field name, and the validator name, and the validator argument
// Retrieve and apply the error message function
const getErrMsg = (messages, name, validatorName, arg) => {
  const err = 
    messages[name] && messages[name][validatorName] ? messages[name][validatorName]
  : messages[validatorName]                         ? messages[validatorName]
  : messages[name]                                  ? messages[name]
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
