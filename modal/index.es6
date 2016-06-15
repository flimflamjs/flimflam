import flyd from 'flyd'
import h from 'snabbdom/h'
import R from 'ramda'


export default function view(state) {
  return h('div.ff-modalBackdrop', { // shaded overlay around modal
    class: { 'ff-modalBackdrop--inView': state.id$() === state.thisID }
  , on: {click: closeIfOnBackdrop(state.id$)}
  }, [
    h('div.ff-modal', {
      props: { id: state.thisID }
    , class: { 'ff-modal--inView': state.id$() === state.thisID }
    }, [
      state.notCloseable ? '' : closeBtn(state.id$)
    , state.title ? header(state) : ''
    , body(state)
    , state.footer ? footer(state) : ''
    ])
  ])
}



// Push to the close stream if the user clicks the shaded backdrop element (and not anywhere within the modal itself)
const closeIfOnBackdrop = id$ => ev =>
  ev.target.className.indexOf('modalBackdrop') !== -1 ? id$(null) : null

const header = state =>
  h('header.ff-modal-header', [h('h4', [state.title])])

const body = state =>
  h('div.ff-modal-body', state.body.constructor === Array ? state.body : [state.body])

const closeBtn = id$ =>
  h('img.ff-modal-closeButton', {on: {click: [id$, null]}, props: {innerHTML: '&times;'}})

const footer = state =>
  h('div.ff-modal-footer', state.footer.constructor === Array ? state.footer : [state.footer])

