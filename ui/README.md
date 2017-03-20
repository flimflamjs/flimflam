# flimflam/ui components

Flimflam core UI components:

* [modal](/ui/modal)
* [wizard](/ui/wizard)
* [notification](/ui/notification)
* [button](/ui/button)
* [confirmation](/ui/confirmation)
* [validated-form](/ui/validated-form)
* [tabswap](/ui/tabswap)

You can require with:

```js
const modal = require('flimflam/ui/modal')
const wizard = require('flimflam/ui/wizard')
const validatedForm = require('flimflam/ui/validated-form')
const render = require('flimflam/render')
// etc
```

There is a `README.md` in each component's directory that you can view to read documentation and examples for each (or by following the links above)

For more information about flimflam, visit [https://flimflamjs.github.io](https://flimflamjs.github.io).

The components that live in this core package constitute all the UI that we think nearly all applications will need (ie. a standard lib for UI components). Any other UI components can go in separate git repositories and NPM packages and can be installed separately.

## development

Components are in plain JS. Source code lives in `component-name/index.js`.

Tests for each component live in their own directory under `component-name/test/index.js`. Tests use tape/tape-run/tap-spec

See `npm run` to see different ways you can run tests for these components. `npm run test` will simply run all tests for this whole package.

