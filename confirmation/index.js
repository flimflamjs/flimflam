'use strict';

var modal = require('../modal/index.es6');
var R = require('ramda');
var flyd = require('flyd');
var h = require('snabbdom/h');

var init = function init(isOpen$) {
  var _ref = [flyd.stream(), flyd.stream()],
      confirmed$ = _ref[0],
      denied$ = _ref[1];
  // Stream of true when confirmed, false when denied

  var response$ = flyd.merge(confirmed$, flyd.map(function () {
    return false;
  }, denied$));
  // Show the modal when isOpen$ has a value
  // Close the confirmation modal when the user responds
  var showModal$ = flyd.merge(flyd.map(function () {
    return true;
  }, isOpen$), flyd.map(function () {
    return false;
  }, response$));
  return {
    showModal$: showModal$,
    isOpen$: isOpen$,
    confirmed$: confirmed$,
    denied$: denied$,
    response$: response$
  };
};

// Set configuration defaults for the view function
var setConfigDefaults = R.merge({
  confirmText: 'Yes',
  denyText: 'No',
  prompt: 'Are you sure?'
});

// Top-level view function
var view = function view(state, config) {
  return h('div', {
    attrs: { 'data-ff-confirmation': state.isOpen$() ? 'shown' : 'hidden' }
  }, [modal({
    show$: state.showModal$,
    body: modalBody(state, setConfigDefaults(config))
  })]);
};

var modalBody = function modalBody(state, config) {
  return h('div', {
    attrs: { 'data-ff-confirmation-body': '' }
  }, [h('p', { attrs: { 'data-ff-confirmation-prompt': '' } }, [config.prompt]), h('div', {}, [h('button', {
    on: { click: [state.confirmed$, true] },
    attrs: { 'data-ff-confirmation-button': 'yes' }
  }, [config.confirmText]), h('button', {
    on: { click: [state.denied$, true] },
    attrs: { 'data-ff-confirmation-button': 'no' }
  }, [config.denyText])])]);
};

module.exports = { init: init, view: view };

