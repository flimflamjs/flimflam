var R = require('ramda')
var flyd = require('flyd')
flyd.mergeAll = require('flyd/module/mergeall')

var snabbdom = require('snabbdom')
var patch = snabbdom.init([
  require('snabbdom/modules/class').default
, require('snabbdom/modules/props').default
, require('snabbdom/modules/style').default
, require('snabbdom/modules/eventlisteners').default
, require('snabbdom/modules/attributes').default
])

// A component has a:
//   state: object of static data and flyd streams
//   view: snabbdom view function
//   container: the DOM element we want to replace with our rendered snabbdom tree
function render(view, state, container) {
  var state$ = flyd.mergeAll(getObjStreams(state))
  var viewState = function() { return view(state) }
  var view$ = flyd.map(viewState, state$)
  var vtree$ = flyd.scan(patch, container, view$)
  state$([]) // trigger an initial patch
  var dom$ = flyd.map(function(vnode) { return vnode.elm }, vtree$)
  return {state$: state$, vtree$: vtree$, dom$: dom$}
}

// Return all the streams within an object, including those nested further down
function getObjStreams(obj) {
  var stack = [obj]
  var streams = []
  while(stack.length) {
    var vals = R.values(stack.pop())
    streams = R.concat(streams, R.filter(flyd.isStream, vals))
    stack = R.concat(stack, R.filter(isPlainObj, vals))
  }
  return streams
}

// Utils

function isPlainObj(obj) {
  if (typeof obj === 'object' && obj !== null) {
    if (typeof Object.getPrototypeOf === 'function') {
      var proto = Object.getPrototypeOf(obj)
      return proto === Object.prototype || proto === null
    }
    return Object.prototype.toString.call(obj) == '[object Object]'
  }
  return false
}


module.exports = render

