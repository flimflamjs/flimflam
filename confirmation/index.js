'use strict';

var modal = require('ff-core/modal');
var R = require('ramda');
var flyd = require('ramda');
var h = require('snabbdom/h');

var init = function init(isOpen$) {
  var confirmed$ = flyd.stream();
  var denied$ = flyd.stream();

  var response$ = flyd.merge(confirmed$, denied$);
  var modalID$ = flyd.merge(flyd.map(function () {
    return 'confirmationModal';
  }, isOpen$), flyd.map(function () {
    return null;
  }, response$));
  return {
    modalID$: modalID$,
    isOpen$: isOpen$,
    confirmed$: confirmed$,
    denied$: denied$,
    response$: response$
  };
};

var setConfigDefaults = R.merge({
  confirmText: 'Yes',
  denyText: 'No',
  prompt: 'Are you sure?'
});

var view = function view(state, config) {
  return h('div', {
    attrs: { 'data-ff-confirmation': state.isOpen$() ? 'shown' : 'hidden' }
  }, [modal({
    thisID: 'confirmationModal',
    id$: state.modalID$,
    body: modalBody(state, setConfigDefaults(config))
  })]);
};

var modalBody = function modalBody(state, config) {
  h('div', {
    attrs: { 'data-ff-confirmation-body': '' }
  }, [h('p', { attrs: { 'data-ff-confirmation-prompt': '' } }, [config.prompt]), h('div', {}, [h('button', {
    on: { click: [state.confirmed$, true] },
    attrs: { 'data-ff-confirmation-button': '' }
  }, [state.confirmText]), h('button', {
    on: { click: [state.denied$, true] },
    attrs: { 'data-ff-confirmation-button': '' }
  }, [state.denyText])])]);
};

module.exports = { init: init, view: view };

