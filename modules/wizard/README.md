
A generalized wizard UI component

- Split forms into multiple steps for better UI
- Disallow skipping to future steps until they are marked as accessible
- Allow skipping back to previous steps

### wizard.view(context, config)

```js
wizard.view(wizard_context, {
  steps: step_array       // An array of objects of steps. Each step object has a name property and a content property.
, followup: content       // a snabbdom element or array of elements to show when the wizard is completed (optional).
})
```

The steps config property takes an array of step objects. Here is an example step array:

```js
[
  { name: 'Your Info' , body: infoForm }
, { name: 'Login Info' , body: signupForm }
]
```

### wizard.init(streams)

```js
wizard.init({
  advance: advanceStream
, jump: jumpStream
, complete: completionStream
})
```

The only param is a `streams` object that has properties `jump`, `advance`, and `complete`.

The `advance` stream moves the user to the next step and marks that one as "accessible" (it can be jumped to). Simply push `true` to stream to advance the wizard.

The `jump` stream allows the user to jump to any step that has been marked as "accessible". **If the user jumps backwards, all steps after the step they jump to will be marked as inaccessible**. Simply pass an index value (integer corresponding to your `.steps` array from the view function) to jump to.


#### form validation

A good strategy is to have a separate form element on every step with its own validation. If validation succeeds, then the form is submitted. When the form is submitted, trigger a step advancment in the wizard using the `advance` stream. If the validation fails, no submit event is called.

#### followup

When `true` is pushed to the `complete` stream, the wizard will display the followup content and hide the step name listing. This is good for a final thankyou message or similar. Often wizards are also within modals; you could alternatively simply hide the modal, replace the whole wizard, or other such strategies.

