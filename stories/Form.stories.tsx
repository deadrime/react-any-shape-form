import React from 'react';
import { Form, FormItem, useFormRef } from '../src/index';
import { Meta, StoryObj } from '@storybook/react';

type InputProps<T> = {
  value?: T;
  onChange?: (value: T) => void
  id?: string
}

const TextInput: React.FC<InputProps<string>> = ({ value, onChange, id }) => {
  return (
    <input
      value={value}
      onChange={e => onChange?.(e.target.value)}
      id={id}
    />
  )
}

const NumberInput: React.FC<InputProps<number>> = ({ value, onChange, id }) => {
  return (
    <input
      type="number"
      value={value}
      onChange={e => onChange?.(+e.target.value)}
      id={id}
    />
  )
}

const meta = {
  component: Form,
  tags: ['autodocs'],
} satisfies Meta<typeof Form>;

export default meta

export const Basic: StoryObj = {
  render: () => {
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
              message: 'You are too young :('
            },
            {
              max: 100,
              type: 'number',
              message: 'You are too old :('
            }
          ]}
        >
          <NumberInput />
        </FormItem>
        <button type="submit">
          Submit button
        </button>
      </Form>
    );
  },
};

export const WithCustomValidation: StoryObj = {
  render: () => {
    return (
      <Form onFinish={(fields) => {
        alert(JSON.stringify(fields, undefined, 2))
      }} id="myForm">
        <FormItem
          name="answer"
          label="Answer to the Ultimate Question of Life, the Universe, and Everything"
          rules={[
            {
              validateTrigger: ['onFinish'],
              validator: async (value) => {
                if (Number(value) !== 42) {
                  throw new Error('Wrong!');
                }
              },
            },
          ]}
        >
          <TextInput />
        </FormItem>
        <button type="submit">
          Submit
        </button>
      </Form>
    );
  },
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
        <FormItem
          name="field1"
          label="Field1"
          rules={[{
            required: true,
            message: 'Field1 is required'
          }]}
        >
          <TextInput />
        </FormItem>
        <FormItem
          name="field2"
          label="Field2"
          rules={[{
            required: true,
            message: 'Field2 is required'
          }]}
        >
          <TextInput />
        </FormItem>
        <div style={{ display: 'flex', gap: 12 }}>
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
