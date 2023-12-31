/* eslint-disable @typescript-eslint/no-explicit-any */
import { Meta, StoryObj } from "@storybook/react";
import { Form, FormItem } from "../src";
import React from "react";

const meta: Meta<typeof FormItem> = {
  component: FormItem,
  render: (props) => <Form>
    <FormItem {...props} />
  </Form>,
  args: {
    name: 'field',
    children: <input />,
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
      type: {
        summary: 'React.ReactNode'
      } as any,
      description: 'Form item label, string or `React.ReactNode`'
    },
    children: {
      control: { type: null },
      type: {
        summary: 'React.ReactElement'
      } as any,
      description: 'react component with `value` and `onChange` props',
    },
    value: {
      control: { type: null },
    },
    renderLabel: {
      description: '`(value) => React.ReactNode` function',
    },
    rules: {
      control: 'object',
      description: 'array of `FormItemRule`'
    },
    getValueFromEvent: {
      type: 'function',
      description: '`(event: unknown) => event.target.myValue`, if you component dispatch some custom event you need to specify how value can be extracted'
    },
    renderError: {
      type: 'function',
      description: '`(error: string) => React.ReactNode`, if you want to customize error. You also can just just specify some CSS for `form__form-item__error`'
    },
    onChange: {
      type: 'function',
      description: '`(value: Value, event: unknown) => void`, usually you don\'t need need this callback, if you need access to form state - use render function as form children.'
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
          <input placeholder="some placeholder" />
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

export const WithCustomValidation: StoryObj<typeof FormItem> = {
  render: (props) => {
    return (
      <Form onFinish={(fields) => {
        alert(JSON.stringify(fields, undefined, 2))
      }} id="myForm">
        <Form.Item
          {...props}
        >
          <input />
        </Form.Item>
        <button type="submit">
          Submit
        </button>
      </Form>
    );
  },
  args: {
    name: 'answer',
    label: 'Answer to the Ultimate Question of Life, the Universe, and Everything',
    rules: [
      {
        validateTrigger: ['onFinish'],
        validator: async (value) => {
          if (Number(value) !== 42) {
            throw new Error('Wrong!');
          }
        },
      },
    ]
  }
};


export default meta;
