require("../render/test")
require("../ui/test")
var test = require("tape")

test('/h imports the snabbdom h function', t => {
  t.plan(1)
  t.equal(require('../h'), require('snabbdom/h').default)
})

test('/flyd imports the flyd function', t => {
  t.plan(1)
  t.equal(require('../flyd'), require('flyd'))
})

test('/flyd imports all its submodules', t => {
  const subs = ['filter', 'lift', 'flatMap', 'switchLatest', 'keepWhen', 'obj', 'sampleOn', 'scanMerge', 'mergeAll', 'takeUntil', 'forwardTo', 'dropRepeats', 'every', 'afterSilence', 'inLast']
  t.plan(subs.length)
  const flyd = require('../flyd')
  subs.map(s => {
    t.ok(flyd[s])
  })
})

