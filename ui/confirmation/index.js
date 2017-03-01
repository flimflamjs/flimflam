var modal = require('../modal')
var R = require('ramda')
var flyd = require('flyd')
var h = require('snabbdom/h').default

var init = function(isOpen$) {
  var [confirmed$, denied$] = [flyd.stream(), flyd.stream()]
  // Stream of true when confirmed, false when denied
  var response$ = flyd.merge(confirmed$, flyd.map(R.always(false), denied$))
  // Show the modal when isOpen$ has a value
  // Close the confirmation modal when the user responds
  var showModal$ = flyd.merge(
    flyd.map(R.always(true), isOpen$)
  , flyd.map(R.always(false), response$)
  )
  return {
    showModal$: showModal$
  , isOpen$: isOpen$
  , confirmed$: confirmed$
  , denied$: denied$
  , response$: response$
  }
}

// Set configuration defaults for the view function
var setConfigDefaults = R.merge({
  confirmText: 'Yes'
, denyText: 'No'
, prompt: 'Are you sure?'
})

// Top-level view function
var view = function(state, config) {
  return h('div', {
    attrs: {'data-ff-confirmation': state.isOpen$() ? 'shown' : 'hidden'}
  }, [
    modal({
      show$: state.showModal$
    , body: modalBody(state, setConfigDefaults(config))
    })
  ])
}

var modalBody = function(state, config) {
  return h('div', {
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
}

module.exports = {init: init, view: view}
