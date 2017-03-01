# FLIMFLAM confirmation dialog component

This is a UI component for flimflam for offering a "Yes/No" confirmation dialog box for user actions. It uses the modal component and it returns a few streams for handling the user's response to the dialog:


_Usage_

```js
const confirmation = require('ff-core/confirmation')

// First, initialize its state object
// Pass in a stream that has a truthy value whenever you want to show the confirmation modal
const showConfirmation$ = flyd.stream()
const conf = confirmation.init(showConfirmation$)

// The conf.confirmed$ stream will have a values 'true' every time they click the yes button
// The conf.denied$ stream will have a 'true' value every time they click the no button
flyd.map(() => console.log('You have confirmed'), conf.confirmed$)
flyd.map(() => console.log('You have denied'), conf.denied$)
// The conf.response$ stream will have a boolean value: 'true' for clicking yes, 'false' for clicking no
flyd.map(b => console.log(b ? 'Clicked yes' : 'Clicked no'), conf.response$)

// Call its view function to generate snabbdom vnodes
// confirmation.view(stateObject, configuration)
confirmation.view(conf, {
  prompt: "Are you sure?" // text to display above the yes/no buttons (defaults to "Are you sure?")
, confirmText: "Yes" // text to display on the yes button (defaults to "Yes")
, denyText: "No" // text to display on the no button (defaults to "No")
})
```

_Example_

```js
const confirmation = require('ff-core/confirmation')
const notification = require('ff-core/notification')
const h = require('snabbdom/h')
const flyd = require('flyd')

function init() {
  const clickButton$ = flyd.stream()
  const conf = confirmation.init(clickButton$)

  const message$ = flyd.merge(
    flyd.map(()=> "Good choice!", conf.confirmed$)
  , flyd.map(()=> "Hey c'mon bozo, yr supposed to click yes!", conf.denied$)
  )
  const notif = notification.init({ message$ })

  return {
    clickButton$
  , confirmation: conf
  , notification: notif
  }
}


function view(state) {
  return h('div', [
    h('button', {on: {click: state.clickButton$}}, 'Do a thing?')
  , confirmation.view(state.confirmation, {
      prompt: "Are you really really really sure?"
    , confirmText: 'Yup'
    , denyText:  'No way'
    })
  ])
}

```
