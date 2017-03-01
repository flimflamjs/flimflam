'use strict';

//npm
var R = require('ramda');
var h = require('snabbdom/h').default;
var serializeForm = require('form-serialize');
var mergeVNodes = require('snabbdom-merge');
var flyd = require('flyd');
flyd.filter = require('flyd/module/filter');
flyd.mergeAll = require('flyd/module/mergeall');
flyd.sampleOn = require('flyd/module/sampleon');
flyd.scanMerge = require('flyd/module/scanmerge');
//local
var emailRegex = require('./email-regex');
var currencyRegex = require('./currency-regex');

function init() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var events = { change$: flyd.stream(), submit$: flyd.stream(), focus$: flyd.stream() };
  var userData = config.userData || flyd.stream();
  var constraints = config.constraints;
  var messages = R.merge(defaultMessages, config.messages);
  var validators = R.merge(defaultValidators, config.validators);
  var data$ = flyd.scanMerge([[config.data$, function (data, newData) {
    return newData;
  }], [events.change$, setChangedData]], {});

  // Partially apply validate function to configure it
  var validateChangeConfigured = validateChange({ constraints: constraints, validators: validators, messages: messages, data$: data$ });
  var validateSubmitConfigured = validateSubmit({ constraints: constraints, validators: validators, messages: messages });
  var submitErrs$ = flyd.map(validateSubmitConfigured, events.submit$);
  // Stream of an object of error messages, where the keys are field names and values are string error messages
  var errors$ = flyd.scanMerge([[events.change$, validateChangeConfigured], [events.focus$, clearError], [submitErrs$, function (errs, newErrs) {
    return newErrs;
  }]], {});

  // Stream of all user-inputted data scanned into one object
  var validSubmit$ = flyd.filter(R.isEmpty, submitErrs$);
  var notEmpty = R.compose(R.not, R.isEmpty);
  var invalidSubmit$ = flyd.filter(notEmpty, submitErrs$);
  var validData$ = flyd.sampleOn(validSubmit$, data$);

  return {
    constraints: constraints,
    validators: validators,
    messages: messages,
    errors$: errors$,
    validSubmit$: validSubmit$,
    validData$: validData$,
    data$: data$,
    invalidSubmit$: invalidSubmit$,
    events: events
  };
}

var clearError = function clearError(errors, focusEvent) {
  var node = focusEvent.currentTarget;
  return R.dissoc(node.name, errors);
};

var validateChange = function validateChange(config) {
  return function (errors, changeEvent) {
    var node = changeEvent.currentTarget;
    var _ref = [node.name, node.value],
        fieldName = _ref[0],
        value = _ref[1];

    config.fullData = config.data$();
    return validateField(config, errors, fieldName, value);
  };
};

var validateSubmit = function validateSubmit(config) {
  return function (submitEvent) {
    var errors = {};
    var node = submitEvent.currentTarget;
    config.fullData = serializeForm(node, { hash: true });
    for (var fieldName in config.constraints) {
      var value = config.fullData[fieldName];
      errors = validateField(config, errors, fieldName, value);
    }
    // For loop completed: no additional errors found
    return errors;
  };
};

var validateField = function validateField(config, errors, fieldName, value) {
  // Do not validate non-required blank fields
  if (!config.constraints[fieldName] || !config.constraints[fieldName].required && valIsUnset(value)) return errors;
  // Find the first constraint that fails its validator 
  for (var validatorName in config.constraints[fieldName]) {
    var err = getErrorMessage(config, validatorName, fieldName, value, config.fullData);
    if (err) return R.assoc(fieldName, err, errors);
  }
  // For loop completed: no additional errors found
  return errors;
};

// Returns an error message if invalid and false if valid
var getErrorMessage = function getErrorMessage(config, validatorName, fieldName, value, fullData) {
  var arg = config.constraints[fieldName][validatorName];
  if (config.validators[validatorName]) {
    var isValid = config.validators[validatorName](value, arg, fullData);
    if (!isValid) {
      return getErrMsg(config.messages, fieldName, validatorName, arg);
    }
  }
  return false;
};

var setChangedData = function setChangedData(data, changeEvent) {
  var node = changeEvent.currentTarget;
  var name = node.name;
  var value = node.value;
  return R.assoc(name, value, data);
};

var handleFocus = function handleFocus(state) {
  return function (ev) {
    // Clear errors on input focus
    state.errors$({});
  };
};

// -- Views

var form = R.curryN(2, function (state, node) {
  var vform = h('form', { on: { submit: function submit(ev) {
        ev.preventDefault();state.events.submit$(ev);
      } } });
  return mergeVNodes(vform, node);
});

var field = R.curryN(2, function (state, node) {
  var name = R.path(['data', 'props', 'name'], node);
  if (!name) throw new Error("You need to provide a field name for validation (using the 'props.name' property)");
  var err = state.errors$()[name];
  var invalid = err && err.length;
  var vfield = h(node.sel, {
    on: {
      focus: state.events.focus$,
      change: state.events.change$
    },
    attrs: {
      'data-ff-field-input': invalid ? 'invalid' : 'valid',
      'data-ff-field-error': err
    }
  });
  return mergeVNodes(vfield, node);
});

// Given the messages object, the field name, and the validator name, and the validator argument
// Retrieve and apply the error message function
var getErrMsg = function getErrMsg(messages, name, validatorName, arg) {
  var err = messages[name] && messages[name][validatorName] ? messages[name][validatorName] : messages[validatorName] ? messages[validatorName] : messages[name] ? messages[name] : messages.fallback;
  if (typeof err === 'function') return err(arg);else return err;
};

var defaultMessages = {
  fallback: 'This looks invalid',
  email: 'Please enter a valid email address',
  required: 'This field is required',
  currency: 'Please enter valid amount',
  format: "This doesn't look like the right format",
  isNumber: 'This should be a number',
  max: function max(n) {
    return 'This should be less than ' + n;
  },
  min: function min(n) {
    return 'This should be at least ' + n;
  },
  equalTo: function equalTo(n) {
    return 'This should be equal to ' + n;
  },
  maxLength: function maxLength(n) {
    return 'This should be no longer than ' + n;
  },
  minLength: function minLength(n) {
    return 'This should be longer than ' + n;
  },
  lengthEquals: function lengthEquals(n) {
    return 'This should have a length of ' + n;
  },
  includedIn: function includedIn(arr) {
    return 'This should be one of: ' + arr.join(', ');
  },
  matchesField: function matchesField(n) {
    return 'This field should match the ' + n + ' field';
  }
};

// Does a field value match another field value, given the other's name and the full form data?
var matchesField = function matchesField(val, otherName, data) {
  var otherVal = data[otherName];
  return val === otherVal;
};

var defaultValidators = {
  email: function email(val) {
    return String(val).match(emailRegex);
  },
  required: function required(val) {
    return !valIsUnset(val);
  },
  currency: function currency(val) {
    return String(val).match(currencyRegex);
  },
  format: function format(val, arg) {
    return String(val).match(arg);
  },
  isNumber: function isNumber(val) {
    return !isNaN(val);
  },
  max: function max(val, n) {
    return val <= n;
  },
  min: function min(val, n) {
    return val >= n;
  },
  equalTo: function equalTo(val, n) {
    return n === val;
  },
  maxLength: function maxLength(val, n) {
    return val.length <= n;
  },
  minLength: function minLength(val, n) {
    return val.length >= n;
  },
  lengthEquals: function lengthEquals(val, n) {
    return val.length === n;
  },
  includedIn: function includedIn(val, arr) {
    return arr.indexOf(val) !== -1;
  },
  matchesField: matchesField
};

// Test for an unset value
// Can't use just !val because we want 0 to be true
var valIsUnset = function valIsUnset(val) {
  return val === undefined || val === '' || val === null;
};

module.exports = { init: init, field: field, form: form };

