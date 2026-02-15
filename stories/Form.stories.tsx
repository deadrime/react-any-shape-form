/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { createForm, useForm } from "@/useForm";
import { Form } from "@/Form";
import { ComponentProps, useState } from "react";
import { FormItemChildrenProps } from "@/FormItem";
import "./stories.css";

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
        <div className="form">
          <MyForm.Item name="name">
            {({ value, onChange, errors, validationStatus }) => (
              <div>
                <label>Name</label>
                <input
                  className={`input ${validationStatus === 'error' ? 'input-invalid' : ''}`}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="Name"
                />
                {errors.length > 0 && <div className="error">{errors.map(e => e.errorText).join(', ')}</div>}
              </div>
            )}
          </MyForm.Item>
          <MyForm.Item name="age">
            {({ value, onChange, errors, validationStatus }) => (
              <div>
                <label>Age</label>
                <input
                  className={`input ${validationStatus === 'error' ? 'input-invalid' : ''}`}
                  type="number"
                  value={value}
                  onChange={(e) => onChange(+e.target.value)}
                  placeholder="Age"
                />
                {errors.length > 0 && <div className="error">{errors.map(e => e.errorText).join(', ')}</div>}
              </div>
            )}
          </MyForm.Item>
          <button className="btn" type="button" onClick={() => MyForm.formApi.submit()}>Submit</button>
        </div>
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
        <div className="form">
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
                {({ value, onChange, errors, validationStatus }) => (
                  <div>
                    <label>Name</label>
                    <input
                      className={`input ${validationStatus === 'error' ? 'input-invalid' : ''}`}
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                    />
                    {errors.length > 0 && <div className="error">{errors.map(e => e.errorText).join(', ')}</div>}
                  </div>
                )}
              </MyForm.Item>
              <div className="checkbox-row">
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
                  {({ value, onChange, errors, validationStatus }) => (
                    <div>
                      <label>Extra</label>
                      <input
                        className={`input ${validationStatus === 'error' ? 'input-invalid' : ''}`}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                      />
                      {errors.length > 0 && <div className="error">{errors.map(e => e.errorText).join(', ')}</div>}
                    </div>
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
              {({ value, onChange, errors, validationStatus }) => (
                <div>
                  <label>Age</label>
                  <input
                    className={`input ${validationStatus === 'error' ? 'input-invalid' : ''}`}
                    type="number"
                    value={String(value)}
                    onChange={(e) => onChange(+e.target.value)}
                  />
                  {errors.length > 0 && <div className="error">{errors.map(e => e.errorText).join(', ')}</div>}
                </div>
              )}
            </MyForm.Item>
          )}
          <div className="btn-group">
            <button
              className="btn"
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
                className="btn btn-secondary"
                type="button"
                onClick={async () => {
                  setStep(1);
                }}
              >
                Back
              </button>
            )}
          </div>
        </div>
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
        <div className="form">
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
            {({ value, onChange, errors, validationStatus }) => (
              <div>
                <label>What is the answer to life, the universe, and everything?</label>
                <input
                  className={`input ${validationStatus === 'error' ? 'input-invalid' : ''}`}
                  type="number"
                  value={String(value)}
                  onChange={(e) => onChange(+e.target.value)}
                />
                {errors.length > 0 && <div className="error">{errors.map(e => e.errorText).join(', ')}</div>}
              </div>
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
            {({ value, onChange, errors, validationStatus }) => (
              <div>
                <label>Username</label>
                <input
                  className={`input ${validationStatus === 'error' ? 'input-invalid' : ''}`}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                />
                <span className="status">{validationStatus}</span>
                {errors.length > 0 && <div className="error">{errors.map(e => e.errorText).join(', ')}</div>}
              </div>
            )}
          </Form.Item>
          <button className="btn" type="button" onClick={() => Form.formApi.submit()}>Submit button</button>
        </div>
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
        <div className="form">
          <MyForm.Item
            name="name"
            rules={[
              {
                required: true,
                message: "Name is required",
              },
            ]}
          >
            {({ value, onChange, errors, validationStatus }) => (
              <div>
                <label>Name</label>
                <input
                  className={`input ${validationStatus === 'error' ? 'input-invalid' : ''}`}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                />
                {errors.length > 0 && <div className="error">{errors.map(e => e.errorText).join(', ')}</div>}
              </div>
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
            {({ value, onChange, errors, validationStatus }) => (
              <div>
                <label>Age</label>
                <input
                  className={`input ${validationStatus === 'error' ? 'input-invalid' : ''}`}
                  value={value}
                  onChange={(e) => onChange(+e.target.value)}
                />
                {errors.length > 0 && <div className="error">{errors.map(e => e.errorText).join(', ')}</div>}
              </div>
            )}
          </MyForm.Item>
          <button className="btn" type="button" onClick={() => MyForm.formApi.submit()}>
            Submit button
          </button>
        </div>
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
        <div className="form">
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
            {({ value, onChange, errors, validationStatus }) => (
              <div>
                <label>Field 1</label>
                <input
                  className={`input ${validationStatus === 'error' ? 'input-invalid' : ''}`}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                />
                {errors.length > 0 && <div className="error">{errors.map(e => e.errorText).join(', ')}</div>}
              </div>
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
            {({ value, onChange, errors, validationStatus }) => (
              <div>
                <label>Field 2</label>
                <input
                  className={`input ${validationStatus === 'error' ? 'input-invalid' : ''}`}
                  value={value}
                  onChange={(e) => onChange(+e.target.value)}
                />
                {errors.length > 0 && <div className="error">{errors.map(e => e.errorText).join(', ')}</div>}
              </div>
            )}
          </MyForm.Item>
          <div className="btn-group">
            <button
              className="btn"
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
              className="btn btn-secondary"
              type="button"
              onClick={() => {
                MyForm.formApi.resetFields();
              }}
            >
              Reset
            </button>
            <button
              className="btn"
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
              className="btn btn-secondary"
              type="button"
              onClick={() => {
                MyForm.formApi.validateFields();
              }}
            >
              Run all fields validation
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => {
                MyForm.formApi.validateFields(["field2"]);
              }}
            >
              Run validation only for field 2
            </button>
          </div>
        </div>
      </MyForm>
    );
  },
};

export const ArrayExample: StoryObj<typeof Form> = {
  render: () => {
    const Form = useForm({ userIds: [] as string[], test: 0 });
    const { errors } = Form.useFieldErrors("userIds");

    return (
      <Form
        onFinish={(state) => {
          alert(JSON.stringify(state, undefined, 2));
        }}
      >
        <div className="form">
          <label>User IDs</label>
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
                <div className="array-list">
                  {fields.map((field, index) => (
                    <div className="array-row" key={index}>
                      <input
                        className="input"
                        value={field}
                        onChange={(e) => update(index, e.target.value)}
                      />
                      <button className="btn btn-danger" type="button" onClick={() => remove(index)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button className="btn btn-secondary" type="button" onClick={() => append("")} style={{ marginTop: 8 }}>
                  Add
                </button>
              </div>
            )}
          </Form.ArrayItem>
          {errors.length > 0 && <div className="error">{errors.map((e) => e.errorText).join(', ')}</div>}
          <button className="btn" type="button" onClick={() => Form.formApi.submit()}>Submit button</button>
        </div>
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
        <div className="form">
          <label>User IDs</label>
          <div className="array-list">
            {fields.map((field, index) => (
              <div className="array-row" key={index}>
                <input
                  className="input"
                  value={field}
                  onChange={(e) => update(index, e.target.value)}
                />
                <button className="btn btn-danger" type="button" onClick={() => remove(index)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button className="btn btn-secondary" type="button" onClick={() => append("")}>
            Add
          </button>

          {errors.length > 0 && (
            <div className="error">
              {errors.map(({ errorText }) => errorText).join(', ')}
            </div>
          )}

          <button className="btn" type="button" onClick={() => Form.formApi.submit()}>Submit button</button>
        </div>
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
        <div className="form">
          <Form.Item name="test">
            {({ value, onChange }) => (
              <div>
                <label>Number (Russian format)</label>
                <input
                  className="input"
                  value={formatNumber(value, "ru")}
                  onChange={(e) => {
                    const value = convertToFloat(e.target.value, "ru");
                    onChange(
                      isNaN(value) ? Form.formApi.getFieldValue("test") : value,
                    );
                  }}
                />
              </div>
            )}
          </Form.Item>
          <button className="btn" type="button" onClick={() => Form.formApi.submit()}>Submit button</button>
        </div>
      </Form>
    );
  },
  argTypes: {
    initialState: {
      control: "object",
    },
  },
};

export const NestedFormExample: StoryObj<typeof Form> = {
  render: () => {
    const AddressForm = createForm({
      city: "",
      street: "",
      zip: "",
    });

    const MainForm = createForm({
      name: "",
      email: "",
      address: AddressForm,
    });

    return (
      <MainForm
        onFinish={(state) => {
          alert(JSON.stringify(state, undefined, 2));
        }}
      >
        <div className="form">
          <MainForm.Item name="name" rules={[{ required: true, message: "Name is required" }]}>
            {({ value, onChange, errors, validationStatus }) => (
              <div>
                <label>Name</label>
                <input
                  className={`input ${validationStatus === 'error' ? 'input-invalid' : ''}`}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="Name"
                />
                {errors.length > 0 && <div className="error">{errors.map(e => e.errorText).join(', ')}</div>}
              </div>
            )}
          </MainForm.Item>
          <MainForm.Item name="email" rules={[{ required: true, message: "Email is required" }, { type: "email", message: "Invalid email" }]}>
            {({ value, onChange, errors, validationStatus }) => (
              <div>
                <label>Email</label>
                <input
                  className={`input ${validationStatus === 'error' ? 'input-invalid' : ''}`}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="Email"
                />
                {errors.length > 0 && <div className="error">{errors.map(e => e.errorText).join(', ')}</div>}
              </div>
            )}
          </MainForm.Item>

          <fieldset className="fieldset">
            <legend>Address</legend>
            <AddressForm>
              <div className="form">
                <AddressForm.Item name="city" rules={[{ required: true, message: "City is required" }]}>
                  {({ value, onChange, errors, validationStatus }) => (
                    <div>
                      <label>City</label>
                      <input
                        className={`input ${validationStatus === 'error' ? 'input-invalid' : ''}`}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="City"
                      />
                      {errors.length > 0 && <div className="error">{errors.map(e => e.errorText).join(', ')}</div>}
                    </div>
                  )}
                </AddressForm.Item>
                <AddressForm.Item name="street" rules={[{ required: true, message: "Street is required" }]}>
                  {({ value, onChange, errors, validationStatus }) => (
                    <div>
                      <label>Street</label>
                      <input
                        className={`input ${validationStatus === 'error' ? 'input-invalid' : ''}`}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Street"
                      />
                      {errors.length > 0 && <div className="error">{errors.map(e => e.errorText).join(', ')}</div>}
                    </div>
                  )}
                </AddressForm.Item>
                <AddressForm.Item name="zip" rules={[{ type: "regexp", pattern: /^\d{5,6}$/, message: "Invalid zip code" }]}>
                  {({ value, onChange, errors, validationStatus }) => (
                    <div>
                      <label>Zip Code</label>
                      <input
                        className={`input ${validationStatus === 'error' ? 'input-invalid' : ''}`}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Zip code"
                      />
                      {errors.length > 0 && <div className="error">{errors.map(e => e.errorText).join(', ')}</div>}
                    </div>
                  )}
                </AddressForm.Item>
              </div>
            </AddressForm>
          </fieldset>

          <button className="btn" type="button" onClick={() => MainForm.formApi.submit()}>
            Submit
          </button>
        </div>
      </MainForm>
    );
  },
};

export const NestedFormDynamicExample: StoryObj<typeof Form> = {
  render: () => {
    const ProfileForm = useForm({
      bio: "",
      website: "",
    });

    const MainForm = useForm({
      username: "",
      profile: {} as { bio: string; website: string },
    });

    MainForm.useChildForm("profile", ProfileForm.formApi);

    return (
      <MainForm
        onFinish={(state) => {
          alert(JSON.stringify(state, undefined, 2));
        }}
      >
        <div className="form">
          <MainForm.Item name="username" rules={[{ required: true, message: "Username is required" }]}>
            {({ value, onChange, errors, validationStatus }) => (
              <div>
                <label>Username</label>
                <input
                  className={`input ${validationStatus === 'error' ? 'input-invalid' : ''}`}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="Username"
                />
                {errors.length > 0 && <div className="error">{errors.map(e => e.errorText).join(', ')}</div>}
              </div>
            )}
          </MainForm.Item>

          <fieldset className="fieldset">
            <legend>Profile</legend>
            <ProfileForm>
              <div className="form">
                <ProfileForm.Item name="bio" rules={[{ required: true, message: "Bio is required" }]}>
                  {({ value, onChange, errors, validationStatus }) => (
                    <div>
                      <label>Bio</label>
                      <textarea
                        className={`textarea ${validationStatus === 'error' ? 'textarea-invalid' : ''}`}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Tell us about yourself"
                      />
                      {errors.length > 0 && <div className="error">{errors.map(e => e.errorText).join(', ')}</div>}
                    </div>
                  )}
                </ProfileForm.Item>
                <ProfileForm.Item name="website" rules={[{ type: "regexp", pattern: /^https?:\/\//, message: "Must start with http:// or https://" }]}>
                  {({ value, onChange, errors, validationStatus }) => (
                    <div>
                      <label>Website</label>
                      <input
                        className={`input ${validationStatus === 'error' ? 'input-invalid' : ''}`}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="https://example.com"
                      />
                      {errors.length > 0 && <div className="error">{errors.map(e => e.errorText).join(', ')}</div>}
                    </div>
                  )}
                </ProfileForm.Item>
              </div>
            </ProfileForm>
          </fieldset>

          <div className="btn-group">
            <button className="btn" type="button" onClick={() => MainForm.formApi.submit()}>
              Submit
            </button>
            <button className="btn btn-secondary" type="button" onClick={() => {
              MainForm.formApi.resetFields();
              ProfileForm.formApi.resetFields();
            }}>
              Reset All
            </button>
          </div>
        </div>
      </MainForm>
    );
  },
};

export default meta;
