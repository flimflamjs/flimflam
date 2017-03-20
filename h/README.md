
# flimflam/h

Flimflam provides an `h` function for creating virtual DOM nodes. This function comes directly from **[snabbdom](https://github.com/snabbdom/snabbdom)** -- you can refer to the snabbdom documentation for details on how to use `h` to create your UI views.

You can require it like this:

```js
const h = require('flimflam/h')

const view = function(state) {
  return h('div', [
    h('p', 'This is my markup!')
  ])
}
```
