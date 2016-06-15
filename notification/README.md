Simple notification UI component

- Shows notification messages from stream
- Hides message after a given duration.

```js

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

  // Initialize your notification's state:
  state.notification = notification.init({message$, hideDelay: 4000})
  // will display each string when they appear on the message$ stream
  // will hide the message after 4 seconds
}

// In your parent component view:
function view(state) {
  return h('div', [
    // add other markup
    notification.view(state.notification)
  ])
}
```
