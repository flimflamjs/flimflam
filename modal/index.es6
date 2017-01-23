const flyd = require('flyd')
const h = require('snabbdom/h')
const R = require('ramda')

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

const verticallyCenter = state => vnode => {
  var node = vnode.elm
  const windowHeight = window.innerHeight
  const margin = state.margin || 20 
  var top = (windowHeight - node.offsetHeight) / 4
  top = top < margin ? margin : top
  node.style.top = top + 'px'
  
  var bodyElm = node.querySelector('[data-ff-modal-body]')
  const footerElm = node.querySelector('[data-ff-modal-footer]')
  const footerHeight = footerElm ? footerElm.offsetHeight : 0
  const headerElm = node.querySelector('[data-ff-modal-header]')
  const headerHeight = headerElm ? headerElm.offsetHeight : 0
  const bodyHeight = windowHeight - margin * 2 - footerHeight - headerHeight
  const scrollHeight = bodyElm.scrollHeight
  if(bodyHeight < scrollHeight) bodyElm.style.height = bodyHeight + 'px'
  else bodyElm.style.height = 'auto'
}

const addResizeListener = state => vnode => {
  window.addEventListener('resize', ev => verticallyCenter(state)(vnode))
}

// Push to the close stream if the user clicks the shaded backdrop element (and not anywhere within the modal itself)
const closeIfOnBackdrop = (show$, notCloseable) => ev => {
  if(notCloseable) return
  const className = ev.target.className
  // If not clicking the backdrop, don't close the modal, just return early
  if(!ev.target.hasAttribute('data-ff-modal-backdrop')) return
  // Else close the modal
  show$(false) 
}

const header = state =>
  h('div', {attrs: {'data-ff-modal-header': ''}}, [h('h4', [state.title])])

const body = state =>
  h('div', {attrs: {'data-ff-modal-body': ''}}, state.body.constructor === Array ? state.body : [state.body])

const closeBtn = show$ =>
  h('a', {attrs: {'data-ff-modal-close-button': ''}, on: {click: [show$, false]}})

const footer = state =>
  h('div', {attrs: {'data-ff-modal-footer': ''}}, state.footer.constructor === Array ? state.footer : [state.footer])


module.exports = view
