const flyd = require('flyd')
const snabbdom = require('snabbdom')
const h = require('snabbdom/h')
const R = require('ramda')
const render = require('../render')

const modal = require('../modal')
require('../modal/index.css')

const patch = snabbdom.init([
  require('snabbdom/modules/class')
, require('snabbdom/modules/props')
, require('snabbdom/modules/style')
, require('snabbdom/modules/eventlisteners')
, require('snabbdom/modules/attributes')
])

function init() {

  return {
    modalID$: flyd.stream()
  }
}

function view(state) {
  return h('div', [
    h('h1', 'Flimflam Core UI Components')
  , h('h2', 'Modal')
  , h('p', 'Modals allow overlay content.')
  , h('button', {on: {click: [state.modalID$, 'sampleModal']}}, "Open a sample modal")
  , h('h2', 'Wizard')
  , h('p', 'Wizards allow you to split up a large form into sequential steps. You can control how the user is able to skip forward or backward.')
  , h('button', "Open a sample wizard")
  , h('h2', 'Notification')
  , h('p', 'Notifications show a message and then hide after a few seconds. They are useful for showing "saved" messages, errors, or anything else.')
  , h('button', "Show a sample notification")
  , h('h2', 'Submit Button')
  , h('p', 'Submit buttons are useful in forms that call ajax and need to have a loading state.')
  , h('button', "Click me to toggle this button's loading state")
  , h('h2', 'Confirmation')
  , h('p', 'Confirmation dialogs are useful for double-checking risky user actions.')
  , h('button', "Show a confirmation dialog")
  , h('h2', 'Validated Form')
  , h('p', 'Validated forms are useful for providing instant feedback to users showing whether their inputs into a form are valid')
  , h('button', "Show a validated form")
  , h('h2', 'Autocomplete')
  , h('p', 'An autocompleted input or textarea allows users to view pre-existing values for the input as they type, scroll through them, and select one.')
  , h('input', {props: {type: 'text', placeholder: 'Type something here'}})
  , h('h2', 'Combobox')
  , h('p', 'A combobox combines a dropdown and an autocompleted input so that your users can type a value or select an existing entry')
  , h('input', {props: {type: 'text', placeholder: 'Type something here'}})
  , h('h2', 'Tooltip')
  , h('p', 'A tooltip gives useful information over a specific element on the page, and can be closed.')
  , h('button', 'Show tooltip')

  , modal({
      thisID: 'sampleModal'
    , id$: state.modalID$
    , body: h('p', "this is a sample modal hello!")
    })
  ])
}

const state = init()
const container = document.body
render({state, container, patch, view})
