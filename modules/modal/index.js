'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _flyd = require('flyd');

var _flyd2 = _interopRequireDefault(_flyd);

var _snabbdomH = require('snabbdom/h');

var _snabbdomH2 = _interopRequireDefault(_snabbdomH);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

// -- id can be blank or undefined, which closes modals
function init(id$) {
  return {
    streams: { currentID: id$ },
    state: { currentID: '' }
  };
}

var view = function view(ctx, config) {
  return (0, _snabbdomH2['default'])('div.ff-modalBackdrop', { // shaded overlay around modal
    'class': { inView: ctx.state.currentID === config.id },
    on: { click: closeIfOnBackdrop(ctx.streams.currentID) }
  }, [(0, _snabbdomH2['default'])('div', {
    props: { id: config.id, className: 'ff-modal ' + (config.className || '') },
    'class': { inView: ctx.state.currentID === config.id }
  }, [config.notCloseable ? '' : closeBtn(ctx.streams.currentID), config.title ? header(config) : '', body(config), config.footer ? footer(config) : ''])]);
};

// Push to the close stream if the user clicks the shaded backdrop element (and not anywhere within the modal itself)
var closeIfOnBackdrop = function closeIfOnBackdrop(id$) {
  return function (ev) {
    return ev.target.className.indexOf('modalBackdrop') !== -1 ? id$(null) : null;
  };
};

var header = function header(conf) {
  return (0, _snabbdomH2['default'])('header.ff-modal-header', [(0, _snabbdomH2['default'])('h4', [conf.title])]);
};

var body = function body(conf) {
  return (0, _snabbdomH2['default'])('div.ff-modal-body', conf.body.constructor === Array ? conf.body : [conf.body]);
};

var closeBtn = function closeBtn(id$) {
  return (0, _snabbdomH2['default'])('img.ff-modal-closeButton', { on: { click: [id$, null] }, props: { innerHTML: '&times;' } });
};

var footer = function footer(config) {
  return (0, _snabbdomH2['default'])('div.ff-modal-footer', config.footer.constructor === Array ? config.footer : [config.footer]);
};

module.exports = { view: view, init: init };

