# flimflam tabswap

Component for swapping out sections of content with some simple navigation.

## tabswap.content({sections, active$})`

* `sections`: an Array of Snabbdom nodes
* `active$`: a Flyd stream that contains an integer index representing which section should be active, making all other sections inactive

## tabswap.labels({names, active$})

* `names`: an Array of Strings or Snabbdom nodes that represent labels/titles for each section
* `active$`: a Flyd stream that contains an integer index representing which label should be active, making all other labels inactive
* `setWidth`: optional boolean value for setting widths of labels based on number
  of labels (5 labels will result in each label's width being 20%) 

You will probably want to pass the same `active$` stream to both `tabswap.labels` and `tabswap.content`.

## Example

```js
const tabswap = require('ff-core/tabswap')

function view(state) {
  const content_a = h('p', 'content a')
  const content_b = h('p', 'content b')
  return h('div', [
    h('h1', 'my tabswap')
  , tabswap.labels({
      names: ['a', 'b']
    , active$: activeTab$
    , setWidth: true
    })
  , tabswap.content({
      sections: [content_a, content_b]
    , active$: activeTab$
    })
  ])
}
```

In the user clicks on label 'b', then the first label will be set to 'inactive', the second to 'inactive', and the first content div will be set to 'inactive', and the second one to 'active'

You can use the `data-ff-tabswap-* ` data attributes and their values to style everything up.

# Styling

Please see the `index.css` file in this component to see all the CSS selectors and data-attr states that can be styled for this component, along with some basic utility styles.

