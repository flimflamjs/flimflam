
# :cyclone: flimflam: flyd + snabbdom :cyclone:

This module gives you a function to help you combine the use of [flyd](https://github.com/paldepind/flyd) with [snabbdom](https://github.com/snabbdom/snabbdom).

In this system, you can construct your UI with:
* **States**, which are objects containing flyd streams
* **Views**, which are functions that take **states** and return snabbdom vnodes

That's it!

_Example_

```js
const flyd = require('flyd')
const render = require('flimflam')

function init () {
  // Create some initially empty event handler streams
  const incr = flyd.stream()
  const decr = flyd.stream()
  // Calculate a running sum from the events
  const count = sum(incr, decr)
  return {incr, decr, count}
}

function sum (incr, decr) {
  return flyd.scanMerge([
    [incr, (n) => n + 1],
    [decr, (n) => n - 1]
  ], 0)
}

// Render the state into markup
function view (state) {
  return h('body', [
    h('p', ['Current count is ', state.count()]),
    h('button', {on: {click: state.incr}}, 'Increment'),
    h('button', {on: {click: state.decr}}, 'Decrement')
  ])
}

// Render everything to the page
const state = init()
const container = document.body
render(view, state, document.body)
```

## Scaling up

We've used this setup for very large applications. It can scale up well by following these guidelines:

* Create small modules for view functions without logic.
* Create modules for stream logic that take input streams and return output streams.
* Write your state logic separately from your views. The hierarchy of your state objects should not mirror the layout of your markup. In the counter example above, the functions `init` and `sum` can live in their own module and have their own tests independent of any views. They could potentially be represented by a dozen different views.
* You can use something like [commons.css](http://yutakahoulette.com/commons.css) or BassCSS with PostCSS for styling.

## Helpers

Many extra flyd modules can help you handle a lot of different async logic using streams:
* [Flyd modules listing](https://github.com/paldepind/flyd#modules)
* [flyd-ajax](https://github.com/jayrbolton/flyd-ajax)
* [flyd-stream-querystring](https://github.com/jayrbolton/flyd-stream-querystring)
* [flyd-windowresize](https://github.com/jayrbolton/flyd-windowresize)
* [flyd-url](https://github.com/jayrbolton/flyd-url)
* [flyd-crud](https://github.com/jayrbolton/flyd-crud)
* [flyd-undo](https://github.com/jayrbolton/flyd-undo)
* [flyd-zip](https://github.com/jayrbolton/flyd-zip)
* Make your own!
