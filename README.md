# ff-core

A package for the flimflam core UI components:

* [render](https://github.com/jayrbolton/flimflam-render)
* UI components:
  * [modal](/modal)
  * [wizard](/wizard)
  * [notification](/notification)
  * [button](/button)
  * [validated-form](/validated-form)


```js
import modal from 'ff-core/modal'
import wizard from 'ff-core/wizard'
import validatedForm from 'ff-core/validated-form'
import render from 'ff-core/render'
// etc
```

Open up each module directory in github, and you can find documentation for each one in the README.md in each directory.

To see a full directory of curated flimflam components, go to
(https://flimflamjs.github.io)[https://flimflamjs.github.io]. This package is
just for those components that we think nearly all applications will need (ie,
a standard lib for ui components).

## developing

Run babel on each .es6 file in each module to produce the corresponding .js file

Tests for each module live inside /test -- use `zuul --local --ui mocha-qunit -- test/index.js` to run the tests (or `npm run test`).

