const modal = require('../modal/index.es6')
const R = require('ramda')
const flyd = require('flyd')
const h = require('snabbdom/h')

const init = isOpen$ => {
  const [confirmed$, denied$] = [flyd.stream(), flyd.stream()]
  // Stream of true when confirmed, false when denied
  const response$ = flyd.merge(
    confirmed$
  , flyd.map(()=> false, denied$)
  )
  // Show the modal when isOpen$ has a value
  // Close the confirmation modal when the user responds
  const showModal$ = flyd.merge(
    flyd.map(()=> true, isOpen$)
  , flyd.map(()=> false, response$)
  )
  return {
    showModal$
  , isOpen$
  , confirmed$
  , denied$
  , response$
  }
}

// Set configuration defaults for the view function
const setConfigDefaults = R.merge({
  confirmText: 'Yes'
, denyText: 'No'
, prompt: 'Are you sure?'
})

// Top-level view function
const view = (state, config) => {
  return h('div', {
    attrs: {'data-ff-confirmation': state.isOpen$() ? 'shown' : 'hidden'}
  }, [
    modal({
      show$: state.showModal$
    , body: modalBody(state, setConfigDefaults(config))
    })
  ])
}

const modalBody = (state, config) =>
  h('div', {
    attrs: {'data-ff-confirmation-body': ''}
  }, [
    h('p', {attrs: {'data-ff-confirmation-prompt': ''}}, [config.prompt])
  , h('div', {
    }, [
      h('button', {
        on: {click: [state.confirmed$, true]}
      , attrs: {'data-ff-confirmation-button': 'yes'}
      }, [
        config.confirmText
      ])
    , h('button', {
        on: {click: [state.denied$, true]}
      , attrs: {'data-ff-confirmation-button': 'no'}
      }, [
        config.denyText
      ])
    ])
  ])

module.exports = {init, view}
