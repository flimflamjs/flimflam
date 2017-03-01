const flyd = require('flyd')
const h = require('snabbdom/h').default
const R = require('ramda')
const notification = require('../../notification')

const init = () => {
  const message$ = flyd.stream()
  const notif = notification.init({message$})
  return {message$, notif}
}

const view = state => {
  return h('div', [
    notification.view(state.notif)
  ])
}

module.exports = {view, init}
