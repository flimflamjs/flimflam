const flyd = require('flyd')
const h = require('snabbdom/h')
const R = require('ramda')

const wizard = require("../modal")
const wizard = require("../wizard")
require('../wizard/index.css')

const init = () => {
  const currentStep$ = flyd.stream()
  const wiz = wizard.init({currentStep$})
  return {wiz, currentStep$}
}

const view = state => {
  const body = wizard.view(state.wiz, {
    steps: [
      {
        name: 'Step 1'
      , body: 'step 1 body'
      }
    , {
        name: 'Step 2'
      , body: 'step 2 body'
      }
    , {
        name: 'Step 3'
      , body: 'step 3 body'
      }
    ]
  })
  return modal({
    thisID: 'wizardSample'
  , id: state.modalID$
  , body
  })
}

module.exports = {view, init}
