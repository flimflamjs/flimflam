'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _snabbdomH = require('snabbdom/h');

var _snabbdomH2 = _interopRequireDefault(_snabbdomH);

var _flyd = require('flyd');

var _flyd2 = _interopRequireDefault(_flyd);

_flyd2['default'].filter = require('flyd/module/filter');

var mapIndex = _ramda2['default'].addIndex(_ramda2['default'].map);

// User can pass in any default state data
var init = function init(state) {
  // set defaults
  state = _ramda2['default'].merge({
    currentStep$: _flyd2['default'].stream(0),
    jump$: _flyd2['default'].stream(),
    isCompleted$: _flyd2['default'].stream(false),
    steps: [],
    followup: ''
  }, state || {});

  // Stream of valid jump step indexes -- can only jump backwards
  var validJump$ = _flyd2['default'].map(_ramda2['default'].head, _flyd2['default'].filter(_ramda2['default'].apply(_ramda2['default'].lte), state.jump$));
  // Merge in valid jumps into the existing currentStep stream
  state.currentStep$ = _flyd2['default'].merge(state.currentStep$, validJump$);

  return state;
};

// state has a steps array and followup object
// each step object has a name and body
// followup is just snabbdom content
var view = function view(state) {
  var stepNames = _ramda2['default'].map(_ramda2['default'].prop('name'), state.steps);
  var stepBodies = _ramda2['default'].map(_ramda2['default'].prop('body'), state.steps);
  return (0, _snabbdomH2['default'])('div.ff-wizard-body', [stepIndex(state, stepNames), body(state, stepBodies), followup(state, state.followup)]);
};

var followup = function followup(state, content) {
  return (0, _snabbdomH2['default'])('div.ff-wizard-followup', {
    style: { display: state.isCompleted$() ? 'block' : 'none' }
  }, [content]);
};

var stepIndex = function stepIndex(state, stepNames) {
  var width = 100 / stepNames.length + '%';
  var stepHeaders = mapIndex(stepHeader(state, width), stepNames);
  return (0, _snabbdomH2['default'])('div.ff-wizard-index', {
    style: { display: state.isCompleted$() ? 'none' : 'block' }
  }, stepHeaders);
};

// A step label/header thing to go in the step index/listing
var stepHeader = function stepHeader(state, width) {
  return function (name, idx) {
    return (0, _snabbdomH2['default'])('span.ff-wizard-index-label', {
      style: { width: width },
      'class': {
        'ff-wizard-index-label--current': state.currentStep$() === idx,
        'ff-wizard-index-label--accessible': state.currentStep$() > idx
      },
      on: { click: function click(ev) {
          return state.jump$([idx, state.currentStep$()]);
        } }
    }, name);
  };
};

var body = function body(state, stepBodies) {
  var bodies = mapIndex(stepBody(state), stepBodies);
  return (0, _snabbdomH2['default'])('div.ff-wizard-steps', {
    style: { display: state.isCompleted$() ? 'none' : 'block' }
  }, bodies);
};

var stepBody = function stepBody(state) {
  return function (content, idx) {
    return (0, _snabbdomH2['default'])('div.ff-wizard-body-step', {
      style: { display: state.currentStep$() === idx ? 'block' : 'none' }
    }, [content]);
  };
};

module.exports = { view: view, init: init };

