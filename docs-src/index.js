const flyd = require('flyd')
const h = require('snabbdom/h').default
const R = require('ramda')
const render = require('../render')
const confirmation = require('../ui/confirmation')
const btn = require('../ui/button')
const modal = require('../ui/modal')

const wiz = require('./lib/wizard-example')
const notif = require('./lib/notification-example')
const conf = require('./lib/confirmation-example')
const form = require('./lib/validated-form-example')

function init() {
  const showConf$ = flyd.stream()
  return {
    showModal$: flyd.stream()
  , showWizardModal$: flyd.stream()
  , showFormModal$: flyd.stream()
  , loading$: flyd.stream()
  , showConf$
  , conf: confirmation.init(showConf$)
  , wiz: wiz.init()
  , notif: notif.init()
  , form: form.init()
  }
}

function view(state) {
  return h('body.container', [
    h('h1', 'Flimflam Core UI Components')
  , h('p', 'The core UI components for Flimflam, combined with existing HTML elements, constitute all the basic necessary user interface functionality. All of these components can be styled in vastly different ways and can be composed and nested. More UI components in the Flimflam ecosystem can be found on [this page](xyz)')
  , h('h2', 'Modal')
  , h('p', 'Modals create overlay content.')
  , h('button', {on: {click: [state.showModal$, true]}}, "Open a sample modal")

  , h('h2', 'Wizard')
  , h('p', 'Wizards allow you to split up a large form into sequential steps. You can control how the user is able to skip forward or backward.')
  , h('button', {on: {click: [state.showWizardModal$, true]}}, "Open a sample wizard")
  , modal({
      show$: state.showWizardModal$
    , body: wiz.view(state.wiz)
    })

  , h('h2', 'Notification')
  , h('p', 'Notifications show a message and then hide after a few seconds. They are useful for showing "saved" messages, errors, or anything else.')
  , h('button', {on: {click: [state.notif.message$, 'hi there! This will hide again in a few seconds.']}}, "Show a sample notification")
  , notif.view(state.notif)

  , h('h2', 'Submit Button')
  , h('p', 'Submit buttons are useful in forms that call ajax and need to have a loading state. They can also display a stream of error messages.')
  , h('form', {
      on: {submit: ev => {ev.preventDefault(); state.loading$(true)}}
    }, [
      btn({
        buttonText: "Click me to toggle this button's loading state"
      , loading$: state.loading$
      , loadingText: "this is some loading text...."
      })
    ])

  , h('h2', 'Confirmation')
  , h('p', 'Confirmation dialogs are useful for double-checking risky user actions.')
  , h('button', {on: {click: [state.showConf$, true]}}, "Show a confirmation dialog")
  , conf(state)

  , h('h2', 'Validated Form')
  , h('p', 'Validated forms are useful for providing instant feedback to users showing whether their inputs into a form are valid')
  , h('button', {on: {click: [state.showFormModal$, true]}}, "Show a validated form")
  , modal({
      show$: state.showFormModal$
    , body: form.view(state.form)
    })

  /*
  , h('h2', 'Autocomplete')
  , h('p', 'An autocompleted input or textarea allows users to view pre-existing values for the input as they type, scroll through them, and select one.')
  , h('input', {props: {type: 'text', placeholder: 'Type something here'}})

  , h('h2', 'Combobox')
  , h('p', 'A combobox combines a dropdown and an autocompleted input so that your users can type a value or select an existing entry')
  , h('input', {props: {type: 'text', placeholder: 'Type something here'}})

  , h('h2', 'Tooltip')
  , h('p', 'A tooltip gives useful information over a specific element on the page, and can be closed.')
  , h('button', 'Show tooltip')
  */

  , modal({
      show$: state.showModal$
    , body: h('p', "this is a sample modal hello!")
    , title: 'this is a header'
    , footer: h('p', 'this is part of the footer')
    })
  ])
}

const state = init()
const container = document.body
render(view, state, container)
