'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _flyd = require('flyd');

var _flyd2 = _interopRequireDefault(_flyd);

var _snabbdomH = require('snabbdom/h');

var _snabbdomH2 = _interopRequireDefault(_snabbdomH);

var _formSerialize = require('form-serialize');

var _formSerialize2 = _interopRequireDefault(_formSerialize);

var _emailRegexEs6 = require('./email-regex.es6');

var _emailRegexEs62 = _interopRequireDefault(_emailRegexEs6);

var _currencyRegexEs6 = require('./currency-regex.es6');

var _currencyRegexEs62 = _interopRequireDefault(_currencyRegexEs6);

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

_flyd2['default'].filter = require('flyd/module/filter');
_flyd2['default'].mergeAll = require('flyd/module/mergeall');
_flyd2['default'].sampleOn = require('flyd/module/sampleon');
_flyd2['default'].scanMerge = require('flyd/module/scanmerge');

function init(state) {
  state = state || {};
  state = _ramda2['default'].merge({
    focus$: _flyd2['default'].stream(),
    change$: _flyd2['default'].stream(),
    submit$: _flyd2['default'].stream(),
    validators: {},
    messages: {},
    constraints: {}
  }, state);

  state.validators = _ramda2['default'].merge(defaultValidators, state.validators);
  state.messages = _ramda2['default'].merge(defaultMessages, state.messages);
  state.constraints = state.constraints || {};

  var fieldErr$ = _flyd2['default'].map(validateField(state), state.change$);
  var submitErr$ = _flyd2['default'].map(validateForm(state), state.submit$);
  var formErr$ = _flyd2['default'].filter(_ramda2['default'].identity, submitErr$);
  // Clear all errors on input focus
  var clearErr$ = _flyd2['default'].map(function (ev) {
    return [ev.target.name, null];
  }, state.focus$);
  // stream of error pairs of [field_name, error_message]
  var allErrs$ = _flyd2['default'].mergeAll([fieldErr$, formErr$, clearErr$]);
  // Stream of all errors scanned into one object
  state.errors$ = _flyd2['default'].scan(function (data, pair) {
    return _ramda2['default'].assoc(pair[0], pair[1], data);
  }, {}, allErrs$);

  // Stream of field names and new values
  state.nameVal$ = _flyd2['default'].map(function (node) {
    return [node.name, node.value];
  }, state.change$);
  // Stream of all data scanned into one object
  state.data$ = _flyd2['default'].scanMerge([[state.nameVal$, function (data, pair) {
    return _ramda2['default'].assoc(pair[0], pair[1], data);
  }] // change sets a single key/val into data
  , [state.submit$, function (data, form) {
    return (0, _formSerialize2['default'])(form, { hash: true });
  }] // submit overrides all data by serializing the whole form
  ], state.data || {});

  state.invalidSubmit$ = _flyd2['default'].filter(_ramda2['default'].apply(function (key, val) {
    return val;
  }), submitErr$);
  state.validSubmit$ = _flyd2['default'].filter(_ramda2['default'].apply(function (key, val) {
    return !val;
  }), submitErr$);
  state.validData$ = _flyd2['default'].sampleOn(state.validSubmit$, state.data$);

  return state;
}

// Generate a stream of objects of errors
var errorsStream = function errorsStream(state) {
  var fieldErr$ = _flyd2['default'].map(validateField(state), state.change$);
  var formErr$ = _flyd2['default'].filter(_ramda2['default'].identity, _flyd2['default'].map(validateForm(state), state.submit$));
  // Clear all errors on input focus
  var clearErr$ = _flyd2['default'].map(function (ev) {
    return [ev.target.name, null];
  }, state.focus$);
  // stream of error pairs of [field_name, error_message]
  var allErrs$ = _flyd2['default'].mergeAll([fieldErr$, formErr$, clearErr$]);
  // Stream of all errors scanned into one object
  return _flyd2['default'].scan(function (data, pair) {
    return _ramda2['default'].assoc(pair[0], pair[1], data);
  }, {}, allErrs$);
};

// -- Views

var form = _ramda2['default'].curry(function (state, elm) {
  elm.data = _ramda2['default'].merge(elm.data, {
    on: { submit: function submit(ev) {
        ev.preventDefault();state.submit$(ev.currentTarget);
      } }
  });
  return elm;
});

// A single form field
// Data takes normal snabbdom data for the input/select/textarea (eg props, style, on)
var field = _ramda2['default'].curry(function (state, elm) {
  if (!elm.data.props || !elm.data.props.name) throw new Error("You need to provide a field name for validation (using the 'props.name' property)");
  var err = state.errors$()[elm.data.props.name];
  var invalid = err && err.length;

  elm.data = _ramda2['default'].merge(elm.data, {
    on: {
      focus: state.focus$,
      change: function change(ev) {
        return state.change$(ev.currentTarget);
      }
    },
    'class': { 'ff-field-input--invalid': invalid }
  });

  return (0, _snabbdomH2['default'])('div.ff-field', {
    'class': { 'ff-field--invalid': invalid }
  }, [invalid ? (0, _snabbdomH2['default'])('p.ff-field-errorMessage', {
    hook: { insert: scrollToThis }
  }, err) : '', elm]);
});

var scrollToThis = function scrollToThis(vnode) {
  vnode.elm.scrollIntoView({ block: 'start', behavior: 'smooth' });
};

// Pass in an array of validation functions and the event object
// Will return a pair of [name, errorMsg] (errorMsg will be null if no errors present)
var validateField = _ramda2['default'].curry(function (state, node) {
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
    } else if (!state.validators[valName](value, arg)) {
      var msg = getErr(state.messages, name, valName, arg);
      return [name, String(msg)];
    }
  }
  return [name, null]; // no error found
});

// Retrieve errors for the entire set of form data, used on form submit events,
// using the form data saved into the state
var validateForm = _ramda2['default'].curry(function (state, node) {
  var formData = (0, _formSerialize2['default'])(node, { hash: true });
  for (var fieldName in state.constraints) {
    var value = state.data$()[fieldName];
    if (state.constraints[fieldName] && (state.constraints[fieldName].required || !valIsUnset(value))) {
      // dont validate undefined non-required fields
      for (var valName in state.constraints[fieldName]) {
        var arg = state.constraints[fieldName][valName];
        if (!state.validators[valName]) {
          console.warn("Form validation constraint does not exist:", valName);
        } else if (!state.validators[valName](value, arg)) {
          var msg = getErr(state.messages, fieldName, valName, arg);
          return [fieldName, String(msg)];
        }
      }
    }
  }
});

// Given the messages object, the validator argument, the field name, and the validator name
// Retrieve and apply the error message function
var getErr = function getErr(messages, name, valName, arg) {
  var err = messages[name] ? messages[name][valName] || messages[name] : messages[valName];
  if (typeof err === 'function') return err(arg);else return err;
};

// Test for an unset value
// Can't use just !val because we want 0 to be true
var valIsUnset = function valIsUnset(val) {
  return val === undefined || val === '' || val === null;
};

var defaultMessages = {
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
  }
};

var defaultValidators = {
  email: function email(val) {
    return String(val).match(_emailRegexEs62['default']);
  },
  required: function required(val) {
    return !valIsUnset(val);
  },
  currency: function currency(val) {
    return String(val).match(_currencyRegexEs62['default']);
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
  }
};

module.exports = { init: init, field: field, form: form };

