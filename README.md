# ff-core

A package for the flimflam core components, which includes:

* render (see flimflam-render)
* UI components:
  * [modal](/modules/modals)
  * [wizard](/modules/wizard)
  * [notification](/modules/wizard)
  * [button](/modules/button)
  * [tooltip](/modules/tooltip)
  * [form-validation](/modules/form-validation)
  * [confirmation](/modules/confirmation)


To see a full directory of curated flimflam components, go to
(https://flimflamjs.github.io)[https://flimflamjs.github.io]. This package is
just for those components that we think nearly all applications will need (ie,
a standard lib for ui components).

Every sub-module is separated out under `/modules`. 

```js
import ramda from 'ff-core/modules/ramda'
import snabbdom from 'ff-core/modules/snabbdom'
import flyd from 'ff-core/modules/flyd'

import modal from 'ff-core/modules/modal'
import wizard from 'ff-core/modules/wizard'
// etc
```

Open up the modules in github, and you can find documentation for each one in the README.md in each directory.


