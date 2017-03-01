var merge = require('ramda/src/merge')
var always = require('ramda/src/always')
var flyd = require('flyd')
var h = require('snabbdom/h').default
flyd.flatMap = require('flyd/module/flatmap')
flyd.afterSilence = require('flyd/module/aftersilence')

// Pushes null values to the messages stream after a delay
// pseudocode example with a 1000ms delay:
// {[message1, 0ms], [message2, 5000ms]}
// {[message1, 0ms], [null, 1000ms], [message2, 5000ms], [null, 6000ms]}

function init(state) {
  state = merge({hideDelay: 5000, message$: flyd.stream()}, state || {})
  // Stream of null value after a ms delay
  var hideDelay = function() { return flyd.afterSilence(state.hideDelay, flyd.stream(1)) }
  var hide$ = flyd.map(always(null), flyd.flatMap(hideDelay, state.message$))
  state.msg$ = flyd.merge(state.message$, hide$)

  return state
}


function view(state) {
  return h('div', {
    attrs: {'data-ff-notification': state.msg$() ? 'shown' : 'hidden'}
  }, [ state.msg$() || '' ])
}

module.exports = {view: view, init: init}
