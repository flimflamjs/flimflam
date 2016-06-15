import flyd from 'flyd'
import h from 'snabbdom/h'
import R from 'ramda'


const view = state =>
  h('div.ff-modalBackdrop', { // shaded overlay around modal
    class: { 'ff-modalBackdrop--inView': state.id$() === state.thisID }
  , on: {click: closeIfOnBackdrop(state.id$)}
  }, [
    h('div.ff-modal', {
      props: { id: state.thisID , className: 'ff-modal ' + (state.className || '') }
    , class: { 'ff-modal--inView': state.id$() === state.thisID }
    }, [
      state.notCloseable ? '' : closeBtn(state.id$)
    , state.title ? header(state) : ''
    , body(state)
    , state.footer ? footer(state) : ''
    ])
  ])



// Push to the close stream if the user clicks the shaded backdrop element (and not anywhere within the modal itself)
const closeIfOnBackdrop = id$ => ev =>
  ev.target.className.indexOf('modalBackdrop') !== -1 ? id$(null) : null

const header = conf =>
  h('header.ff-modal-header', [h('h4', [conf.title])])

const body = conf =>
  h('div.ff-modal-body', conf.body.constructor === Array ? conf.body : [conf.body])

const closeBtn = id$ =>
  h('img.ff-modal-closeButton', {on: {click: [id$, null]}, props: {innerHTML: '&times;'}})

const footer = state =>
  h('div.ff-modal-footer', state.footer.constructor === Array ? state.footer : [state.footer])

module.exports = {view, init}

