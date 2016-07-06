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
  var hook = undefined;
  if (state.noVerticalCentering) {
    hook = {};
  } else {
    hook = { insert: addResizeListener(state), postpatch: verticallyCenter(state) };
  }
  return (0, _snabbdomH2['default'])('div.ff-modalBackdrop', { // shaded overlay around modal
    'class': { 'ff-modalBackdrop--inView': state.id$() === state.thisID },
    on: { click: closeIfOnBackdrop(state.id$) }
  }, [(0, _snabbdomH2['default'])('div.ff-modal', {
    hook: hook,
    props: { id: state.thisID },
    'class': { 'ff-modal--inView': state.id$() === state.thisID }
  }, [state.notCloseable ? '' : closeBtn(state.id$), state.title ? header(state) : '', body(state), state.footer ? footer(state) : ''])]);
}

var verticallyCenter = function verticallyCenter(state) {
  return function (vnode) {
    var node = vnode.elm;
    var windowHeight = window.innerHeight;
    var margin = state.margin || 20;
    var top = (windowHeight - node.offsetHeight) / 4;
    top = top < margin ? margin : top;
    node.style.top = top + 'px';

    var bodyElm = node.querySelector('.ff-modal-body');
    var footerElm = node.querySelector('.ff-modal-footer');
    var footerHeight = footerElm ? footerElm.offsetHeight : 0;
    var headerElm = node.querySelector('.ff-modal-header');
    var headerHeight = headerElm ? headerElm.offsetHeight : 0;
    var bodyHeight = windowHeight - margin * 2 - footerHeight - headerHeight;
    var scrollHeight = bodyElm.scrollHeight;
    if (bodyHeight < scrollHeight) bodyElm.style.height = bodyHeight + 'px';else bodyElm.style.height = 'auto';
  };
};

var addResizeListener = function addResizeListener(state) {
  return function (vnode) {
    window.addEventListener('resize', function (ev) {
      return verticallyCenter(state)(vnode);
    });
  };
};

// Push to the close stream if the user clicks the shaded backdrop element (and not anywhere within the modal itself)
var closeIfOnBackdrop = function closeIfOnBackdrop(id$) {
  return function (ev) {
    var className = ev.target.className;
    if (className.indexOf('ff-modalBackdrop') === -1 && className.indexOf('ff-modal-container') === -1) {
      return;
    }
    id$(null); // close modal
  };
};

var header = function header(state) {
  return (0, _snabbdomH2['default'])('div.ff-modal-header', [(0, _snabbdomH2['default'])('h4', [state.title])]);
};

var body = function body(state) {
  return (0, _snabbdomH2['default'])('div.ff-modal-body', state.body.constructor === Array ? state.body : [state.body]);
};

var closeBtn = function closeBtn(id$) {
  return (0, _snabbdomH2['default'])('a.ff-modal-closeButton', { on: { click: [id$, null] }, props: { innerHTML: '&times;' } });
};

var footer = function footer(state) {
  return (0, _snabbdomH2['default'])('div.ff-modal-footer', state.footer.constructor === Array ? state.footer : [state.footer]);
};
module.exports = exports['default'];

