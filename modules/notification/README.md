
Simple notification UI component

- Shows notification messages from stream
- Hides message after a duration

Default style in `./style.css`

### notification.view(context)

Pass in the notification context object, that's it.

Will add/remove inner text and change classname.

### notification.init(messagStream, showDuration)

Pass in a stream of notification messages.

`showDuration` is a time in milliseconds to show notification messages.

```js

let msg$ = flyd.mergeAll([
  flyd.map(() => 'Successfully signed up!', signup$)
, flyd.map(() => 'Passwords don\'t match', mismatchPass$)
, flyd.map(() => 'That username is taken', takenUsername$)
])

notification.init(msg$, 5000)
// will display each string when they appear on the msg$ stream
// will hide the message after 5 seconds

```
