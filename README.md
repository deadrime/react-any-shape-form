# React styleless form

This package was inspired by `antd` form component. But this one without any antd dependencies, smaller, type-friendly and way more flexible. Feel free to just replace antd form with this one.

Package size in 9.30 kB │ gzip: 3.38 kB │ map: 32.23 kB

## Get started

Install this package


```bash
npm i react-styleless-form
```


Use it like this:

```tsx
import { Form, FormItem } from 'react-styleless-form';

const HelloWorldForm = () => {
  return (
    <Form onFinish={(fields) => {
      alert(JSON.stringify(fields, undefined, 2))
    }} id="myForm">
      <FormItem
        name="name"
        label="Name"
        rules={[
          {
            required: true,
            message: 'Name is required'
          },
        ]}
      >
        <TextInput />
      </FormItem>
      <FormItem
        name="city"
        label="City"
      >
        <TextInput />
      </FormItem>
      <FormItem
        name="age"
        label="Age"
        rules={[
          {
            required: true,
            message: 'Age is required',
          },
          {
            min: 18,
            type: 'number',
            message: 'you are too young :('
          },
          {
            max: 100,
            type: 'number',
            message: 'you are too old :('
          }
        ]}
      >
        <NumberInput />
      </FormItem>
      <button type="submit">
        Submit button
      </button>
    </Form>
  )
}

```

### Styling
No CSS by default. You need to style form by you own.
You can change classes prefix (`.form` by default) using `CSSPrefix` property.
You can use `renderLabel` to customize <label> and `renderError` for customize form error message.

CSS classes:

`.form` - <form> tag.

`.form__form-item` - form item wrapper

`.form__form-item__label` - form item label (<label> tag)

`.form__form-item__error` - form item error

Look at `./storybook/styles.css` as example.


### Validation

You can pass array of validation rules to `FormItem`.
Don't forget to set error message.
You can control validation trigger using `validationTrigger`: 
`["onChange"]` - trigger fires if value changed (debounced by `300ms`)
`["onFinish"]` - trigger fires only after form submit


```ts
[
   { // throw an error if field value is undefined
      required: true,
      message: 'Age is required',
   },
   { // if value < 18
      min: 18, 
      type: 'number',
      message: 'some message'
   },
   { // if String().length > 100
       max: 100,
       type: 'string',
       message: 'some error'
    },
    { // if myPattern.test() === false
        type: 'regexp',
        pattern: myPattern,
    },
    { // If value is not an email address
        type: 'email',  
    },
    { // if myValidator function throw an error or return Promise.reject
        validator: myValidator,
        message: 'some error'
    },
]
```
