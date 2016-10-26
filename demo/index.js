import snabbdom from 'snabbdom'
import flyd     from 'flyd'
import R        from 'ramda'
import h        from 'snabbdom/h'

import render       from '../render'
import modalSection from './modal-section'

const init = _ => {
  return {
    clickOpenModal$: flyd.stream()
  , modalID$: flyd.stream()
  }
}

const patch = snabbdom.init([
  require('snabbdom/modules/class')
, require('snabbdom/modules/props')
, require('snabbdom/modules/style')
, require('snabbdom/modules/eventlisteners')
])

const componentNames = [
  'button'
, 'modal'
, 'notification'
, 'confirmation'
, 'wizard'
, 'tooltip'
, 'auto-complete'
]

const navLink = x => h('li', [h('a', {props: {href: '#' + x}}, x)])

const view = state => 
  h('div.container.p2', [
    h('h1.mt1', 'ff-core demo')
  , h('p', 'Includes:')
  , h('ul', R.map(navLink, componentNames))
  , modalSection(state)
  ])

const container = document.getElementById('container')

render({container, view, state: init(), patch})

