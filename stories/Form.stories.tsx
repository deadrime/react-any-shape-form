/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { createForm, useForm } from "@/useForm";
import { Form } from "@/Form";
import { ComponentProps, useState } from "react";
import { FormItemChildrenProps } from "@/FormItem";

const meta: Meta = {
  component: Form,
  args: {
    initialState: {
      name: "Name",
    },
    CSSPrefix: "form",
    id: "myForm",
    onFinish: (fields) => {
      alert(JSON.stringify(fields, undefined, 2));
    },
  },
  argTypes: {
    initialState: {
      defaultValue: {},
      description: "Predefined fields value",
    },
    id: {
      type: "string",
      description: "html form id",
    },
    onFinish: {
      type: "function",
      description: "callback after form submission and successful validation",
    },
    style: {
      type: {
        summary: "CSSProperties",
      } as any,
    },
    children: {
      type: {
        name: "other",
        value: "React.ReactElement",
      },

      description: "Children can be anything.",
    },
  },
};

export const BaseExample: StoryObj<typeof Form> = {
  render: () => {
    const MyForm = createForm({
      name: "",
      age: 0,
    });

    return (
      <MyForm
        onFinish={(state) => {
          alert(JSON.stringify(state, undefined, 2));
        }}
      >
        <MyForm.Item name="name">
          {({ value, onChange }) => (
            <input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Name"
            />
          )}
        </MyForm.Item>
        <MyForm.Item name="age">
          {({ value, onChange }) => (
            <input
              type="number"
              value={value}
              onChange={(e) => onChange(+e.target.value)}
              placeholder="Age"
            />
          )}
        </MyForm.Item>
        <button type="button" onClick={() => MyForm.formApi.submit()}>Submit</button>
      </MyForm>
    );
  },
};

export const StylesExample: StoryObj<typeof Form> = {
  render: () => {
    const MyForm = createForm({
      name: "Rina",
      age: 24,
    });

    type TextInputProps<T> = Omit<ComponentProps<'input'>, 'onChange'> & FormItemChildrenProps<T> & {
      label: React.ReactNode;
    }

    const TextInput = <T,>({
      value,
      onChange,
      errors,
      label,
      id,
      validationStatus,
      ...props
    }: TextInputProps<T>) => {
      return (
        <div className="sm:col-span-3">
          <label htmlFor={id} className="block text-sm/6 font-medium text-gray-900 mb-1.5">
            {label}
          </label>
          <input
            value={value}
            onChange={(e) => {
              onChange(e.target.value as T);
            }}
            data-invalid={validationStatus === 'error' ? 1 : undefined}
            id={id}
            type="text"
            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 data-invalid:outline-red-500"
            {...props}
          />
          {errors.length > 0 && <div className="flex gap-2 text-red-500 text-xs mt-1">
            {errors.map(i => i.errorText).join(', ')}
          </div>}
        </div>
      )
    }

    return (
      <MyForm
        onFinish={(state) => {
          alert(JSON.stringify(state, undefined, 2));
        }}
      >
        <MyForm.Item
          name="name"
          onChange={(value) => value}
          rules={[
            {
              required: true,
              message: "Name is required",
              validateTrigger: ["onFinish"],
            },
          ]}
        >
          {(props) => (
            <TextInput
              label="Name"
              id="name"
              placeholder="Enter name"
              autoComplete="name"
              {...props}
            />
          )}
        </MyForm.Item>
        <MyForm.Item
          name="age"
          rules={[
            {
              type: "number",
              min: 18,
              max: 45,
              message: "Age must be between 18 and 45",
            },
          ]}
        >
          {(props) => (
            <TextInput
              label="Age"
              id="age"
              placeholder="Enter age"
              autoComplete="age"
              {...props}
            />
          )}
        </MyForm.Item>
        <button className="mt-4 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" type="button" onClick={() => {
          MyForm.formApi.submit()
        }}>
          Submit button
        </button>
      </MyForm>
    );
  },
  argTypes: {
    initialState: {
      control: "object",
    },
  },
  args: {
    onFinish: (state) => {
      alert(JSON.stringify(state, undefined, 2));
    },
  },
  parameters: {
    imports: `import { createForm } from 'react-any-shape-form'`
  }
};

type MyFormType = {
  name: string;
  age: number;
  extra?: string;
};

const MyForm = createForm<MyFormType>({
  name: "Rina",
  age: 24,
});

export const ConditionalRenderExample: StoryObj<typeof Form> = {
  render: () => {
    const [step, setStep] = useState(1);
    const [visible, setVisible] = useState(false);

    return (
      <MyForm
        onFinish={(state) => {
          alert(JSON.stringify(state, undefined, 2));
        }}
      >
        {step === 1 && (
          <>
            <MyForm.Item
              name="name"
              onChange={(value) => value}
              rules={[
                {
                  required: true,
                  message: "Name is required",
                  validateTrigger: ["onFinish"],
                },
              ]}
            >
              {({ value, onChange }) => (
                <input
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                />
              )}
            </MyForm.Item>
            <div>
              <span>Show extra field</span>
              <input
                type="checkbox"
                checked={visible}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setVisible(checked);
                  if (!checked) {
                    MyForm.formApi.setFieldValue("extra", undefined);
                  }
                }}
              />
            </div>
            {visible && (
              <MyForm.Item
                name="extra"
                onChange={(value) => value}
                rules={[
                  {
                    required: true,
                    message: "Extra is required",
                    validateTrigger: ["onFinish"],
                  },
                ]}
              >
                {({ value, onChange }) => (
                  <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                  />
                )}
              </MyForm.Item>
            )}
          </>
        )}
        {step === 2 && (
          <MyForm.Item
            name="age"
            rules={[
              {
                type: "number",
                min: 18,
                max: 40,
                message: "Age must be between 18 and 40",
              },
            ]}
          >
            {({ value, onChange }) => (
              <input
                type="number"
                value={String(value)}
                onChange={(e) => onChange(+e.target.value)}
              />
            )}
          </MyForm.Item>
        )}
        <button
          type="button"
          onClick={async () => {
            if (step === 1) {
              await MyForm.formApi.validateFields();
              setStep(2);
            } else {
              await MyForm.formApi.submit();
            }
          }}
        >
          {step === 1 ? "Next" : "Submit"}
        </button>
        {step === 2 && (
          <button
            type="button"
            onClick={async () => {
              setStep(1);
            }}
          >
            Back
          </button>
        )}
      </MyForm>
    );
  },
  argTypes: {
    initialState: {
      control: "object",
    },
  },
  args: {
    onFinish: (state) => {
      alert(JSON.stringify(state, undefined, 2));
    },
  },
};

export const CustomValidatorExample: StoryObj<typeof Form> = {
  render: (args) => {
    const Form = createForm({
      answer: 0,
      username: "",
    });

    return (
      <Form onFinish={args.onFinish}>
        <Form.Item
          name="answer"
          rules={[
            {
              validator: async (value) => {
                if (value === 42) {
                  return;
                } else {
                  return Promise.reject();
                }
              },
              validateTrigger: ["onFinish"],
              message: "Wrong!",
            },
          ]}
        >
          {({ value, onChange }) => (
            <input
              type="number"
              value={String(value)}
              onChange={(e) => onChange(+e.target.value)}
            />
          )}
        </Form.Item>
        <Form.Item
          name="username"
          rules={[
            {
              validator: async (value) => {
                await new Promise((res) => setTimeout(res, 500));
                if (!["foo", "bar"].includes(value)) {
                  return;
                } else {
                  return Promise.reject(
                    `User with username '${value}' already registered`,
                  );
                }
              },
              validateTrigger: ["onChange", "onFinish"],
            },
          ]}
        >
          {({ value, onChange, validationStatus }) => (
            <div>
              <input value={value} onChange={(e) => onChange(e.target.value)} />
              {validationStatus}
            </div>
          )}
        </Form.Item>
        <button type="button" onClick={() => Form.formApi.submit()}>Submit button</button>
      </Form>
    );
  },
  argTypes: {
    initialState: {
      control: "object",
    },
  },
  args: {
    onFinish: (state) => {
      alert(JSON.stringify(state, undefined, 2));
    },
  },
};

export const UseWatchExample: StoryObj<typeof Form> = {
  render: (args) => {
    const MyForm = useForm({
      name: "Rina",
      age: 24,
    });
    // const name = MyForm.useWatch("name");

    return (
      <MyForm onFinish={args.onFinish}>
        <MyForm.Item
          name="name"
          rules={[
            {
              required: true,
              message: "Name is required",
            },
          ]}
        >
          {({ value, onChange }) => (
            <input value={value} onChange={(e) => onChange(e.target.value)} />
          )}
        </MyForm.Item>
        <MyForm.Item
          name="age"
          rules={[
            {
              required: true,
              message: "Age is required",
            },
            {
              min: 18,
              type: "number",
              message: "You are too young :(",
            },
            {
              max: 100,
              type: "number",
              message: "You are too old :(",
            },
          ]}
        >
          {({ value, onChange }) => (
            <input value={value} onChange={(e) => onChange(+e.target.value)} />
          )}
        </MyForm.Item>
        <button type="button" onClick={() => MyForm.formApi.submit()}>
          Submit button
        </button>
      </MyForm>
    );
  },
  argTypes: {
    initialState: {
      control: "object",
    },
  },
  args: {
    initialState: {
      name: "Boris",
      age: 20,
    },
    onFinish: (state) => {
      alert(JSON.stringify(state, undefined, 2));
    },
  },
};

export const UsingFormApi: StoryObj = {
  render: () => {
    const MyForm = useForm({
      field1: "Some string",
      field2: 123,
    });

    return (
      <MyForm
        onFinish={(fields) => {
          alert(JSON.stringify(fields, undefined, 2));
        }}
        id="myForm"
      >
        <MyForm.Item
          name="field1"
          rules={[
            {
              required: true,
              message: "Field1 is required",
              validateTrigger: ["onFinish"],
            },
          ]}
        >
          {({ value, onChange }) => (
            <input value={value} onChange={(e) => onChange(e.target.value)} />
          )}
        </MyForm.Item>
        <MyForm.Item
          name="field2"
          rules={[
            {
              required: true,
              message: "Field2 is required",
              validateTrigger: ["onFinish"],
            },
          ]}
        >
          {({ value, onChange }) => (
            <input value={value} onChange={(e) => onChange(+e.target.value)} />
          )}
        </MyForm.Item>
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <button
            type="button"
            onClick={() => {
              MyForm.formApi.setFieldsValue({
                field1: "Some",
                field2: 123,
              });
            }}
          >
            Fill
          </button>
          <button
            type="button"
            onClick={() => {
              MyForm.formApi.resetFields();
            }}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => {
              Promise.resolve().then(() => {
                MyForm.formApi.submit();
              });
            }}
          >
            Custom submit
          </button>
          <button
            type="button"
            onClick={() => {
              MyForm.formApi.validateFields();
            }}
          >
            Run all fields validation
          </button>
          <button
            type="button"
            onClick={() => {
              MyForm.formApi.validateFields(["field2"]);
            }}
          >
            Run validation only for field 2
          </button>
        </div>
      </MyForm>
    );
  },
};

export const ArrayExample: StoryObj<typeof Form> = {
  render: () => {
    const Form = useForm({ userIds: [] as string[], test: 0 });

    return (
      <Form
        onFinish={(state) => {
          alert(JSON.stringify(state, undefined, 2));
        }}
      >
        <Form.ArrayItem
          name="userIds"
          rules={[
            {
              required: true,
              message: "Add at least one userId",
            },
            {
              validator: async (value) => {
                if (!value.every(Boolean)) {
                  return Promise.reject("Some field is empty");
                }
              },
            },
          ]}
        >
          {({ fields, update, append, remove }) => (
            <div>
              <div>
                {fields.map((field, index) => (
                  <div key={index}>
                    <input
                      value={field}
                      onChange={(e) => update(index, e.target.value)}
                    />
                    <button type="button" onClick={() => remove(index)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => append("")}>
                Add
              </button>
            </div>
          )}
        </Form.ArrayItem>
        <button type="button" onClick={() => Form.formApi.submit()}>Submit button</button>
      </Form>
    );
  },
  argTypes: {
    initialState: {
      control: "object",
    },
  },
};

export const ArrayHookExample: StoryObj<typeof Form> = {
  render: () => {
    const Form = useForm({ userIds: [] as string[] });

    const { fields, update, append, remove } = Form.useArrayField("userIds", [
      {
        type: "array",
        min: 1,
        message: "Add at least one userId",
      },
      {
        validator: async (value) => {
          if (!value.every(Boolean)) {
            return Promise.reject("Some field is empty");
          }
        },
      },
    ]);

    const { errors } = Form.useFieldErrors("userIds");

    return (
      <Form
        onFinish={(state) => {
          alert(JSON.stringify(state, undefined, 2));
        }}
      >
        <div>
          <div>
            {fields.map((field, index) => (
              <div key={index}>
                <input
                  value={field}
                  onChange={(e) => update(index, e.target.value)}
                />
                <button type="button" onClick={() => remove(index)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => append("")}>
            Add
          </button>
        </div>

        <div>
          {errors.map(({ errorText }) => (
            <div className="form__form-item__error">{errorText}</div>
          ))}
        </div>

        <button type="button" onClick={() => Form.formApi.submit()}>Submit button</button>
      </Form>
    );
  },
  argTypes: {
    initialState: {
      control: "object",
    },
  },
};

export const TransformExample: StoryObj<typeof Form> = {
  render: () => {
    const Form = useForm({ test: 123456 });

    const convertToFloat = (number: string, locale = "en-IN") => {
      const group = new Intl.NumberFormat(locale)
        .format(1111)
        .replace(/1/g, "");
      const decimal = new Intl.NumberFormat(locale)
        .format(1.1)
        .replace(/1/g, "");
      const reversedVal = number
        .replace(new RegExp("\\" + group, "g"), "")
        .replace(new RegExp("\\" + decimal, "g"), ".");

      return Number(reversedVal);
    };

    const formatNumber = (number, locale = "en-IN") =>
      new Intl.NumberFormat(locale).format(number);

    return (
      <Form
        onFinish={(state) => {
          alert(JSON.stringify(state, undefined, 2));
        }}
      >
        <Form.Item name="test">
          {({ value, onChange }) => (
            <input
              value={formatNumber(value, "ru")}
              onChange={(e) => {
                const value = convertToFloat(e.target.value, "ru");
                onChange(
                  isNaN(value) ? Form.formApi.getFieldValue("test") : value,
                );
              }}
            />
          )}
        </Form.Item>

        <button type="button" onClick={() => Form.formApi.submit()}>Submit button</button>
      </Form>
    );
  },
  argTypes: {
    initialState: {
      control: "object",
    },
  },
};

export default meta;
