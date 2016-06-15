'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = view;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _flyd = require('flyd');

var _flyd2 = _interopRequireDefault(_flyd);

var _snabbdomH = require('snabbdom/h');

var _snabbdomH2 = _interopRequireDefault(_snabbdomH);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

function view(state) {
  return (0, _snabbdomH2['default'])('div.ff-modalBackdrop', { // shaded overlay around modal
    'class': { 'ff-modalBackdrop--inView': state.id$() === state.thisID },
    on: { click: closeIfOnBackdrop(state.id$) }
  }, [(0, _snabbdomH2['default'])('div.ff-modal', {
    props: { id: state.thisID },
    'class': { 'ff-modal--inView': state.id$() === state.thisID }
  }, [state.notCloseable ? '' : closeBtn(state.id$), state.title ? header(state) : '', body(state), state.footer ? footer(state) : ''])]);
}

// Push to the close stream if the user clicks the shaded backdrop element (and not anywhere within the modal itself)
var closeIfOnBackdrop = function closeIfOnBackdrop(id$) {
  return function (ev) {
    return ev.target.className.indexOf('modalBackdrop') !== -1 ? id$(null) : null;
  };
};

var header = function header(state) {
  return (0, _snabbdomH2['default'])('header.ff-modal-header', [(0, _snabbdomH2['default'])('h4', [state.title])]);
};

var body = function body(state) {
  return (0, _snabbdomH2['default'])('div.ff-modal-body', state.body.constructor === Array ? state.body : [state.body]);
};

var closeBtn = function closeBtn(id$) {
  return (0, _snabbdomH2['default'])('img.ff-modal-closeButton', { on: { click: [id$, null] }, props: { innerHTML: '&times;' } });
};

var footer = function footer(state) {
  return (0, _snabbdomH2['default'])('div.ff-modal-footer', state.footer.constructor === Array ? state.footer : [state.footer]);
};
module.exports = exports['default'];

