const h = require('snabbdom/h').default
const confirmation = require('../../ui/confirmation')

const view = state => {
  return h('div', [
    confirmation.view(state.conf, {
      prompt: 'Are you sure? (This text is customizable)'
    , confirmText: 'Muy seguro'
    , denyText: 'No!'
    })
  ])
}

module.exports = view
