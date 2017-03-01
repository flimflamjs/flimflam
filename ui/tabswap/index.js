var flyd = require('flyd')
var h = require('snabbdom/h').default
var map = require('ramda/src/addIndex')(require('ramda/src/map'))
var merge = require('ramda/src/merge')
var curryN = require('ramda/src/curryN')

var labels = function(options) {
  options = merge({
    names: []
  , active$: flyd.stream(0)
  , setWidth: false
  }, options)

  var width = options.setWidth ? (100 / options.names.length + '%') : ''

  return h('div', {
    attrs: {
      'data-ff-tabswap': 'active:' + options.active$()
    , 'data-ff-tabswap-labels': true
    , 'data-ff-tabswap-labels-count': options.names.length
    }
  },
    map(labelSingle(options.active$, width), options.names)
  )
}

var labelSingle = curryN(4, function(active$, width, name, idx) {
  return h('div', {
    attrs: {'data-ff-tabswap-label-wrapper': true}
  , style: {width}
  }, [
    h("a", {
      on: {click: [active$, idx]}
    , attrs: {
        'data-ff-tabswap-label': active$() === idx ? 'active' : 'inactive'
      }
    }, [name || ''])
  ])
})


var content = function(options) {
  options = merge({
    sections: []
  , active$: flyd.stream(0)
  }, options)
  return h('div', {
    attrs: {
      'data-ff-tabswap': 'active:' + options.active$()
    , 'data-ff-tabswap-content-wrapper': true
    , 'data-ff-tabswap-count': options.sections.length
    }
  },
    map(contentSingle(options.active$), options.sections)
  )
}

var contentSingle = curryN(3, function(active$, section, idx) {
  return h('div', {
    attrs: { 'data-ff-tabswap-content': active$() === idx ? 'active' : 'inactive' }
  }, section)
})


module.exports = {labels: labels, content: content}
