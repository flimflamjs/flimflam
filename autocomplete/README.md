
## flimflam autocomplete

This is a UI component that provides autocomplete functionality. You can either autocomplete on an entire text field or on certain keywords as you type within the fieled.

__Note__ this one is still has some kinks.

_api_

#### autocomplete.init(defaultState)

`defaultState` is an object that can have these properties:

* values: an array of strings of values to perform autocompletion on
* values$: a stream of arrays of values. This allows you to have dynamic autocomplete values, eg provided via ajax
* limit: integer limit of how many values to show in the dropdown
* showInitial: boolean whether to show the dropdown list when the user first focuses on the input without typing anything yet

the state object that gets return from the `init` function includes these streams:

* keyup$: each key a user types in the field
* select$: a stream of successfully selected dropdown values

#### autocomplete.view(vnode, state)

Pass in a text field vnode (an `<input>` with type 'text' or a `<textarea>`) and the state object returned by `autocomplete.init`

### examples

see /demo/autocomplete/index.js to see a working example.

# styling

See `./index.css` for example CSS selectors you can use on this component. `./index.css` is a basic utility theme and can be included with `postcss-import` by doing `@import 'ff-core/autocomplete/index.css';`.
