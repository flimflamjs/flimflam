import h from 'snabbdom/h'
import flyd from 'flyd'
import afterSilence from 'flyd/module/aftersilence'
import flatMap from 'flyd/module/flatmap'
import R from 'ramda'

// Pass in a stream of notification messages
const init = (msg$, delayMS) => {
  // Hide notification after 5s delay
  let streams = {
    msg: flyd.merge(msg$, flatMap(() => afterSilence(delayMS, flyd.stream(null)), msg$))
  }
  let updates = {
    msg: (msg, state) => R.merge(state, {msg: msg, isShowing: Boolean(msg)})
  }
  let state = {msg: null, isShowing: false}
  return { state, streams, updates }
}


const view = comp =>
  h('div.notification'
  , {class: {'is-showing': comp.state.isShowing}}
  , String(comp.state.msg ? comp.state.msg : '')
  )

module.exports = {view, init}
