
# flimflam/flyd

The [flimflam architecture](http://flimflamjs.github.io/) heavily relies on the **functional reactive programming** using the **[flyd library](http://github.com/paldepind/flyd)**

This flimflam meta-package includes the flyd library, and also preloads all of its modules into the flyd object. That way, you can do:

```js
const flyd = require('flimflam/flyd')
const response$ = flyd.flatMap(postRequest, submitForm$)
```

And you don't have to separately require `flyd/module/flatmap`; all flyd modules listed in the [flyd readme](http://github.com/paldepind/flyd) are included when you import flyd from flimflam.
