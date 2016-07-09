'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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
_flyd2.default.flatMap = require('flyd/module/flatmap');
_flyd2.default.switchLatest = require('flyd/module/switchlatest');
_flyd2.default.lift = require('flyd/module/lift');

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

  state.values$ = state.values$ || _flyd2.default.stream(state.values);

  state.val$ = _flyd2.default.mergeAll([_flyd2.default.map(function (ev) {
    return ev.currentTarget.value;
  }, state.keyup$), state.select$]);
  // Stream of events when the user starts on the input and it's empty (ie focus on empty input, or keyup to empty value)
  var empty$ = _flyd2.default.map(function () {
    return state.values$();
  }, _flyd2.default.filter(function (ev) {
    return !ev.currentTarget.value;
  }, _flyd2.default.merge(state.focus$, state.keyup$)));

  var withValues$ = _flyd2.default.lift(_ramda2.default.pair, state.val$, state.values$);
  state.partialMatches$ = _flyd2.default.scanMerge([[withValues$, filterValues], [empty$, function (matches, vals) {
    return state.showInitial ? vals : [];
  }], [state.select$, _ramda2.default.always([])]], []);
  if (state.limit) state.partialMatches$ = _flyd2.default.map(_ramda2.default.take(state.limit), state.partialMatches$);

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

var filterValues = function filterValues(matches, pair) {
  var _pair = _slicedToArray(pair, 2);

  var newVal = _pair[0];
  var values = _pair[1];

  return newVal.length ? _ramda2.default.filter(function (v) {
    return v === '' || v.indexOf(newVal) === 0;
  }, values) : matches;
};

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

