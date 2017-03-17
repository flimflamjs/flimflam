//npm
var R = require('ramda')
var h = require('snabbdom/h').default
var serializeForm  = require('form-serialize')
var mergeVNodes = require('snabbdom-merge')
var flyd  = require('flyd')
flyd.filter = require('flyd/module/filter')
flyd.mergeAll = require('flyd/module/mergeall')
flyd.scanMerge = require('flyd/module/scanmerge')
//local
var emailRegex = require('./lib/email-regex')
var currencyRegex = require('./lib/currency-regex')

function init(config) {
  config = config || {}
  var events = {change$: flyd.stream(), submit$: flyd.stream(), focus$: flyd.stream()}
  var constraints = config.constraints
  var messages = R.merge(defaultMessages, config.messages)
  var validators = R.merge(defaultValidators, config.validators)

  var serialize = function(ev) { return serializeForm(ev.currentTarget, {hash: true}) }
  var submitData$ = flyd.map(serialize, events.submit$)

  var conf = {constraints: constraints, validators: validators, messages: messages}
  var submitErrs$ = flyd.map(validateSubmitData(conf), submitData$)
  // Stream of an object of error messages, where the keys are field names and values are string error messages
  var errors$ = flyd.scanMerge([
    [events.focus$,  clearError]
  , [submitErrs$,    function(errs, newErrs) {return newErrs}]
  , [events.change$, validateChange(conf)]
  ], {})

  // Stream of all user-inputted data scanned into one object
  var validSubmit$ = flyd.filter(R.isEmpty, submitErrs$)
  var notEmpty = R.compose(R.not, R.isEmpty)
  var invalidSubmit$ = flyd.filter(notEmpty, submitErrs$)
  var validData$ = flyd.map(function() { return submitData$() }, validSubmit$)

  return {
    constraints: constraints
  , validators: validators
  , messages: messages
  , errors$: errors$
  , validSubmit$: validSubmit$
  , validData$: validData$
  , invalidSubmit$: invalidSubmit$
  , events: events
  }
}

var clearError = function(errors, focusEvent) {
  var node = focusEvent.currentTarget
  return R.dissoc(node.name, errors)
}

var validateChange = R.curryN(3, function(config, errors, changeEvent) {
  if(!changeEvent || !changeEvent.currentTarget) {
    return errors
  }
  config.fullData = serializeForm(changeEvent.currentTarget.form, {hash: true})
  var node = changeEvent.currentTarget
  return validateField(config, errors, node.name, node.value)
})

var validateSubmitData = R.curryN(2, function(config, data) {
  var errors = {}
  config.fullData = data
  for(var fieldName in config.constraints) {
    var value = data[fieldName]
    errors = validateField(config, errors, fieldName, value)
  }
  // For loop completed: no additional errors found
  return errors
})

var validateField = function(config, errors, fieldName, value) {
  // Do not validate non-required blank fields
  if(!config.constraints[fieldName] || (!config.constraints[fieldName].required && valIsUnset(value))) {
    return errors
  }
  // Find the first constraint that fails its validator 
  for(var validatorName in config.constraints[fieldName]) {
    var err = getErrorMessage(config, validatorName, fieldName, value, config.fullData)
    if(err) return R.assoc(fieldName, err, errors)
  }
  // For loop completed: no additional errors found
  return errors
}

// Returns an error message if invalid and false if valid
var getErrorMessage = function(config, validatorName, fieldName, value, fullData) {
  var arg = config.constraints[fieldName][validatorName]
  if(config.validators[validatorName]) {
    var isValid = config.validators[validatorName](value, arg, fullData)
    if(!isValid) {
      return getErrMsg(config.messages, fieldName, validatorName, arg)
    }
  }
  return false
}

// -- Views

var form = R.curryN(2, function(state, node) {
  var handleSubmit = function(ev) {
    ev.preventDefault()
    state.events.submit$(ev)
  }
  var vform = h('form', {on: {submit: handleSubmit}})
  return mergeVNodes(vform, node)
})


var field = R.curryN(2, function(state, node) {
  var name = R.path(['data', 'props', 'name'], node)
  if(!name) throw new Error("You need to provide a field name for validation (using the 'props.name' property)")
  var err = state.errors$()[name]
  var invalid = err && err.length
  var vfield = h(node.sel, {
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
var getErrMsg = function(messages, name, validatorName, arg) {
  var err = 
    messages[name] && messages[name][validatorName] ? messages[name][validatorName]
  : messages[validatorName]                         ? messages[validatorName]
  : messages[name]                                  ? messages[name]
  : messages.fallback
  if(typeof err === 'function') return err(arg)
  else return err
}

var defaultMessages = {
  fallback: 'This looks invalid'
, email: 'Please enter a valid email address'
, required: 'This field is required'
, currency: 'Please enter valid amount'
, format: "This doesn't look like the right format"
, isNumber: 'This should be a number'
, max: function(n) {return "This should be less than " + n}
, min: function(n) {return "This should be at least " + n}
, equalTo: function(n) {return "This should be equal to " + n}
, maxLength: function(n) {return "This should be no longer than " + n}
, minLength: function(n) {return "This should be longer than " + n}
, lengthEquals: function(n) {return "This should have a length of " + n}
, includedIn: function(arr) {return "This should be one of: " + arr.join(', ')}
, matchesField: function(n) {return "This field should match the " + n  + " field"}
}

// Does a field value match another field value, given the other's name and the full form data?
var matchesField = function(val, otherName, data) {
  var otherVal = data[otherName]
  return val === otherVal
}

var defaultValidators = {
  email: function(val) {return String(val).match(emailRegex)}
, required: function(val) {return !valIsUnset(val)}
, currency: function(val) {return String(val).match(currencyRegex)}
, format: function(val, arg) {return String(val).match(arg)}
, isNumber: function(val) {return !isNaN(val)}
, max: function(val, n) {return val <= n}
, min: function(val, n) {return val >= n}
, equalTo:  function(val, n) {return n === val}
, maxLength: function(val, n) {return val.length <= n}
, minLength: function(val, n) {return val.length >= n}
, lengthEquals: function(val, n) {return val.length === n}
, includedIn: function(val, arr) {return arr.indexOf(val) !== -1}
, matchesField: matchesField
}

// Test for an unset value
// Can't use just !val because we want 0 to be true
var valIsUnset = function(val) {
  return val === undefined || val === '' || val === null
}

module.exports = {init: init, field: field, form: form}
