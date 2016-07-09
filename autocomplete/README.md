
## autocomplete component

This is a UI component that provides autocomplete functionality. You can either autocomplete on an entire text field or on certain keywords as you type within the fieled.

_api_

#### autocomplete.init(defaultState)

`defaultState` is an object that can have these properties:

* values: an array of strings of values to perform autocompletion on
* limit: integer limit of how many values to show in the dropdown
* showInitial: boolean whether to show the dropdown list when the user first focuses on the input without typing anything yet

#### autocomplete.view

### examples

```js
import autocomplete from 'ff-core/autocomplete'

// initialize autocomplete state data
let state = {autocomplete: autocomplete.init()}
// optionally pass in match$, partialMatch$, and keyup$ into state

// autocomplete.view(vnode, state)

autocomplete.view(vnode, state.autocomplete)
```

_example_

```js
import autocomplete from 'ff-core/autocomplete'

let input = h('input', {props: {name: 'assignee', type: 'text'}})

autocomplete(input, {
  values: ['@finn', '@jake', '@pb']
, 
})
```
