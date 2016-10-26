import R       from 'ramda'
import h       from 'snabbdom/h'
import modal   from '../modal'
import section from './section'

module.exports = state =>
  section('modal'
  , h('div', [
        h('button', {on: {click: [state.modalID$, 'demoID']}}, 'Open Modal!')
      , modal({
        thisID: 'demoID'
      , id$: state.modalID$ 
      , title: 'Demo modal title' 
      , body: h('p', 'demo modal body')    
      , footer: h('p', 'demo modal footer')
      })
    ])
  )
  
