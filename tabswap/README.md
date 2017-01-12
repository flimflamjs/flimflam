# flimflam tabswap

Swap content with some simple navigation

The top-level div of this component has the data attribute `data-ff-tabswap` for styling.

```js
const carousel = require('ff-core/carousel')

function view(state) {
  const content_a = h('p', 'content a')
  const content_b = h('p', 'content b')
  return h('div', [
    h('h1', 'my carousel')
  , carousel({
      labels: ['a', 'b']
    , content: [content_a, content_b]
    , active$: flyd.stream(0)
    })
  ])
}
```

For this example, the output html will look like:

```html
<div data-ff-tabswap="active:1">
  <div>
    <a data-ff-tabswap-label="inactive">a</a>
    <a data-ff-tabswap-label="active">b</a>
  </div>
  <div>
    <div data-ff-tabswap-content="inactive">content a</div>
    <div data-ff-tabswap-content="active">content b</div>
  </div>
</div>
```

In the user clicks on label 'b', then the first label will be set to 'inactive', the second to 'inactive', and the first content div will be set to 'inactive', and the second one to 'active'

You can use the `data-ff-tabswap-* ` data attributes and their values to style everything up.

## carousel(options)

Options include:

* `options.labels`: an array of strings or snabbdom content to be used for the navigation labels (optional)
* `options.content`: an array of strings or snabbdom content to be used in the actual carousel content (required)
* `options.active$`: a flyd stream of an integer index of the currently active carousel item

