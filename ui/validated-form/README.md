# validated-form

A UI component for a form with real-time user validation.

_Example_:

```js
const validatedForm = require('flimflam/ui/validated-form')

const constraints = {
  amount: {required: true, isNumber: true, min: 1}
, email: {required: true, email: true}
}

const state = validatedForm.init({constraints})

const view = state => {
 const form = validatedForm.form(state)
 const input = validatedForm.field(state)
 return form(h('form', [
   input(h('input', {props: {name: 'amount', type: 'number'}}))
 , input(h('input', {props: {name: 'email', type: 'text'}}))
 ]))
}
```

# State initialization

## validatedForm.init(config)

config can contain the following properties:

- `validators` - Object - functions that take form values and return Boolean, denoting whether the input is valid
- `messages` - Object - error messages to display when values are invalid
- `constraints` - Object - a mapping of field names to validator names and values that define how you want this form to be validated
- `formData$` - Object stream - a stream of data you can pass into the form state. Every time a new object appears on this stream, the corresponding fields in the form will update their values (properties in the formData$ object correspond to field names in the form). This allows you to control the values of the form more precisely

Default validator functions:

| name | type | description |
| --- | --- | --- |
| email | Boolean | is it a valid email string? | 
| required | Boolean | cannot be null, undefined, or empty str |
| currency | Boolean | must be formatted as a currency amount |
| format | Regex | must match the given regex |
| isNumber | Boolean | must be a number |
| max | Integer | cannot be more than x |
| min | Integer | cannot be less than x |
| equalTo | any |  must be equal to x |
| maxLength | Integer | array must have max length x |
| minLength | Integer | array must have min length x |
| lengthEquals | Integer | array/string must have length x |
| includedIn | Array | value must be within given array |
| matchesField | String | value must the value of another field|

Default error messages:

| name | message |
| --- | --- |
| email | 'Please enter a valid email address' |
| required | 'This field is required' |
| currency | 'Please enter a valid amount' |
| format | "This doesn't look like the right format" |
| isNumber | 'This should be a number' |
| max | `This should be less than ${n}` |
| min | `This should be at least ${n}` |
| equalTo | `This should be equal to ${n}` |
| maxLength | `This should be no longer than ${n}` |
| minLength | `This should be longer than ${n}` |
| lengthEquals | `This should have a length of ${n}` |
| includedIn | `This should be one of: ${arr.join(', ')}` |
| matchesField | `This field should match the ${n} field` |
| fallback | 'This looks invalid' |

### Custom contraints, validator functions, and messages

When you initialize the validated form's state, you can pass in any custom validator functions, and they will get added to (or override) the default validator functions:

```js
// User signup form

// These constraints define what requirements you place on the user filling out the form
// These property name correspond to the field 'name' attributes in the form
const contraints = {
  name: {required: true, isNot: "Bob"}
, age: {required: true, min: 12}
, email: {required: true, email: true}
, password: {required: true, minLength: 7}
, passwordConfirmation: {required: true, matchesField: 'password'}
}

// The validator 'isNot' is not in the default validators so can be defined by us:
const validators = {
  // First param is the user-inputted field value, and the second param is supplied in the constraints (ie 'Bob')
  // A third optional parameter contains the entire set of form data
  isNot: (val, x, data) => val !== x
}

// Let's make a custom error message for the isNot validator
const messages = {
  name: {isNot: 'No Bobs allowed'}
}

// Error messages match based on most-specific to least-specific
// For example, you can make a more generic 'isNot' error message for any field like so:
// const messages = {isNot: x => `Must not be ${x}`}
// Notice that we did not nest `isNot` in the `name` key above, so it will apply to any field
// Or, you can capture error messages for a field non-specific to any validator names:
// const messages = {name: 'Enter a valid name'}

validatedForm.init({constraints, validators, messages})
```

The order of matching error messages is
 * First, try to find a message that matches the field name + the validator name
 * Then, try to find a message for just the validator name
 * Then, try to find a message for just the field name
 * Then, fall back to the global 'fallback' message

# View Functions
 
## validatedForm.form(state, vnode)

This creates a snabbdom form node with special functionality for dynamic validation:

- `state` is the state object created by validatedForm.init()
- `vnode` is a normal snabbdom form node

## validatedForm.field(state, vnode)

This creates a field (input/select/textarea) that will dynamically validate:

- `state` is the state object created by validatedForm.init()
- `vnode` is a normal snabbdom vnode such as 'input', 'textarea', or 'select'

# Styling

Please see index.css for all the `data-ff-* ` names you can access on within your CSS
