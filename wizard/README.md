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
, followup: h('div', 'My followup content') // Content to show in the wizard when isCompleted$ has a true value
})
```


### wizard.view(state, steps, followup)

The `steps` parameter is an array of objects for each wizard step. Each object has a `name` and a `body`. The step name will be displayed in the wizard header.

The `followup` parameter is an optional snabbdom node that contains some content for when the user completes the wizard.

```js
  const view = state =>
    wizard.view(
      state.wizard
    , [{name: 'Step 1', body: h('div', 'Step 1 body')}] // Pass in array of step objects 
    , h('p', 'You have completed the wizard!')
    )
```


#### step/form validation

A good strategy is to have a separate form element on every step with its own validation. If validation succeeds, then the form is submitted. When the form is submitted, trigger a step advancement in the wizard using the `currentStep$` stream. If the validation fails, no submit event is called and no advancement happens.

