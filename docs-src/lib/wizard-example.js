const flyd = require('flyd')
const h = require('snabbdom/h').default
const R = require('ramda')
const wizard = require('../../wizard')

const init = () => {
  const currentStep$ = flyd.stream(0)
  const wiz = wizard.init({currentStep$})
  return {wiz, currentStep$}
}

const view = state => {
  const steps = ['Step 1', 'Step 2', 'Step 3']
  const followup = h('p', 'has terminado el mago! salud!')
  const content = [
    h('div', [
      h('p', 'mago paso uno contenido')
    , h('button', {on: {click: [state.wiz.currentStep$, 1]}}, 'Next')
    ])
  , h('div', [
      h('p', 'mago paso dos contenido')
    , h('button', {on: {click: [state.wiz.currentStep$, 2]}}, 'Next')
    ])
  , h('div', [
      h('p', 'la ultima paso de el mago')
    , h('button', {on: {click: [state.wiz.isCompleted$, true]}}, 'Finish')
    ])
  ]
  return h('div', [
    h('p', 'el mago:')
  , wizard.labels(state.wiz, steps)
  , wizard.content(state.wiz, content, followup)
  ])
}

module.exports = {view, init}
