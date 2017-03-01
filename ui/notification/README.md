Simple notification UI component

- Shows notification messages from a stream
- Hides message after a given duration.
- Exports a `view` and an `init` function.

This is an example of using the notification component in a parent component (a user signup form):

```js
import flyd from 'flyd'
import h from 'snabbdom/h'
import notification from 'ff-core/notification'

// In your parent component:
function init() {
  let state = {}
  // define signup$, mismatchPass$, takenUsername$, etc...

  // Create a bunch of notification message streams based on other streams
  const message$ = flyd.mergeAll([
    flyd.map(() => 'Successfully signed up!', signup$)
  , flyd.map(() => 'Passwords don\'t match', mismatchPass$)
  , flyd.map(() => 'That username is taken', takenUsername$)
  ])

  // Initialize your notification's state. Pass in a message$ stream (required), and an optional hideDelay parameter to set how long the notification is displayed.
  state.notification = notification.init({message$, hideDelay: 4000})
  // will display each string when they appear on the message$ stream
  // will hide the message after 4 seconds

  return state
}


// In your parent component view:
function view(state) {
  return h('div', [
    // add other markup
    notification.view(state.notification)
  ])
}
```
