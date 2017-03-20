
# flimflam/render

The flimflam `render` function takes a view function, a state object, a plain DOM node and renders your UI component into the web browser's page.

You only need to call `render` once per page and per top-level component. You may render multiple components to the same page -- just be sure to use different containers.

You can use it like this:

```js
const render = require('flimflam/render')
const h = require('flimflam/h')

function initState() {
  return {x: 'hallo world'}
}

function view(state) {
  return h('div', [
    h('p', state.x)
  ])
}

const container = document.querySelector('.my-container')
render(view, initState(), container)
```

