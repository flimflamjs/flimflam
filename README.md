
# :cyclone: FLIMFLAM! :cyclone:

Flimflam is a system and a pattern for creating UI components on the web.

You can **visit the website** here: [http://flimflamjs.github.io/](http://flimflamjs.github.io/).

At its core, flimflam makes use of **[snabbdom](/h)** and **[flyd](/flyd)** for virtual DOM and asynchronous streams.

This package comes with a set of **[core UI components](/ui)** that we find necessary in most any application. View them in the **[flimflam/ui](/ui)** directory.

You can view a **demo of UI components** at this page: [http://flimflamjs.github.io/flimflam](http://flimflamjs.github.io/flimflam)

Render your UI components to the page using **[flimflam/render](/render)**

_Example_

```js
const h = require('flimflam/h')
const flyd = require('flimflam/flyd')
const render = require('flimflam/render')
const modal = require('flimflam/ui/modal')

// Initialize the state object
const init = function() {
  return { showModal$: flyd.stream(false) }
}

// Render the state into markup
const view = function(state) {
  return h('body', [
    h('button', {on: {click: state.showModal$}}, 'Say Hello')
  , modal({show$: state.showModal$, body: h('p', 'Hello World!')})
  ])
}

render(view, init(), document.body)
```
