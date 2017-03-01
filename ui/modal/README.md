# modal

### modal(state)

A modal overlay component

```js

import modal from 'ff-core/modal'

modal({
  show$: true            // Stream of Boolean of whether to this modal is 'shown' or 'hidden'
, notCloseable: false    // whether the modal can be closed by a user click (otherwise must be closed programmatically). Defaults to false.
, title: 'My Modal'      // some text for the modal header (optional)
, body: content          // either a single snabbdom element or an array for the body content of the modal (required)
, footer: footerContent  // snabbdom element (or array of them) for separate footer content in the modal
})
```

#### showing and hiding

Create streams of booleans to show/hide each modal in your parent state:

```js
function init() {
  return {
    showModal1$: flyd.stream()
  , showModal2$: flyd.stream()
  }
  return state
}


function view(state) {
  return h('div.parent', [
    h('p', 'parent component')
  , h('button', {on: {click: [state.showModal1$, true]}}, 'show modal 1')
  , h('button', {on: {click: [state.showModal2$, true]}}, 'show modal 2')

  , modal({show$: state.showModal1$}) // modal 1
  , modal({show$: state.showModal2$}) // modal 2
  ])
}
```

## styling

Please see the index.css to see the available CSS selectors for modals. This defaults stylesheet can be imported from your node_modules using postcss-import with `@import 'flimflam/ui/modal/index.css';`.

