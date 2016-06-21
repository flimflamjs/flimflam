# modal

### modal(state)

A modal overlay component

```js

import modal from 'ff-core/modal'

modal({
  thisID: 'myModal'      // unique id of this modal (required)
, id$: flyd.stream()     // stream of current modal ID (null to close) (required)
, notCloseable: false    // whether the modal can be closed by a user click (otherwise must be closed programmatically). Defaults to false.
, title: 'My Modal'      // some text for the modal header (optional)
, body: content          // either a single snabbdom element or an array for the body content of the modal (required)
, footer: footerContent  // snabbdom element (or array of them) for separate footer content in the modal
})

```

## styling

Default functional styling is located in /index.css

If you want to have multiple differently-styled modal versions (eg a full-width one, a sidebar one, a small one, etc), then you can wrap your whole `modal.view` call in another div:

```js
h('div.modal--sidebar', [ modal.view(state) ])
```

In your styles target the modal classes nested under your parent div class:

```css
.modal--sidebar > .modal {
  right: 0;
  top: 0;
  width: 400px;
  height: 100%;
}
```

