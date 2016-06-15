import flyd from 'flyd'
import h from 'snabbdom/h'
import R from 'ramda'
flyd.flatMap = require('flyd/module/flatmap')
flyd.afterSilence = require('flyd/module/aftersilence')

// Pushes null values to the messages stream after a delay
// pseudocode example with a 1000ms delay:
// {[message1, 0ms], [message2, 5000ms]}
// {[message1, 0ms], [null, 1000ms], [message2, 5000ms], [null, 6000ms]}

const log = R.curryN(2, console.log.bind(console))

window.flyd = flyd

function init(state) {
  state = R.merge({hideDelay: 5000, message$: flyd.stream()}, state || {})
  // Stream of null value after a ms delay
  // const hide$ = flyd.map(R.always(null), flyd.flatMap(() => flyd.afterSilence(state.hideDelay, flyd.stream(1)), state.message$))
  // state.message$ = flyd.merge(state.message$, hide$)

  const hide$ = flyd.map(R.always(null), flyd.flatMap(() => flyd.afterSilence(state.hideDelay, flyd.stream(1)), state.message$))
  state.msg$ = flyd.merge(state.message$, hide$)

  return state
}


function view(state) {
  return h('div.ff-notification', { 
    class: {'ff-notification--inView': state.msg$()} 
  }, state.msg$() ? String(state.msg$()) : '' )
}

module.exports = {view, init}
