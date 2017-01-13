'use strict';

var _flyd = require('flyd');

var _flyd2 = _interopRequireDefault(_flyd);

var _h = require('snabbdom/h');

var _h2 = _interopRequireDefault(_h);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function view(state) {
  var hook = void 0;
  if (state.noVerticalCentering) {
    hook = {};
  } else {
    hook = { insert: addResizeListener(state), postpatch: verticallyCenter(state) };
  }
  return (0, _h2.default)('div', { // shaded overlay around modal
    on: { click: closeIfOnBackdrop(state.id$, state.notCloseable) },
    attrs: { 'data-ff-modal-backdrop': state.id$() === state.thisID ? 'shown' : 'hidden' }
  }, [(0, _h2.default)('div', {
    hook: hook,
    props: { id: state.thisID },
    attrs: { 'data-ff-modal': state.id$() === state.thisID ? 'shown' : 'hidden' }
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

    var bodyElm = node.querySelector('[data-ff-modal-body]');
    var footerElm = node.querySelector('[data-ff-modal-footer]');
    var footerHeight = footerElm ? footerElm.offsetHeight : 0;
    var headerElm = node.querySelector('[data-ff-modal-header]');
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
var closeIfOnBackdrop = function closeIfOnBackdrop(id$, notCloseable) {
  return function (ev) {
    if (notCloseable) return;
    var className = ev.target.className;
    // If not clicking the backdrop, don't close the modal, just return early
    if (!ev.target.hasAttribute('data-ff-modal-backdrop')) return;
    // Else close the modal
    id$(null);
  };
};

var header = function header(state) {
  return (0, _h2.default)('div', { attrs: { 'data-ff-modal-header': '' } }, [(0, _h2.default)('h4', [state.title])]);
};

var body = function body(state) {
  return (0, _h2.default)('div', { attrs: { 'data-ff-modal-body': '' } }, state.body.constructor === Array ? state.body : [state.body]);
};

var closeBtn = function closeBtn(id$) {
  return (0, _h2.default)('a', { attrs: { 'data-ff-modal-close-button': '' }, on: { click: [id$, null] } });
};

var footer = function footer(state) {
  return (0, _h2.default)('div', { attrs: { 'data-ff-modal-footer': '' } }, state.footer.constructor === Array ? state.footer : [state.footer]);
};

module.exports = view;

