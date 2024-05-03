# React any shape form

Lightweight form library focused on ease of use. This library was inspired by `antd` form component and `react-hook-form`. 

![npm bundle size](https://img.shields.io/bundlephobia/min/react-any-shape-form) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/react-any-shape-form)

## Features

- Small size
- Type-friendly, all components and hooks fully typed
- Ease to use, you need only `createForm` method to get all the functionality
- Build in promise based validation, you can easy use your own promise function to validate fields
- No extra re-renders
- `useWatch`, `useField`, `useArrayField`, `useFieldError` hooks
- Access to form state in any place of application, even outside of form component

Docs and examples - https://react-any-shape-form.vercel.app/

## Get started

Install:

```bash
npm i react-any-shape-form
```

Use it like this:

```tsx
import { createForm } from 'react-any-shape-form';

const MyForm = createForm({
  name: 'Rina',
  age: 24,
})

const MyComponent = () => 
  <MyForm onFinish={(state) => {
    alert(JSON.stringify(state, undefined, 2));
  }}>
    <MyForm.Item
      name="name"
      label="Name"
      onChange={value => value}
      rules={[
        {
          required: true,
          message: 'Name is required',
          validateTrigger: ['onFinish']
        },
      ]}
    >
      {({ value, onChange }) =>
        <input value={value} onChange={e => onChange(e.target.value)} />
      }
    </MyForm.Item>
    <MyForm.Item name="age">
      {({ value, onChange }) =>
        <input type="number" value={value} onChange={(e) => onChange(+e.target.value)} />
      }
    </MyForm.Item>
    <button type="submit">
      Submit button
    </button>
  </MyForm>
```

You can find more examples in [docs](https://react-any-shape-form.vercel.app/?path=/docs/docs--docs)

### Form props


| Field        | Type        | Description             | Default     |
|--------------|-------------|-------------------------|-------------|
| initialState | `Object`    | Predefined fields value | `{}`        |
| CSSPrefix    | `string`    | Prefix for css classes  | 'form'      |
| id           | `string`    | html form id            | `undefined` |
| children     | `ReactNode` |                         |             |

### Form.Item props


| Field             | Type                                                  | Description                                       | Default |
|-------------------|-------------------------------------------------------|---------------------------------------------------|---------|
| children          | `FC` or `ReactElement`                                | Function/component with `value`, `onChange` props | `{}`    |
| label             | `ReactNode`                                           | Field label                                       |         |
| rules             | `ValidationRule[]`                                    | Validation rule                                   |         |
| normalize         | `(value: Value) => any`                               | Transform value before display it                 |         |
| getValueFromEvent | `(...args: any[]) => Value`                           | Get value from `onChange` cb                      |         |
| onChange          | `(value: Value, event?: unknown)` => any              | Triggers on field state changes                   |         |
| onInvalid         | `(error: ValidationError[], value: Value) => void`    | Triggers on validation error                      |         |
| renderLabel       | `(value: Value, formItemId?: string) => ReactElement` | Customize label                                   |         |
| renderError       | `(error: ValidationError<Value>) => ReactElement`     | Customize error                                   |         |

### Styling

No CSS by default. You need to style form by you own.
You can change classes prefix (`.form` by default) using `CSSPrefix` property.
You can use `renderLabel` to customize `<label>` and `renderError` for customize form error message.

CSS classes:

`.form` - `<form>` tag class.

`.form__form-item` - form item wrapper

`.form__form-item__label` - form item label (`<label>` tag)

`.form__form-item__error` - form item error

Look at `./storybook/styles.css` as example.

### Validation

You can pass array of validation rules to `Form.Item`.
Don't forget to set error message or return `Promise.reject('your-error-message')`.
You can control validation trigger using `validationTrigger`:
`["onChange"]` - trigger fires if value changed (debounced by `300ms`)
`["onFinish"]` - trigger fires only after form submit

```ts
[
  {
    // throw an error if field value is undefined
    required: true,
    message: "Age is required",
  },
  {
    // if value < 18
    min: 18,
    type: "number",
    message: "some message",
  },
  {
    // if String().length > 100
    max: 100,
    type: "string",
    message: "some error",
  },
  {
    // if myPattern.test() === false
    type: "regexp",
    pattern: myPattern,
  },
  {
    // If value is not an email address
    type: "email",
  },
  {
    // if myValidator function throw an error or return Promise.reject
    validator: myValidator,
    message: "some error",
  },
];
```

### Hooks

- `Form.useWatch` - get actual field value

```tsx
const MyForm = createForm({
  name: 'Rina',
  age: 24,
})

const SomeComponent = () => {
  const name = MyForm.useWatch('name');
  ...
}

```

- `Form.useField` - get control over field state

```tsx
const [name, setName] = MyForm.useField('name');
```

- `Form.useFieldError` - get actual field validation errors

- `Form.useArrayField` - get control over array field

```tsx
const MyForm = createForm({
  userIds: [] as string[]
})

const SomeComponent = () => {
  const { fields, append, delete } = MyForm.useArrayField('userIds');
  
  return (
    <>
      {fields.map((field, index) =>
        <div key={index}>
          <input value={field} onChange={e => update(index, e.target.value)} />
          <button type="button" onClick={() => remove(index)}>Remove</button>
        </div>
      )}
      <button type="button" onClick={() => append("")}>
        Add
      </button>
    </>
  )
}

```
