# flimflam/ui components

Flimflam core UI components:

* [modal](/modal)
* [wizard](/wizard)
* [notification](/notification)
* [button](/button)
* [confirmation](/confirmation)
* [validated-form](/validated-form)
* [tabswap](/tabswap)
* [autocomplete](/autocomplete)

Require like:

```js
const modal = require('flimflam/ui/modal')
const wizard = require('flimflam/ui/wizard')
const validatedForm = require('flimflam/ui/validated-form')
const render = require('flimflam/render')
// etc
```

There is a `README.md` in each component's directory that you can view to read documentation and examples for each.

For more information about Flimflam, visit [https://flimflamjs.github.io](https://flimflamjs.github.io).

The components that live in this core package is for all the UI that we think nearly all applications will need (ie. a standard lib for UI components). Any other UI components can go in separate git repositories and NPM packages and can be installed separately.

## development

Components are in es2040: source code lives in `component-name/lib/index.js` and the built files are `component-name/index.js`.

* To build all components at once, run: `./build-all.sh` in this directory
* To build components individually, run: `babel component-name/lib/index.js > component-name/index.js`

Tests for each component live in their own directory under `component-name/test/index.js`. Tests use tape/tape-run/tap-spec

* To run all tests at once, run: `./run-test.sh`
* To run tests individually, use `run-test.sh component-name/` (for example: `run-test.sh button`)

