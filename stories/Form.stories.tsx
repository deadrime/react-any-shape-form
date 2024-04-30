/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from '@storybook/react';
import { createForm, useForm } from '@/useForm';
import { Form } from '@/Form'

const meta: Meta<any> = {
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
  render: () => {
    // Create form outside of your component
    const MyForm = createForm({
      name: 'Rina',
      age: 24,
    })

    return (
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
    );
  },
  argTypes: {
    initialState: {
      control: 'object',
    },
  },
  args: {
    onFinish: (state) => {
      alert(JSON.stringify(state, undefined, 2))
    }
  }
};

export const CustomValidatorExample: StoryObj<typeof Form> = {
  render: (args) => {
    const Form = createForm({
      custom: 0,
    });

    return (
      <Form onFinish={args.onFinish}>
        <Form.Item
          name="custom"
          label={"Answer of Universe"}
          rules={[
            {
              validator: async (value) => {
                if (value === 42) {
                  return
                } else {
                  return Promise.reject();
                }
              },
              validateTrigger: ['onFinish'],
              message: 'Wrong!',
            },
          ]}
        >
          {({ value, onChange }) =>
            <input
              type="number"
              value={value}
              onChange={e => onChange(+e.target.value)}
            />
          }
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
    onFinish: (state) => {
      alert(JSON.stringify(state, undefined, 2))
    }
  }
};


export const StateAccessExample: StoryObj<typeof Form> = {
  render: (args) => {
    const MyForm = useForm({
      name: 'Rina',
      age: 24,
    });
    const name = MyForm.useWatch('name');

    return (
      <MyForm onFinish={args.onFinish}>
        <MyForm.Item
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
        </MyForm.Item>
        <MyForm.Item
          name="age"
          label={`${name} age`}
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
        </MyForm.Item>
        <button type="submit">
          Submit button
        </button>
      </MyForm >
    );
  },
  argTypes: {
    initialState: {
      control: 'object',
    },
  },
  args: {
    initialState: {
      name: 'Boris',
      age: 20,
    },
    onFinish: (state) => {
      alert(JSON.stringify(state, undefined, 2))
    }
  }
};

export const UsingFormApi: StoryObj = {
  render: () => {
    const MyForm = useForm({
      field1: 'Some string',
      field2: 123,
    });

    return (
      <MyForm
        onFinish={(fields) => {
          alert(JSON.stringify(fields, undefined, 2))
        }}
        id="myForm"
      >
        <MyForm.Item
          name="field1"
          label="Field1"
          rules={[{
            required: true,
            message: 'Field1 is required',
            validateTrigger: ['onFinish']
          }]}
        >
          <input />
        </MyForm.Item>
        <MyForm.Item
          name="field2"
          label="Field2"
          rules={[{
            required: true,
            message: 'Field2 is required',
            validateTrigger: ['onFinish']
          }]}
        >
          <input />
        </MyForm.Item>
        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <button type="button" onClick={() => {
            MyForm.formApi.setFieldsValue({
              field1: 'Some',
              field2: 123
            })
          }}>
            Fill
          </button>
          <button type="button" onClick={() => {
            MyForm.formApi.resetFields();
          }}>
            Reset
          </button>
          <button type="button" onClick={() => {
            Promise.resolve().then(() => {
              MyForm.formApi.submit();
            })
          }}>
            Custom submit
          </button>
          <button type="button" onClick={() => {
            MyForm.formApi.validateFields()
          }}>
            Run all fields validation
          </button>
          <button type="button" onClick={() => {
            MyForm.formApi.validateFields(['field2'])
          }}>
            Run validation only for field 2
          </button>
        </div>
      </MyForm>
    );
  },
};

export const ArrayExample: StoryObj<typeof Form> = {
  render: () => {
    const Form = useForm({ userIds: [] as string[] });

    return (
      <Form onFinish={state => {
        alert(JSON.stringify(state, undefined, 2))
      }}>
        <Form.ArrayItem
          name="userIds"
          label="People list"
          rules={[
            {
              required: true,
              message: 'Name is required'
            },
            {
              validator: async (value) => {
                if (!value.every(Boolean)) {
                  return Promise.reject('Some field is empty')
                }
              }
            }
          ]}
        >
          {({ fields, update, append, remove }) => (
            <div>
              <div>
                {fields.map((field, index) =>
                  <div key={index}>
                    <input value={field} onChange={e => update(index, e.target.value)} />
                    <button type="button" onClick={() => remove(index)}>Remove</button>
                  </div>
                )}
              </div>
              <button type="button" onClick={() => append("")}>
                Add
              </button>
            </div>
          )}
        </Form.ArrayItem>
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
};

export default meta;
