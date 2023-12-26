/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';
import { Form, FormItem, useFormRef } from '../src/index';
import { Meta, StoryObj } from '@storybook/react';

import { Canvas, Source, Title, Description, Markdown, ArgTypes } from "@storybook/blocks";
import { FormProps } from '../src';

import { SourceType } from "@storybook/docs-tools"

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

const baseExampleCode = `

import Form from 'react-styleless-form';

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

const MyForm = () => (
  <Form
    onFinish={(fields) => {
      // Do something with fields value
      alert(JSON.stringify(fields, undefined, 2))
    }}
    id="myForm"
  >
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
      <TextInput />
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
      <NumberInput />
    </Form.Item>
    <button type="submit">
      Submit button
    </button>
  </Form>
)
`;

export const FormItemComponent: StoryObj<typeof FormItem> = {
  args: {
    name: 'field',
    children: <TextInput />,
    rules: [{
      required: true
    }]
  },
  argTypes: {
    name: {
      type: 'string',
      description: 'field name that store in form state',
    },
    children: {
      description: 'react component with `value` and `onChange` props',
    },
    rules: {
      description: 'array of `FormItemRule`'
    }
  },
  render: (args) => (
    <Form>
      <FormItem {...args} />
    </Form>
  ),
}

export const Basic: StoryObj<typeof Form> = {
  tags: ['autodocs'],
  render: (args) => {
    return (
      <Form {...args}>
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

const meta = {
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
      defaultValue: undefined,
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
      description: 'callback after form submit',
    },
    onValuesChange: {
      type: 'function',
      description: 'callback after any fields value changes',
    }
  },
  tags: ['autodocs'],
  parameters: {
    docs: {
      page: () => (
        <>
          <Title>React styleless form</Title>
          <Description>
            This package was inspired by `antd` form component. But this one without any antd dependencies, smaller, type-friendly and way more flexible. Feel free to just replace antd form with this one.
          </Description>
          <Markdown>## Install</Markdown>
          <Source code='npm i react-styleless-form' language='bash' />
          <Markdown>## `Form` props</Markdown>
          <ArgTypes />
          <Markdown>## `Form.Item` props</Markdown>
          <ArgTypes of={FormItemComponent} include={['name', 'children', 'rules']} />
          <Markdown>## Basic example</Markdown>
          <Canvas
            of={Basic}
            source={{
              language: 'tsx',
              code: baseExampleCode
            }}
            sourceState={'shown'}
          />
          <Markdown>## With custom validation</Markdown>
          <Canvas of={WithCustomValidation} sourceState={'shown'} />
          <Markdown>## Using form API</Markdown>
          <Canvas
            of={UsingFormApi}
            source={{
              language: 'tsx',
            }}
            sourceState={'shown'}
          />
        </>
      )
    }
  }
} satisfies Meta<FormProps>;

export default meta
