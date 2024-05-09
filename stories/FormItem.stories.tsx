/* eslint-disable @typescript-eslint/no-explicit-any */
import { Meta, StoryObj } from "@storybook/react";
import { Form, FormItem } from "../src";

const meta: Meta<typeof FormItem> = {
  component: FormItem,
  render: (props) => <Form>
    <FormItem {...props} />
  </Form>,
  args: {
    name: 'field',
    rules: [{
      required: true,
    }]
  },
  argTypes: {
    name: {
      type: 'string',
      description: 'field name that store in form state',
    },
    label: {
      description: 'form item label'
    },
    children: {
      description: '`React.FC` or render function with `value` and `onChange` props',
    },
    renderLabel: {
      description: 'if you want to customize label',
    },
    rules: {
      control: 'object',
      description: 'validation rules'
    },
    renderError: {
      description: 'if you want to customize error. You also can just just specify some CSS for `form__form-item__error`'
    },
    onChange: {
      description: 'usually you don\'t need need this callback, if you need access to form state - use render function as form children.'
    }
  }
}

export const BaseExample: StoryObj<typeof FormItem> = {
  render: (args) => {
    return (
      <Form onFinish={(state) => {
        alert(JSON.stringify(state, undefined, 2))
      }}>
        <FormItem
          {...args}
          onInvalid={(error, value) => {
            console.log(error, value)
          }}
        >
          {({ value, onChange }) =>
            <input value={value} onChange={e => onChange(e.target.value)} />
          }
        </FormItem>
        <button type="submit">Submit</button>
      </Form>
    );
  },
  args: {
    name: 'field',
    label: 'Field label',
    rules: [
      {
        required: true,
        message: 'Field is required'
      },
      {
        type: 'number',
        min: 10,
        // max: 100,
        message: 'Value must be between 10 and 100!'
      }
    ]
  }
};

export default meta;
