import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "@/useForm";
import { Form } from "@/Form";
import "./stories.css";

const meta: Meta<typeof Form> = {
  component: Form,
};

export const ConditionalRenderExample: StoryObj<typeof Form> = {
  tags: ["!dev", "!autodocs"],
  render: () => {
    const MyForm = useForm({
      useCustomValidation: false,
      email: "",
      phone: "",
    });

    return (
      <MyForm>
        <div className="form">
          <MyForm.Item name="useCustomValidation">
            {({ value, onChange }) => (
              <div className="form-item">
                <label>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => onChange(e.target.checked)}
                  />
                  Use Custom Validation
                </label>
              </div>
            )}
          </MyForm.Item>

          {MyForm.useWatch("useCustomValidation") && (
            <MyForm.Item
              name="email"
              rules={[
                {
                  required: true,
                  message: "Email is required!",
                },
                {
                  type: "regexp",
                  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email format!",
                },
              ]}
            >
              {({ value, onChange, errors, validationStatus }) => (
                <div className="form-item">
                  <label>Email</label>
                  <input
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
          )}

          {!MyForm.useWatch("useCustomValidation") && (
            <MyForm.Item
              name="phone"
              rules={[
                {
                  required: true,
                  message: "Phone is required!",
                },
              ]}
            >
              {({ value, onChange, errors, validationStatus }) => (
                <div className="form-item">
                  <label>Phone</label>
                  <input
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
          )}

          <button className="btn" type="button" onClick={() => MyForm.formApi.submit()}>
            Submit
          </button>
        </div>
      </MyForm>
    );
  },
};

export default meta;
