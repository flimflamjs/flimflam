'use strict';

var R = require('ramda');
var h = require('snabbdom/h');
var serializeForm = require('form-serialize');

var flyd = require('flyd');
flyd.filter = require('flyd/module/filter');
flyd.mergeAll = require('flyd/module/mergeall');
flyd.sampleOn = require('flyd/module/sampleon');
flyd.scanMerge = require('flyd/module/scanmerge');

var emailRegex = require('./email-regex');
var currencyRegex = require('./currency-regex');

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
  config = config || {};
  var state = {
    focus$: flyd.stream(),
    change$: flyd.stream(),
    submit$: flyd.stream(),
    formData$: config.formData$ || flyd.stream({})
  };
  state.validators = R.merge(defaultValidators, config.validators || {});
  state.messages = R.merge(defaultMessages, config.messages || {});
  state.constraints = config.constraints || {};

  var fieldErr$ = flyd.map(validateField(state), state.change$);
  var submitErr$ = flyd.map(validateForm(state), state.submit$);
  var formErr$ = flyd.filter(R.identity, submitErr$);
  // Clear all errors on input focus
  var clearErr$ = flyd.map(function (ev) {
    return [ev.target.name, null];
  }, state.focus$);
  // stream of error pairs of [field_name, error_message]
  var allErrs$ = flyd.mergeAll([fieldErr$, formErr$, clearErr$]);
  // Stream of all errors scanned into one object
  state.errors$ = flyd.scan(function (data, pair) {
    return R.assoc(pair[0], pair[1], data);
  }, {}, allErrs$);

  // Stream of field names and new values
  state.nameVal$ = flyd.map(function (node) {
    return [node.name, node.value];
  }, state.change$);
  // Stream of all user-inputted data scanned into one object
  state.userData$ = flyd.scanMerge([[state.nameVal$, function (data, pair) {
    return R.assoc(pair[0], pair[1], data);
  }] // change sets a single key/val into data
  , [state.submit$, function (data, form) {
    return serializeForm(form, { hash: true });
  }] // submit overrides all data by serializing the whole form
  ], state.formData$() || {});

  state.invalidSubmit$ = flyd.filter(R.apply(function (key, val) {
    return val;
  }), submitErr$);
  state.validSubmit$ = flyd.filter(R.apply(function (key, val) {
    return !val;
  }), submitErr$);
  state.validData$ = flyd.sampleOn(state.validSubmit$, state.userData$);

  return state;
}

// Generate a stream of objects of errors
var errorsStream = function errorsStream(state) {
  var fieldErr$ = flyd.map(validateField(state), state.change$);
  var formErr$ = flyd.filter(R.identity, flyd.map(validateForm(state), state.submit$));
  // Clear all errors on input focus
  var clearErr$ = flyd.map(function (ev) {
    return [ev.target.name, null];
  }, state.focus$);
  // stream of error pairs of [field_name, error_message]
  var allErrs$ = flyd.mergeAll([fieldErr$, formErr$, clearErr$]);
  // Stream of all errors scanned into one object
  return flyd.scan(function (data, pair) {
    return R.assoc(pair[0], pair[1], data);
  }, {}, allErrs$);
};

// -- Views

var form = R.curryN(4, function (state, sel) {
  var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var children = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

  var elm = h('form', data, children);
  elm.data = R.merge(data, {
    on: {
      submit: function submit(ev) {
        if (data.on && data.on.submit) data.on.submit(ev);
        ev.preventDefault();
        state.submit$(ev.currentTarget);
      }
    }
  });
  return elm;
});

// A single form field
// Data takes normal snabbdom data for the input/select/textarea (eg props, style, on)
var field = R.curryN(4, function (state, sel) {
  var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var children = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

  if (!data.props || !data.props.name) throw new Error("You need to provide a field name for validation (using the 'props.name' property)");
  var err = state.errors$()[data.props.name];
  var invalid = err && err.length;

  var elm = h(sel, R.merge(data, {
    on: {
      focus: state.focus$,
      change: function change(ev) {
        return state.change$(ev.currentTarget);
      }
    },
    props: R.merge({
      value: state.formData$()[data.props.name]
    }, data.props),
    attrs: { 'data-ff-field-input': invalid ? 'invalid' : 'valid' }
  }));

  return h('div', {
    attrs: {
      'data-ff-field': invalid ? 'invalid' : 'valid',
      'data-ff-field-error': err ? err : ''
    },
    hook: { insert: scrollToThis }
  }, [elm]);
});

var scrollToThis = function scrollToThis(vnode) {
  vnode.elm.scrollIntoView({ block: 'start', behavior: 'smooth' });
};

// Pass in an array of validation functions and the event object
// Will return a pair of [name, errorMsg] (errorMsg will be null if no errors present)
var validateField = R.curry(function (state, node) {
  var value = node.value;
  var name = node.name;
  if (!state.constraints[name]) return [name, null]; // no validators for this field present

  // Do not validate non-required blank fields
  if (!state.constraints[name].required && valIsUnset(value)) return [name, null];

  // Find the first constraint that fails its validator 
  for (var valName in state.constraints[name]) {
    var arg = state.constraints[name][valName];
    if (!state.validators[valName]) {
      console.warn("Form validation constraint does not exist:", valName);
    } else if (!state.validators[valName](value, arg, state.userData$())) {
      var msg = getErrMsg(state.messages, name, valName, arg);
      return [name, String(msg)];
    }
  }
  return [name, null]; // no error found
});

// Retrieve errors for the entire set of form data, used on form submit events,
// using the form data saved into the state
var validateForm = R.curry(function (state, node) {
  var formData = serializeForm(node, { hash: true });
  // For every field name in the provided contraints
  for (var fieldName in state.constraints) {
    var value = state.userData$()[fieldName];
    // Skip the validation of non-required fields that are missing
    if (state.constraints[fieldName] && (state.constraints[fieldName].required || !valIsUnset(value))) {
      for (var valName in state.constraints[fieldName]) {
        var arg = state.constraints[fieldName][valName];
        if (!state.validators[valName]) {
          console.warn("Form validator function does not exist:", valName);
        } else if (!state.validators[valName](value, arg, formData)) {
          var msg = getErrMsg(state.messages, fieldName, valName, arg);
          return [fieldName, String(msg)];
        }
      }
    }
  }
});

// Given the messages object, the field name, and the validator name, and the validator argument
// Retrieve and apply the error message function
var getErrMsg = function getErrMsg(messages, name, valName, arg) {
  var err = messages[name] && messages[name][valName] ? messages[name][valName] : messages[valName] ? messages[valName] : messages[name] ? messages[name] : messages.fallback;
  if (typeof err === 'function') return err(arg);else return err;
};

var defaultMessages = {
  fallback: 'This looks invalid',
  email: 'Please enter a valid email address',
  required: 'This field is required',
  currency: 'Please enter valid currency',
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

