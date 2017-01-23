'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var h = require('snabbdom/h');
var R = require('ramda');

var flyd = require('flyd');
flyd.filter = require('flyd/module/filter');
flyd.scanMerge = require('flyd/module/scanmerge');
flyd.mergeAll = require('flyd/module/mergeall');
flyd.sampleOn = require('flyd/module/sampleon');
flyd.flatMap = require('flyd/module/flatmap');
flyd.switchLatest = require('flyd/module/switchlatest');
flyd.lift = require('flyd/module/lift');

// Show dropdown on first focus 
// Hide the dropdown on blur
// Hide the dropdown when a value is selected and still focused

function init(state) {
  state = state || {};
  state = R.merge({
    keyup$: flyd.stream(),
    select$: flyd.stream(),
    focus$: flyd.stream(),
    blur$: flyd.stream(),
    upArrow$: flyd.stream(),
    downArrow$: flyd.stream(),
    values: [],
    hoverVal$: flyd.stream()
  }, state);
  state.values$ = state.values$ || flyd.stream(state.values);

  state.val$ = flyd.mergeAll([flyd.map(function (ev) {
    return ev.currentTarget.value;
  }, state.keyup$), state.select$]);
  // Stream of events when the user starts on the input and it's empty (ie focus on empty input, or keyup$ to empty value)
  var empty$ = flyd.map(function () {
    return state.values$();
  }, flyd.filter(function (ev) {
    return !ev.currentTarget.value;
  }, flyd.merge(state.focus$, state.keyup$)));

  var withValues$ = flyd.lift(R.pair, state.val$, state.values$);
  state.partialMatches$ = flyd.scanMerge([[withValues$, filterValues], [empty$, function (matches, vals) {
    return state.showInitial ? vals : [];
  }], [state.select$, R.always([])]], []);
  if (state.limit) state.partialMatches$ = flyd.map(R.take(state.limit), state.partialMatches$);

  // Index of currently selected dropdown item
  var downWithLength$ = flyd.sampleOn(state.downArrow$, state.partialMatches$);
  state.dropdownIdx$ = flyd.scanMerge([[state.upArrow$, function (idx) {
    return idx === 0 ? 0 : idx - 1;
  }] // decrement, but not below 0
  , [downWithLength$, function (idx, matches) {
    return idx >= matches.length - 1 ? matches.length - 1 : idx + 1;
  }] // increment, but not above the length-1
  , [state.hoverVal$, function (oldIdx, newIdx) {
    return newIdx;
  }]], 0);

  return state;
}

var filterValues = function filterValues(matches, pair) {
  var _pair = _slicedToArray(pair, 2),
      newVal = _pair[0],
      values = _pair[1];

  return newVal && newVal.length ? R.filter(function (v) {
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
var tabKey = function tabKey(ev) {
  return ev.keyCode === 9;
};

function view(input, state) {
  var matches = state.partialMatches$();
  input.data.on = input.data.on || {};
  input.data.on.keydown = function (ev) {
    if (upArrow(ev)) {
      state.upArrow$(ev);
      ev.preventDefault();
      return false;
    } else if (downArrow(ev)) {
      state.downArrow$(ev);
      ev.preventDefault();
      return false;
    } else if ((tabKey(ev) || enterKey(ev)) && matches.length) {
      state.select$(state.partialMatches$()[state.dropdownIdx$()]);
      ev.preventDefault();
      return false;
    }
  };
  input.data.on.keyup = state.keyup$;
  input.data.on.focus = state.focus$;
  input.data.on.blur = state.blur$;
  input.data.props = input.data.props || {};
  input.data.props.value = state.val$() || '';

  var dropdown = h('div', {
    attrs: { 'data-ff-autocomplete-dropdown': matches.length ? 'open' : 'closed' }
  }, R.addIndex(R.map)(dropdownValue(state), matches));

  return h('div', { attrs: { 'data-ff-autocomplete': '' } }, [input, dropdown]);
}

var dropdownValue = function dropdownValue(state) {
  return function (val, idx) {
    return h('div', {
      on: {
        mousedown: function mousedown(ev) {
          return ev.preventDefault();
        },
        click: function click(ev) {
          return state.select$(state.partialMatches$[idx]);
        },
        mouseover: [state.hoverVal$, idx]
      },
      attrs: { 'data-ff-autocomplete-value': state.dropdownIdx$() === idx ? 'selecting' : '' }
    }, val);
  };
};

module.exports = { init: init, view: view };

