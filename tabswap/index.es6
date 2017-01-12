import snabbdom from 'snabbdom'
import R from 'ramda'
import flyd from 'flyd'
import h from 'snabbdom/h'

module.exports = options => {
  // Set defaults
  options = R.merge({
    labels: []
  , content: []
  , active$: flyd.stream(0)
  }, options)
 
  return h('div', { 
    attrs: {'data-ff-tabswap': 'active:' + options.active$() }
  }, [
    labelDiv(options.active$, options.content, options.labels)
  , contentDiv(options.active$, options.content)
  ])
}


const labelDiv = (active$, content, labels) =>
  h('div',
    R.addIndex(R.map)(labelSingle(active$, labels), content)
  )

const labelSingle = (active$, labels) => (c, idx) =>
  h("a", {
    on: {click: [active$, idx]}
  , attrs: {
      'data-ff-tabswap-label': active$() === idx ? 'active' : 'inactive'
    }
  }, labels[idx] || '')


const contentDiv = (active$, content) =>
  h('div',
    R.addIndex(R.map)(contentSingle(active$), content)
  )

const contentSingle = active$ => (content, idx) =>
  h('div', {
    attrs: {
      'data-ff-tabswap-content': active$() === idx ? 'active' : 'inactive'
    }
  }, content)

