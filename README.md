# ff-core

A package for the flimflam core UI components:

* [render](https://github.com/jayrbolton/flimflam-render)
* UI components:
  * [modal](/modal)
  * [wizard](/wizard)
  * [notification](/notification)
  * [button](/button)
  * [confirmation](/confirmation)
  * [validated-form](/validated-form)
  * [tabswap](/tabswap)
  * [autocomplete](/autocomplete)


```js
const modal = require('ff-core/modal')
const wizard = require('ff-core/wizard')
const validatedForm = require('ff-core/validated-form')
const render = require('ff-core/render')
// etc
```

Open up each module directory in github, and you can find documentation for each one in the README.md in each directory.

To see a full directory of curated flimflam components, go to [https://flimflamjs.github.io](https://flimflamjs.github.io). This package is just for those components that we think nearly all applications will need (ie. a standard lib for ui components).

## development

Components are in es2015: source code lives in `component-name/index.es6` and the built files are `component-name/index.js`.

* To build all components at once, run: `npm run build`
* To build components individually, run: `babel component-name/index.es6 > component-name/index.js`

Tests for each component live in their own directory under `component-name/test/index.js`. Tests use tape/tape-run/tap-spec

* To run all tests at once, run: `npm run test`
* To run tests individually, use the `run-test.sh` script with the name of the component: `./run-test.sh button`

