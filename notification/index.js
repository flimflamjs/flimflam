'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _flyd = require('flyd');

var _flyd2 = _interopRequireDefault(_flyd);

var _snabbdomH = require('snabbdom/h');

var _snabbdomH2 = _interopRequireDefault(_snabbdomH);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

_flyd2['default'].flatMap = require('flyd/module/flatmap');
_flyd2['default'].afterSilence = require('flyd/module/aftersilence');

// Pushes null values to the messages stream after a delay
// pseudocode example with a 1000ms delay:
// {[message1, 0ms], [message2, 5000ms]}
// {[message1, 0ms], [null, 1000ms], [message2, 5000ms], [null, 6000ms]}

var log = _ramda2['default'].curryN(2, console.log.bind(console));

window.flyd = _flyd2['default'];

function init(state) {
  state = _ramda2['default'].merge({ hideDelay: 5000, message$: _flyd2['default'].stream() }, state || {});
  // Stream of null value after a ms delay
  // const hide$ = flyd.map(R.always(null), flyd.flatMap(() => flyd.afterSilence(state.hideDelay, flyd.stream(1)), state.message$))
  // state.message$ = flyd.merge(state.message$, hide$)

  var hide$ = _flyd2['default'].map(_ramda2['default'].always(null), _flyd2['default'].flatMap(function () {
    return _flyd2['default'].afterSilence(state.hideDelay, _flyd2['default'].stream(1));
  }, state.message$));
  state.msg$ = _flyd2['default'].merge(state.message$, hide$);

  return state;
}

function view(state) {
  return (0, _snabbdomH2['default'])('div.ff-notification', {
    'class': { 'ff-notification--inView': state.msg$() }
  }, state.msg$() ? String(state.msg$()) : '');
}

module.exports = { view: view, init: init };

