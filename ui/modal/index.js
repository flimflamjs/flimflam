var flyd = require('flyd')
var h = require('snabbdom/h').default
var R = require('ramda')

function view(state) {
  var hook
  if(state.noVerticalCentering) {
    hook = {}
  } else {
    hook = { insert: addResizeListener(state), postpatch: verticallyCenter(state) }
  }
  return h('div', { // shaded overlay around modal
    on: {click: closeIfOnBackdrop(state.show$, state.notCloseable)}
  , attrs: {'data-ff-modal-backdrop': state.show$() ? 'shown' : 'hidden'}
  }, [
    h('div', {
      hook
    , attrs: {'data-ff-modal': state.show$() ? 'shown' : 'hidden'}
    }, [
      state.notCloseable ? '' : closeBtn(state.show$)
    , state.title ? header(state) : ''
    , body(state)
    , state.footer ? footer(state) : ''
    ])
  ])
}

var verticallyCenter = R.curryN(2, function(state, vnode) {
  var node = vnode.elm
  var windowHeight = window.innerHeight
  var margin = state.margin || 20
  var top = (windowHeight - node.offsetHeight) / 4
  top = top < margin ? margin : top
  node.style.top = top + 'px'

  var bodyElm = node.querySelector('[data-ff-modal-body]')
  var footerElm = node.querySelector('[data-ff-modal-footer]')
  var footerHeight = footerElm ? footerElm.offsetHeight : 0
  var headerElm = node.querySelector('[data-ff-modal-header]')
  var headerHeight = headerElm ? headerElm.offsetHeight : 0
  var bodyHeight = windowHeight - margin * 2 - footerHeight - headerHeight
  var scrollHeight = bodyElm.scrollHeight
  if(bodyHeight < scrollHeight) bodyElm.style.height = bodyHeight + 'px'
  else bodyElm.style.height = 'auto'
})

var addResizeListener = R.curryN(2, function(state, vnode) {
  window.addEventListener('resize', function(ev) { verticallyCenter(state, vnode) })
})

// Push to the close stream if the user clicks the shaded backdrop element (and not anywhere within the modal itself)
var closeIfOnBackdrop = R.curryN(3, function(show$, notCloseable, ev) {
  if(notCloseable) return
  var className = ev.target.className
  // If not clicking the backdrop, don't close the modal, just return early
  if(!ev.target.hasAttribute('data-ff-modal-backdrop')) return
  // Else close the modal
  show$(false)
})

var header = function(state) {
  return h('div', {attrs: {'data-ff-modal-header': ''}}, [h('h4', [state.title])])
}

var body = function(state) {
  return h('div', {attrs: {'data-ff-modal-body': ''}}, state.body.constructor === Array ? state.body : [state.body])
}

var closeBtn = function(show$) {
  return h('a', {attrs: {'data-ff-modal-close-button': ''}, on: {click: [show$, false]}})
}

var footer = function(state) {
  return h('div', {attrs: {'data-ff-modal-footer': ''}}, state.footer.constructor === Array ? state.footer : [state.footer])
}


module.exports = view
