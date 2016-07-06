import flyd from 'flyd'
import h from 'snabbdom/h'
import R from 'ramda'

export default function view(state) {
  let hook
  if(state.noVerticalCentering) {
    hook = {}
  } else {
    hook = { insert: addResizeListener(state), postpatch: verticallyCenter(state) }
  }
  return h('div.ff-modalBackdrop', { // shaded overlay around modal
    class: { 'ff-modalBackdrop--inView': state.id$() === state.thisID }
  , on: {click: closeIfOnBackdrop(state.id$)}
  }, [
    h('div.ff-modal', {
      hook
    , props: { id: state.thisID }
    , class: { 'ff-modal--inView': state.id$() === state.thisID }
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
  
  let bodyElm = node.querySelector('.ff-modal-body')
  let footerElm = node.querySelector('.ff-modal-footer')
  let footerHeight = footerElm ? footerElm.offsetHeight : 0
  let headerElm = node.querySelector('.ff-modal-header')
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
const closeIfOnBackdrop = id$ => ev => {
  const className = ev.target.className
  if(className.indexOf('ff-modalBackdrop') === -1 && className.indexOf('ff-modal-container') === -1) {
    return
  }
  id$(null) // close modal
}

const header = state =>
  h('div.ff-modal-header', [h('h4', [state.title])])

const body = state =>
  h('div.ff-modal-body', state.body.constructor === Array ? state.body : [state.body])

const closeBtn = id$ =>
  h('a.ff-modal-closeButton', {on: {click: [id$, null]}, props: {innerHTML: '&times;'}})

const footer = state =>
  h('div.ff-modal-footer', state.footer.constructor === Array ? state.footer : [state.footer])

