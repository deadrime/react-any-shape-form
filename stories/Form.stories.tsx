/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "@/useForm";
import { Form } from "@/Form";
import "./stories.css";

const meta: Meta<typeof Form> = {
  title: 'Examples/Basics',
  component: Form,
  args: {
    initialState: {
      name: "Name",
    },
    id: "myForm",
    onSubmit: (fields) => {
      alert(JSON.stringify(fields, undefined, 2));
    },
  },
  argTypes: {
    form: {
      control: false,
      description:
        "Optional FormApi instance. If not provided, a new instance will be created internally.",
    },
    initialState: {
      control: "object",
      description:
        "Initial values for form fields. Can be updated to reset the form to these values.",
    },
    children: {
      control: false,
      description:
        "Form fields and other React elements to render inside the form.",
    },
    onSubmit: {
      control: false,
      description:
        "Callback fired after successful form submission and validation. Receives the form state as an argument.",
    },
    onFieldChange: {
      control: false,
      description:
        "Callback fired when any field value changes. Receives the field name and new value as arguments.",
    },
    id: {
      control: "text",
      description: "HTML form element id attribute.",
    },
  },
};

export const BaseExample: StoryObj<typeof Form> = {
  tags: ["!dev", "!autodocs"],
  render: () => {
    const MyForm = useForm({
      name: "",
      age: 0,
    });

    return (
      <MyForm
        onSubmit={(state) => {
          alert(JSON.stringify(state, undefined, 2));
        }}
      >
        <div className="form">
          <MyForm.Item
            name="name"
            rules={[
              {
                required: true,
                message: "Name is required!",
              },
            ]}
          >
            {({ value, onChange, errors, validationStatus }) => (
              <div>
                <label>Name</label>
                <input
                  className={`input ${validationStatus === "error" ? "input-invalid" : ""}`}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="Name"
                />
                {errors.length > 0 && (
                  <div className="error">
                    {errors.map((e) => e.errorText).join(", ")}
                  </div>
                )}
              </div>
            )}
          </MyForm.Item>
          <MyForm.Item name="age">
            {({ value, onChange, errors, validationStatus }) => (
              <div>
                <label>Age</label>
                <input
                  className={`input ${validationStatus === "error" ? "input-invalid" : ""}`}
                  type="number"
                  value={value}
                  onChange={(e) => onChange(+e.target.value)}
                  placeholder="Age"
                />
                {errors.length > 0 && (
                  <div className="error">
                    {errors.map((e) => e.errorText).join(", ")}
                  </div>
                )}
              </div>
            )}
          </MyForm.Item>
          <button
            className="btn"
            type="button"
            onClick={() => MyForm.formApi.submit()}
          >
            Submit
          </button>
        </div>
      </MyForm>
    );
  },
};

export default meta;
