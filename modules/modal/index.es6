import flyd from 'flyd'
import h from 'snabbdom/h'
import R from 'ramda'


// -- id can be blank or undefined, which closes modals
function init(id$) {
  return {
    streams: {currentID: id$}
  , state:   {currentID: ''}
  }
}
  

const view = (ctx, config) =>
  h('div.ff-modalBackdrop', { // shaded overlay around modal
    class: { inView: ctx.state.currentID === config.id }
  , on: {click: closeIfOnBackdrop(ctx.streams.currentID)}
  }, [
    h('div', {
      props: { id: config.id , className: 'ff-modal ' + (config.className || '') }
    , class: { inView: ctx.state.currentID === config.id }
    }, [
      config.notCloseable ? '' : closeBtn(ctx.streams.currentID)
    , config.title ? header(config) : ''
    , body(config)
    , config.footer ? footer(config) : ''
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

const footer = (config) =>
  h('div.ff-modal-footer', config.footer.constructor === Array ? config.footer : [config.footer])

module.exports = {view, init}

