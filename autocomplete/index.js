'use strict';

var _flyd = require('flyd');

var _flyd2 = _interopRequireDefault(_flyd);

var _h = require('snabbdom/h');

var _h2 = _interopRequireDefault(_h);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_flyd2.default.filter = require('flyd/module/filter');
_flyd2.default.scanMerge = require('flyd/module/scanmerge');
_flyd2.default.mergeAll = require('flyd/module/mergeall');
_flyd2.default.sampleOn = require('flyd/module/sampleon');

function init(state) {
  state = state || {};
  state = _ramda2.default.merge({
    keyup$: _flyd2.default.stream(),
    select$: _flyd2.default.stream(),
    focus$: _flyd2.default.stream(),
    blur$: _flyd2.default.stream(),
    upArrow$: _flyd2.default.stream(),
    downArrow$: _flyd2.default.stream(),
    values: []
  }, state);

  state.val$ = _flyd2.default.mergeAll([_flyd2.default.map(function (ev) {
    return ev.currentTarget.value;
  }, state.keyup$), state.select$]);
  // Stream of events when the user starts on the input and it's empty (ie focus on empty input, or keyup to empty value)
  var empty$ = _flyd2.default.filter(function (ev) {
    return !ev.currentTarget.value;
  }, _flyd2.default.merge(state.focus$, state.keyup$));

  state.partialMatches$ = _flyd2.default.scanMerge([[state.val$, function (matches, val) {
    return val.length ? _ramda2.default.filter(function (v) {
      return v === '' || v.indexOf(val) === 0;
    }, state.values) : matches;
  }], [empty$, function (matches) {
    return state.showInitial ? state.values : [];
  }], [state.select$, _ramda2.default.always([])]], []);
  if (state.limit) state.partialMatches$ = _flyd2.default.map(_ramda2.default.take(state.limit), state.partialMatches$);
  state.match$ = _flyd2.default.map(function (str) {
    return _ramda2.default.find(_ramda2.default.equals(str), state.values);
  }, state.val$); // will have undefined values on the stream when not exact match

  // Index of currently selected dropdown item
  var downWithLength$ = _flyd2.default.sampleOn(state.downArrow$, state.partialMatches$);
  state.dropdownIdx$ = _flyd2.default.scanMerge([[state.upArrow$, function (idx) {
    return idx === 0 ? 0 : idx - 1;
  }] // decrement, but not below 0
  , [downWithLength$, function (idx, matches) {
    return idx >= matches.length - 1 ? idx : idx + 1;
  }]], 0);

  return state;
}

// Is the event an arrow up/down keypress?
var upArrow = function upArrow(ev) {
  return ev.keyCode === 38;
};
var downArrow = function downArrow(ev) {
  return ev.keyCode === 40;
};
var enterKey = function enterKey(ev) {
  return ev.keyCode === 13;
};

function view(vnode, state) {
  var matches = state.partialMatches$();
  vnode.data.on = vnode.data.on || {};
  vnode.data.on.keydown = function (ev) {
    if (upArrow(ev)) {
      state.upArrow$(ev);
      ev.preventDefault();
    } else if (downArrow(ev)) {
      state.downArrow$(ev);
      ev.preventDefault();
    }
  };
  vnode.data.on.keyup = function (ev) {
    if (enterKey(ev) && matches.length) state.select$(state.partialMatches$()[state.dropdownIdx$()]);else state.keyup$(ev);
  };
  vnode.data.on.focus = state.focus$;
  vnode.data.on.blur = state.blur$;
  vnode.data.props = vnode.data.props || {};
  vnode.data.props.value = state.val$();

  var dropdown = (0, _h2.default)('div.ff-autocomplete-dropdown', _ramda2.default.addIndex(_ramda2.default.map)(dropdownValue(state), matches));

  return (0, _h2.default)('div.ff-autocomplete', [vnode, dropdown]);
}

var dropdownValue = function dropdownValue(state) {
  return function (val, idx) {
    return (0, _h2.default)('div.ff-autocomplete-dropdown-value', {
      on: {
        click: [state.select$, val],
        mouseover: [state.dropdownIdx$, idx]
      },
      class: {
        'ff-autocomplete-dropdown-value--selecting': state.dropdownIdx$() == idx
      }
    }, val);
  };
};

module.exports = { init: init, view: view };

