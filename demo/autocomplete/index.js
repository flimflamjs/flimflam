var render = require('../../render')
var autocomplete = require('../../autocomplete')
var h = require('snabbdom/h')
var snabbdom = require('snabbdom')

require('../../autocomplete/index.css')

var state = autocomplete.init({
  values: ['@finn', '@jake', '@pb', '@iceking', '@xxy', '@xxz']
, limit: 3
, showInitial: true
})
var patch = snabbdom.init([
  require('snabbdom/modules/class')
, require('snabbdom/modules/props')
, require('snabbdom/modules/style')
, require('snabbdom/modules/eventlisteners')
])
var view = function(state) {
  var input = h('input', {props: {name: 'x'}})
  return h('body', [autocomplete.view(input, state)])
}


render({container: document.body, view: view, state: state, patch: patch})
