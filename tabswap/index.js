'use strict';

var flyd = require('flyd');
var h = require('snabbdom/h');
var R = require('ramda');

var map = R.addIndex(R.map);

var labels = function labels(options) {
  options = R.merge({
    names: [],
    active$: flyd.stream(0),
    setWidth: false
  }, options);

  var width = options.setWidth ? 100 / options.names.length + '%' : '';

  return h('div', {
    attrs: {
      'data-ff-tabswap': 'active:' + options.active$(),
      'data-ff-tabswap-labels': true,
      'data-ff-tabswap-labels-count': options.names.length
    }
  }, map(labelSingle(options.active$, width), options.names));
};

var labelSingle = function labelSingle(active$, width) {
  return function (name, idx) {
    return h('div', {
      attrs: { 'data-ff-tabswap-label-wrapper': true },
      style: { width: width }
    }, [h("a", {
      on: { click: [active$, idx] },
      attrs: {
        'data-ff-tabswap-label': active$() === idx ? 'active' : 'inactive'
      }
    }, [name || ''])]);
  };
};

var content = function content(options) {
  options = R.merge({
    sections: [],
    active$: flyd.stream(0)
  }, options);
  return h('div', {
    attrs: {
      'data-ff-tabswap': 'active:' + options.active$(),
      'data-ff-tabswap-content-wrapper': true,
      'data-ff-tabswap-count': options.sections.length
    }
  }, map(contentSingle(options.active$), options.sections));
};

var contentSingle = function contentSingle(active$) {
  return function (section, idx) {
    return h('div', {
      attrs: { 'data-ff-tabswap-content': active$() === idx ? 'active' : 'inactive' }
    }, section);
  };
};

module.exports = { labels: labels, content: content };

