'use strict';

var _snabbdom = require('snabbdom');

var _snabbdom2 = _interopRequireDefault(_snabbdom);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _flyd = require('flyd');

var _flyd2 = _interopRequireDefault(_flyd);

var _h = require('snabbdom/h');

var _h2 = _interopRequireDefault(_h);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (options) {
  // Set defaults
  options = _ramda2.default.merge({
    labels: [],
    content: [],
    active$: _flyd2.default.stream(0)
  }, options);

  return (0, _h2.default)('div', {
    attrs: { 'data-ff-tabswap': 'active:' + options.active$() }
  }, [labelDiv(options.active$, options.content, options.labels), contentDiv(options.active$, options.content)]);
};

var labelDiv = function labelDiv(active$, content, labels) {
  return (0, _h2.default)('div', _ramda2.default.addIndex(_ramda2.default.map)(labelSingle(active$, labels), content));
};

var labelSingle = function labelSingle(active$, labels) {
  return function (c, idx) {
    return (0, _h2.default)("a", {
      on: { click: [active$, idx] },
      attrs: {
        'data-ff-tabswap-label': active$() === idx ? 'active' : 'inactive'
      }
    }, labels[idx] || '');
  };
};

var contentDiv = function contentDiv(active$, content) {
  return (0, _h2.default)('div', _ramda2.default.addIndex(_ramda2.default.map)(contentSingle(active$), content));
};

var contentSingle = function contentSingle(active$) {
  return function (content, idx) {
    return (0, _h2.default)('div', {
      attrs: {
        'data-ff-tabswap-content': active$() === idx ? 'active' : 'inactive'
      }
    }, content);
  };
};

