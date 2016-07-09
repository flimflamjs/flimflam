import flyd from 'flyd'
import h from 'snabbdom/h'
import R from 'ramda'
flyd.filter = require('flyd/module/filter')
flyd.scanMerge = require('flyd/module/scanmerge')
flyd.mergeAll = require('flyd/module/mergeall')
flyd.sampleOn = require('flyd/module/sampleon')
flyd.flatMap = require('flyd/module/flatmap')
flyd.switchLatest = require('flyd/module/switchlatest')
flyd.lift = require('flyd/module/lift')

function init(state) {
  state = state || {}
  state = R.merge({
    keyup$: flyd.stream()
  , select$: flyd.stream()
  , focus$: flyd.stream()
  , blur$: flyd.stream()
  , upArrow$: flyd.stream()
  , downArrow$: flyd.stream()
  , values: []
  }, state)

  state.values$ = state.values$ || flyd.stream(state.values)

  state.val$ = flyd.mergeAll([
    flyd.map(ev => ev.currentTarget.value, state.keyup$)
  , state.select$
  ])
  // Stream of events when the user starts on the input and it's empty (ie focus on empty input, or keyup to empty value)
  const empty$ = flyd.map(
    ()=> state.values$()
  , flyd.filter(
      ev => !ev.currentTarget.value
    , flyd.merge(state.focus$, state.keyup$)
    )
  )

  const withValues$ = flyd.lift(R.pair, state.val$, state.values$)
  state.partialMatches$ = flyd.scanMerge([
    [withValues$, filterValues]
  , [empty$, (matches, vals) => state.showInitial ? vals : []]
  , [state.select$, R.always([])]
  ], [])
  if(state.limit) state.partialMatches$ = flyd.map(R.take(state.limit), state.partialMatches$)
  
  // Index of currently selected dropdown item
  const downWithLength$ = flyd.sampleOn(state.downArrow$, state.partialMatches$)
  state.dropdownIdx$ = flyd.scanMerge([
    [state.upArrow$, idx => idx === 0 ? 0 : idx - 1] // decrement, but not below 0
  , [downWithLength$, (idx, matches) => idx >= matches.length-1 ? idx : idx + 1]
  ], 0)

  return state
}

const filterValues = (matches, pair) => {
  let [newVal, values] = pair
  return newVal.length ? R.filter(v => v === '' || v.indexOf(newVal) === 0, values) : matches
}

// Is the event an arrow up/down keypress?
const upArrow   = ev => ev.keyCode === 38 
const downArrow = ev => ev.keyCode === 40
const enterKey  = ev => ev.keyCode === 13

function view(vnode, state) {
  let matches = state.partialMatches$()
  vnode.data.on = vnode.data.on || {}
  vnode.data.on.keydown = ev => {
    if(upArrow(ev)) {
      state.upArrow$(ev)
      ev.preventDefault()
    } else if(downArrow(ev)) {
      state.downArrow$(ev)
      ev.preventDefault()
    }
  }
  vnode.data.on.keyup = ev => {
    if(enterKey(ev) && matches.length)
      state.select$(state.partialMatches$()[state.dropdownIdx$()])
    else 
      state.keyup$(ev)
  }
  vnode.data.on.focus = state.focus$
  vnode.data.on.blur = state.blur$
  vnode.data.props = vnode.data.props || {}
  vnode.data.props.value = state.val$()

  let dropdown = h('div.ff-autocomplete-dropdown', 
    R.addIndex(R.map)(dropdownValue(state), matches)
  )

  return h('div.ff-autocomplete', [ vnode , dropdown ])
}

const dropdownValue = state => (val, idx) => {
  return h('div.ff-autocomplete-dropdown-value', {
    on: {
      click: [state.select$, val]
    , mouseover: [state.dropdownIdx$, idx]
    }
  , class: {
      'ff-autocomplete-dropdown-value--selecting': state.dropdownIdx$() == idx
    }
  }, val)
}

module.exports = {init, view}
