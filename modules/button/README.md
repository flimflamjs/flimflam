
# flimflam button

A simple, dynamic 'button' element for the flimflam pattern. Its features are:

- Toggle on/off loading state
- Show/hide an error message
- Ask for confirmation from the user in-place
- Allow for an in-place success message notification with delayed fade out

[demo gif goes here]()

[demo link goes here]()

```
npm install --save ff-core
```

```js
import button from 'ff-core/modules/button'
```

The button is just a snabbdom view function that takes some state and config

## button.init(streams)

Initialize the button component with an object of:
```js
{
  loading: stream // stream of true/false values to turn on/off loading state
, error: stream   // stream of error message strings to be displayed (empty str or null to blank it out)
, success: stream // stream of success message strings to be displayed
}
```

Success messages will display for 3 seconds and then fade out.

## button.view(component, config)

Pass in your button component object and a config object of:

```js
// config
{
  buttonText: string // text to go on the button (eg submit, save, etc)
, loadingText: string // text to display when in loading state (can also be more snabbdom markup)
}
```

## css classes

The dom structure looks like:

```html
  <div class='ff-submit'>
    <p class='ff-submit-errorMsg'></p>
    <button class='ff-submit-button' type='submit'>Submit</button>
  </div>
```

With an error you get:

```html
  <div class='ff-submit ff-submit--hasError'>
    <p class='ff-submit-errorMsg'>Error message here</p>
    <button class='ff-submit-button' type='submit'>Submit</button>
  </div>
```

Style using `ff-submit, ff-submit-errorMsg, and ff-submit-button` classes.


## example code

```js
import R from 'ramda'
import flyd from 'flyd'
import h from 'snabbdom/h'
import submitButton from 'ff-core/modules/submit-button'
import ajax from 'ff-core/modules/ajax'

function init() {

  let streams = {submit: flyd.stream()}
  let resp = flyd.flatMap(ev => ajax.post('/path').send(serialize(ev.currentTarget)), streams.submit)
  let respErr = flyd.filter(resp => !resp.ok)
  let respOk = flyd.filter( resp => resp.ok)

  let loading = flyd.mergeAll([
    flyd.map(x => true, streams.submit)
  , flyd.map(x => false, streams.resp)
  ])

  let error = flyd.mergeAll([
    flyd.map(resp => `Error: ${resp.body.error}`, streams.respErr)
  ])

  let success = flyd.mergeAll([
    flyd.map(resp => 'Successfully saved!', respOk)
  ])

  let children = {
    btn: submitButton.init({loading, error, success})
  }

  return {children}
}

function view(component) {

  return h('form', {on: {submit: component.streams.submit}}, [
    h('input', {props: {type: 'text', name: 'email', placeholder: 'Your Email Address'}})
  , submitButton.view(component.children.btn)
  ])
}
```
