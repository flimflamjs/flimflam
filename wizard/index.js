'use strict';

var R = require('ramda');
var h = require('snabbdom/h');
var flyd = require('flyd');
flyd.filter = require('flyd/module/filter');
var mapIndex = R.addIndex(R.map);

// User can pass in any default state data
var init = function init(state) {
  // set defaults
  state = R.merge({
    currentStep$: flyd.stream(0),
    jump$: flyd.stream() // Stream of step jumps: pairs of [destinationStep, currentStep]
    , isCompleted$: flyd.stream(false) // Is the wizard completed?
  }, state || {});

  // Stream of valid jump step indexes -- can only jump backwards
  // Filter out all jumps where the destinationStep (first in pair) is less than currentStep (second in pair)
  var validJump$ = flyd.map(R.head, flyd.filter(R.apply(R.lte), state.jump$));
  // Merge in valid jumps into the existing currentStep stream
  state.currentStep$ = flyd.merge(state.currentStep$, validJump$);
  return state;
};

// each step object has a name and body
// followup is just snabbdom content
var view = function view(state, steps, followup) {
  var stepNames = R.map(R.prop('name'), steps);
  var stepBodies = R.map(R.prop('body'), steps);
  return h('div', {
    attrs: { 'data-ff-wizard-body': state.isCompleted$() ? 'complete' : 'incomplete' }
  }, [stepIndex(state, stepNames), body(state, stepBodies), followupDiv(state, followup || '')]);
};

var followupDiv = function followupDiv(state, content) {
  return h('div', {
    attrs: { 'data-ff-wizard-followup': state.isCompleted$() ? 'complete' : 'incomplete' }
  }, [content]);
};

var stepIndex = function stepIndex(state, stepNames) {
  var width = 100 / stepNames.length + '%';
  var stepHeaders = mapIndex(stepHeader(state, width), stepNames);
  return h('div', {
    attrs: { 'data-ff-wizard-index': state.isCompleted$() ? 'complete' : 'incomplete' }
  }, stepHeaders);
};

// A step label/header thing to go in the step index/listing
var stepHeader = function stepHeader(state, width) {
  return function (name, idx) {
    return h('span', {
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
  var bodyDivs = mapIndex(stepBody(state), stepBodies);
  return h('div', {
    attrs: { 'data-ff-wizard-steps': state.isCompleted$() ? 'complete' : 'incomplete' }
  }, bodyDivs);
};

var stepBody = function stepBody(state) {
  return function (content, idx) {
    return h('div', {
      attrs: { 'data-ff-wizard-body-step': state.currentStep$() === idx ? 'current' : 'not-current' }
    }, [content]);
  };
};

module.exports = { view: view, init: init };

