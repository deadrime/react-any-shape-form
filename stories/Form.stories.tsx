/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { useFormRef } from '../src/index';

import type { Meta, StoryObj } from '@storybook/react';

import { Form } from '../src/index';
import React from 'react';

const meta: Meta<typeof Form> = {
  component: Form,
  args: {
    initialState: {
      name: 'Name'
    },
    CSSPrefix: 'form',
    id: 'myForm',
    onFinish: (fields) => {
      alert(JSON.stringify(fields, undefined, 2))
    },
  },
  argTypes: {
    initialState: {
      defaultValue: {},
      description: 'Predefined fields value',
      type: 'symbol'
    },
    CSSPrefix: {
      type: 'string',
      description: 'CSS prefix',
      defaultValue: 'form'
    },
    id: {
      type: 'string',
      description: 'html form id',
    },
    onFinish: {
      type: 'function',
      description: 'callback after form submit and successful validation',
    },
    onValuesChange: {
      type: 'function',
      description: 'callback after any fields value changes',
    },
    style: {
      type: {
        summary: 'React.CSSProperties'
      } as any,
    },
    children: {
      type: {
        summary: 'React.ReactNode | (state: FormState) => React.ReactNode'
      } as any,
      description: 'Children can be anything. Use render function to get access to form state'
    }
  }
};

export const BaseExample: StoryObj<typeof Form> = {
  render: (args) => {
    return (
      <Form {...args}>
        <Form.Item
          name="name"
          label="Name"
          rules={[
            {
              required: true,
              message: 'Name is required'
            },
          ]}
        >
          <input />
        </Form.Item>
        <Form.Item
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
              message: 'You are too young :('
            },
            {
              max: 100,
              type: 'number',
              message: 'You are too old :('
            }
          ]}
        >
          <input />
        </Form.Item>
        <button type="submit">
          Submit button
        </button>
      </Form>
    );
  },
  argTypes: {
    initialState: {
      control: 'object',
    },
  },
  args: {
    initialState: {
      name: 'Some name',
      age: 20,
    },
    onFinish: (state) => {
      alert(JSON.stringify(state, undefined, 2))
    }
  }
};

type MyFormType = {
  field1: string;
  field2: string;
}

export const UsingFormApi: StoryObj = {
  render: () => {
    const formRef = useFormRef<MyFormType>();

    return (
      <Form
        ref={formRef}
        onFinish={(fields) => {
          alert(JSON.stringify(fields, undefined, 2))
        }}
        id="myForm"
      >
        <Form.Item
          name="field1"
          label="Field1"
          rules={[{
            required: true,
            message: 'Field1 is required'
          }]}
        >
          <input />
        </Form.Item>
        <Form.Item
          name="field2"
          label="Field2"
          rules={[{
            required: true,
            message: 'Field2 is required'
          }]}
        >
          <input />
        </Form.Item>
        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <button type="button" onClick={() => {
            formRef.current?.setFieldsValue({
              field1: 'Some',
              field2: 'Value'
            })
          }}>
            Fill
          </button>
          <button type="button" onClick={() => {
            formRef.current?.resetFields();
          }}>
            Reset
          </button>
          <button type="button" onClick={() => {
            Promise.resolve().then(() => {
              formRef.current?.submit();
            })
          }}>
            Custom submit
          </button>
          <button type="button" onClick={() => {
            formRef.current?.validateFields()
          }}>
            Run all fields validation
          </button>
          <button type="button" onClick={() => {
            formRef.current?.validateFields(['field2'])
          }}>
            Run validation only for field 2
          </button>
        </div>
      </Form>
    );
  },
};

export default meta;
