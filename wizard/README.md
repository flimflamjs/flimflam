A generalized wizard UI component, usually used for filling out forms in a sequential manner.

- Split forms into multiple steps for better UI
- Disallow skipping to future steps, but allow jumping backwards
- Show a followup section when the wizard is completed

## wizard.init(state)

Initialize the wizard state and pass in some defaults:

```js
let myWizardState = wizard.init({
  currentStep$: flyd.stream(0)        // Stream of current steps -- starts at 0
, isCompleted$: flyd.stream(false)    // stream of Booleans, marking whether the wizard is completed
})
```

### wizard.labels(state, content)

The `content` parameter is an array of vnodes or strings for each set of wizard labels. 

### wizard.content(state, content, followup)

The `content` parameter is an array of vnodes or strings for each wizard body. 

The `followup` parameter is an optional snabbdom node that contains some content for when the user completes the wizard.

### example

```js
  const view = state =>
    h('div', [
      wizard.labels(
        state.wizard // state
      , [h('label', 'one'), h('label', 'two')] // content
      )
    , wizard.body(
        state.wizard // state
      , [h('div', 'content one'), h('div', 'content two')] // content
      , h('p', 'You have completed the wizard!') // optional followup
      )
    ])
```

#### step/form validation

A good strategy is to have a separate form element on every step with its own validation. If validation succeeds, then the form is submitted. When the form is submitted, trigger a step advancement in the wizard using the `currentStep$` stream. If the validation fails, no submit event is called and no advancement happens.

