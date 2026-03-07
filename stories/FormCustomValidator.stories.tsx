import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "@/useForm";
import { Form } from "@/Form";
import "./stories.css";

const meta: Meta<typeof Form> = {
  component: Form,
};

export const CustomValidatorExample: StoryObj<typeof Form> = {
  tags: ["!dev", "!autodocs"],
  render: () => {
    const MyForm = useForm({
      password: "",
      confirmPassword: "",
    });

    return (
      <MyForm>
        <div className="form">
          <MyForm.Item
            name="password"
            rules={[
              {
                required: true,
                message: "Password is required!",
              },
              {
                min: 8,
                type: 'string',
                message: "Password must be at least 8 characters!",
              },
            ]}
          >
            {({ value, onChange, errors, validationStatus }) => (
              <div className="form-item">
                <label>Password</label>
                <input
                  type="password"
                  className={`input ${validationStatus === "error" ? "input-invalid" : ""}`}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                />
                {errors.length > 0 && (
                  <div className="error">{errors[0].errorText}</div>
                )}
              </div>
            )}
          </MyForm.Item>
          <MyForm.Item
            name="confirmPassword"
            rules={[
              {
                required: true,
                message: "Please confirm your password!",
              },
              {
                validator: async (value) => {
                  const password = MyForm.useWatch("password");
                  if (value !== password) {
                    throw new Error("Passwords do not match!");
                  }
                },
              },
            ]}
          >
            {({ value, onChange, errors, validationStatus }) => (
              <div className="form-item">
                <label>Confirm Password</label>
                <input
                  type="password"
                  className={`input ${validationStatus === "error" ? "input-invalid" : ""}`}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                />
                {errors.length > 0 && (
                  <div className="error">{errors[0].errorText}</div>
                )}
              </div>
            )}
          </MyForm.Item>
          <button className="btn" type="button" onClick={() => MyForm.formApi.submit()}>
            Submit
          </button>
        </div>
      </MyForm>
    );
  },
};

export default meta;
