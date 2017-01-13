import flyd from 'flyd'
import h from 'snabbdom/h'
import R from 'ramda'

function view(state) {
  let hook
  if(state.noVerticalCentering) {
    hook = {}
  } else {
    hook = { insert: addResizeListener(state), postpatch: verticallyCenter(state) }
  }
  return h('div', { // shaded overlay around modal
    on: {click: closeIfOnBackdrop(state.id$, state.notCloseable)}
  , attrs: {'data-ff-modal-backdrop': state.id$() === state.thisID ? 'shown' : 'hidden'}
  }, [
    h('div', {
      hook
    , props: { id: state.thisID }
    , attrs: {'data-ff-modal': state.id$() === state.thisID ? 'shown' : 'hidden'}
    }, [
      state.notCloseable ? '' : closeBtn(state.id$)
    , state.title ? header(state) : ''
    , body(state)
    , state.footer ? footer(state) : ''
    ])
  ])
}

const verticallyCenter = state => vnode => {
  let node = vnode.elm
  let windowHeight = window.innerHeight
  let margin = state.margin || 20 
  let top = (windowHeight - node.offsetHeight) / 4
  top = top < margin ? margin : top
  node.style.top = top + 'px'
  
  let bodyElm = node.querySelector('[data-ff-modal-body]')
  let footerElm = node.querySelector('[data-ff-modal-footer]')
  let footerHeight = footerElm ? footerElm.offsetHeight : 0
  let headerElm = node.querySelector('[data-ff-modal-header]')
  let headerHeight = headerElm ? headerElm.offsetHeight : 0
  let bodyHeight = windowHeight - margin * 2 - footerHeight - headerHeight
  let scrollHeight = bodyElm.scrollHeight
  if(bodyHeight < scrollHeight) bodyElm.style.height = bodyHeight + 'px'
  else bodyElm.style.height = 'auto'
}

const addResizeListener = state => vnode => {
  window.addEventListener('resize', ev => verticallyCenter(state)(vnode))
}

// Push to the close stream if the user clicks the shaded backdrop element (and not anywhere within the modal itself)
const closeIfOnBackdrop = (id$, notCloseable) => ev => {
  if(notCloseable) return
  const className = ev.target.className
  // If not clicking the backdrop, don't close the modal, just return early
  if(!ev.target.hasAttribute('data-ff-modal-backdrop')) return
  // Else close the modal
  id$(null) 
}

const header = state =>
  h('div', {attrs: {'data-ff-modal-header': ''}}, [h('h4', [state.title])])

const body = state =>
  h('div', {attrs: {'data-ff-modal-body': ''}}, state.body.constructor === Array ? state.body : [state.body])

const closeBtn = id$ =>
  h('a', {attrs: {'data-ff-modal-close-button': ''}, on: {click: [id$, null]}})

const footer = state =>
  h('div', {attrs: {'data-ff-modal-footer': ''}}, state.footer.constructor === Array ? state.footer : [state.footer])


module.exports = view
