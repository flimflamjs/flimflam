const flyd = require('flyd')
const h = require('snabbdom/h').default
const notification = require('../../ui/notification')

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
