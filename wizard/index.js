'use strict';

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _h = require('snabbdom/h');

var _h2 = _interopRequireDefault(_h);

var _flyd = require('flyd');

var _flyd2 = _interopRequireDefault(_flyd);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_flyd2.default.filter = require('flyd/module/filter');

var mapIndex = _ramda2.default.addIndex(_ramda2.default.map);

// User can pass in any default state data
var init = function init(state) {
  // set defaults
  state = _ramda2.default.merge({
    currentStep$: _flyd2.default.stream(0),
    jump$: _flyd2.default.stream() // Stream of step jumps: pairs of [destinationStep, currentStep]
    , isCompleted$: _flyd2.default.stream(false) // Is the wizard completed?
    , steps: [] // Snabbdom content of each step
    , followup: '' // Snabbdom content of ending step, when the wizard is complete
  }, state || {});

  // Stream of valid jump step indexes -- can only jump backwards
  // Filter out all jumps where the destinationStep (first in pair) is less than currentStep (second in pair)
  var validJump$ = _flyd2.default.map(_ramda2.default.head, _flyd2.default.filter(_ramda2.default.apply(_ramda2.default.lte), state.jump$));
  // Merge in valid jumps into the existing currentStep stream
  state.currentStep$ = _flyd2.default.merge(state.currentStep$, validJump$);

  return state;
};

// state has a steps array and followup object
// each step object has a name and body
// followup is just snabbdom content
var view = function view(state) {
  var stepNames = _ramda2.default.map(_ramda2.default.prop('name'), state.steps);
  var stepBodies = _ramda2.default.map(_ramda2.default.prop('body'), state.steps);
  return (0, _h2.default)('div', {
    attrs: { 'data-ff-wizard-body': state.isCompleted$() ? 'complete' : 'incomplete' }
  }, [stepIndex(state, stepNames), body(state, stepBodies), followup(state, state.followup)]);
};

var followup = function followup(state, content) {
  return (0, _h2.default)('div', {
    attrs: { 'data-ff-wizard-followup': state.isCompleted$() ? 'complete' : 'incomplete' }
  }, [content]);
};

var stepIndex = function stepIndex(state, stepNames) {
  var width = 100 / stepNames.length + '%';
  var stepHeaders = mapIndex(stepHeader(state, width), stepNames);
  return (0, _h2.default)('div', {
    attrs: { 'data-ff-wizard-index': state.isCompleted$() ? 'complete' : 'incomplete' }
  }, stepHeaders);
};

// A step label/header thing to go in the step index/listing
var stepHeader = function stepHeader(state, width) {
  return function (name, idx) {
    return (0, _h2.default)('span', {
      style: { width: width },
      attrs: {
        'data-ff-wizard-index-label': state.currentStep$() === idx ? 'current' : state.currentStep$() > idx ? 'accessible' : 'inaccessible'
      },
      on: { click: function click(ev) {
          return state.jump$([idx, state.currentStep$()]);
        } }
    }, name);
  };
};

var body = function body(state, stepBodies) {
  var bodies = mapIndex(stepBody(state), stepBodies);
  return (0, _h2.default)('div', {
    attrs: { 'data-ff-wizard-steps': state.isCompleted$() ? 'complete' : 'incomplete' }
  }, bodies);
};

var stepBody = function stepBody(state) {
  return function (content, idx) {
    return (0, _h2.default)('div', {
      attrs: { 'data-ff-wizard-body-step': state.currentStep$() === idx ? 'current' : 'not-current' }
    }, [content]);
  };
};

module.exports = { view: view, init: init };

