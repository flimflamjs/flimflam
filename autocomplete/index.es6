const h = require('snabbdom/h')
const R = require('ramda')

const flyd = require('flyd')
flyd.filter = require('flyd/module/filter')
flyd.scanMerge = require('flyd/module/scanmerge')
flyd.mergeAll = require('flyd/module/mergeall')
flyd.sampleOn = require('flyd/module/sampleon')
flyd.flatMap = require('flyd/module/flatmap')
flyd.switchLatest = require('flyd/module/switchlatest')
flyd.lift = require('flyd/module/lift')

// Show dropdown on first focus 
// Hide the dropdown on blur
// Hide the dropdown when a value is selected and still focused

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
  , hoverVal$: flyd.stream()
  }, state)
  state.values$ = state.values$ || flyd.stream(state.values)

  state.val$ = flyd.mergeAll([
    flyd.map(ev => ev.currentTarget.value, state.keyup$)
  , state.select$
  ])
  // Stream of events when the user starts on the input and it's empty (ie focus on empty input, or keyup$ to empty value)
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
  , [downWithLength$, (idx, matches) => idx >= matches.length-1 ? matches.length-1 : idx + 1] // increment, but not above the length-1
  , [state.hoverVal$, (oldIdx, newIdx) => newIdx]
  ], 0)

  return state
}

const filterValues = (matches, pair) => {
  let [newVal, values] = pair
  return newVal && newVal.length ? R.filter(v => v === '' || v.indexOf(newVal) === 0, values) : matches
}

// Is the event an arrow up/down keypress?
const upArrow   = ev => ev.keyCode === 38
const downArrow = ev => ev.keyCode === 40
const enterKey  = ev => ev.keyCode === 13
const tabKey    = ev => ev.keyCode === 9

function view(input, state) {
  let matches = state.partialMatches$()
  input.data.on = input.data.on || {}
  input.data.on.keydown = ev => {
    if(upArrow(ev)) {
      state.upArrow$(ev)
      ev.preventDefault()
      return false
    } else if(downArrow(ev)) {
      state.downArrow$(ev)
      ev.preventDefault()
      return false
    } else if((tabKey(ev) || enterKey(ev)) && matches.length) {
      state.select$(state.partialMatches$()[state.dropdownIdx$()])
      ev.preventDefault()
      return false
    } 
  }
  input.data.on.keyup = state.keyup$
  input.data.on.focus = state.focus$
  input.data.on.blur = state.blur$
  input.data.props = input.data.props || {}
  input.data.props.value = state.val$() || ''

  let dropdown = h('div', {
    attrs: {'data-ff-autocomplete-dropdown': matches.length ? 'open' : 'closed'}
  }, R.addIndex(R.map)(dropdownValue(state), matches))

  return h('div', {attrs: {'data-ff-autocomplete': ''}}, [input , dropdown])
}

const dropdownValue = state => (val, idx) => {
  return h('div', {
    on: {
      mousedown: ev => ev.preventDefault()
    , click: ev => state.select$(state.partialMatches$[idx])
    , mouseover: [state.hoverVal$, idx]
    }
  , attrs: {'data-ff-autocomplete-value': state.dropdownIdx$() === idx ? 'selecting' : ''}
  }, val)
}

module.exports = {init, view}
