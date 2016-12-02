
# validated-form

example:
```js
import validatedForm from 'ff-core/validated-form'

const constraints = {
  amount: {required: true, isNumber: true, min: 1}
, email: {required: true, email: true}
}

const init = state => {
  return state.updateForm = validatedForm.init({constraints})
}

const view => {
 const form = validatedForm.form(state.updateForm)
 const field = validatedForm.field(state.updateForm)
 return form(h('form', [
   field(h('input', {props: {name: 'amount', type: 'number'}})
 , field(h('input', {props: {name: 'email', type: 'text'}})
 ])
}

```

default validators (for constraints): 

| key | val |
| --- | --- |
| email | boolean |
| required | boolean |
| currency | boolean |
| format | regex |
| isNumber | boolean |
| max | integer |
| min | integer |
| equalTo | string | 
| maxLength | integer |
| minLength | integer |
| lengthEquals | integer |
| includedIn | array |
