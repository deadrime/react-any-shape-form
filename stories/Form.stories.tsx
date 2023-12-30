/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';
import { Form, FormItem, useFormRef } from '../src/index';
import { Meta, StoryObj } from '@storybook/react';

import { Canvas, Source, Title, Description, Markdown, ArgTypes } from "@storybook/blocks";
import { FormProps } from '../src';

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

import Form from 'react-any-shape-form';

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

const typedExample = `
import { createTypedForm } from "react-any-shape-form";

type MyState = {
  field1: number;
  field2: string;
}

const { Form, FormItem } = createTypedForm<MyState>();

const MyComponent = () => {
  return (
    <Form initialState={{
      field1: 123,
      field2: 321, // Type check
    }} onFinish={(state) => {
      console.log(state.field1) // Autocomplete
    }}>
      <FormItem name="field2" onChange={(value) => {
        // value type highlight as string
      }}>
        <input/>
      </FormItem>
    </Form>
  )
}

`

export const FormItemComponent: Meta<typeof FormItem> = {
  component: FormItem,
  render: (props) => <Form><FormItem {...props} /></Form>,
  args: {
    name: 'field',
    children: <TextInput />,
    rules: [{
      required: true,
    }]
  },
  parameters: {
    chromatic: { disable: true },
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
      type: {
        summary: 'React.ReactElement'
      } as any,
      description: 'react component with `value` and `onChange` props',
    },
    renderLabel: {
      description: '`(value) => React.ReactNode` function',
    },
    rules: {
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

export const BaseExample: StoryObj<typeof Form> = {
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
  },
  tags: ['autodocs'],
  parameters: {
    docs: {
      page: () => (
        <>
          <Title>React any shape form</Title>
          <Description>
            Minimal size, full type support.
            This package was inspired by `antd` form component. But this one without any antd dependencies, smaller, type-friendly and way more flexible. Feel free to just replace antd form with this one.
          </Description>
          <Markdown>## Install</Markdown>
          <Source code='npm i react-any-shape-form' language='bash' />
          <Markdown>## `Form` props</Markdown>
          <ArgTypes />
          <Markdown>## `Form.Item` props</Markdown>
          <ArgTypes of={FormItemComponent} />
          <Markdown>## Basic example</Markdown>
          <Canvas
            of={BaseExample}
            source={{
              language: 'tsx',
              code: baseExampleCode
            }}
            sourceState={'shown'}
          />
          <Markdown>## Full type support for form:</Markdown>
          <Source
            code={typedExample}
            dark
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
