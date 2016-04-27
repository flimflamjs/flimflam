# modal

### modal.view(modal_context, config_options)

```js

import modal from 'ff-core/modules/modal'

modal.view(modal_context, {
  id: 'myModal'          // unique id of modal (required)
, notCloseable: false    // whether the modal can be closed by a user click (otherwise must be closed programmatically). Defaults to false.
, title: 'My Modal'      // some text for the modal header (optional)
, body: content          // either a single snabbdom element or an array for the body content of the modal (required)
, footer: footerContent  // snabbdom element (or array of them) for separate footer content in the modal
})

```

If you want to have multiple differently-styled modal versions (eg a full-width one, a sidebar one, a small one, etc), then you can wrap your whole `modal.view` call in another div:

```js
h('div.modal--sidebar', [
  modal.view(modal_context, config)
])
```

In your styles target the modal classes nested under your parent div class:

```css
.modal--sidebar > .modal {
  right: 0;
  top: 0;
  width: 400px;
}
```

### modal.init(idStream)

When you init the modal context object, pass in a stream of modal ids.

Simply push a blank string or null value to the `idStream` to close any open modal.

