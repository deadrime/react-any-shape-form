import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "@/useForm";
import { Form } from "@/Form";
import "./stories.css";

const meta: Meta<typeof Form> = {
  component: Form,
};

export const TransformExample: StoryObj<typeof Form> = {
  tags: ["!dev", "!autodocs"],
  render: () => {
    const MyForm = useForm({
      email: "",
    });

    return (
      <MyForm>
        <div className="form">
          <MyForm.Item
            name="email"
            rules={[{ required: true, type: "email" }]}
            transform={(value) => value?.toLowerCase().trim()}
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
          <button className="btn" type="button" onClick={() => MyForm.formApi.submit()}>
            Submit
          </button>
        </div>
      </MyForm>
    );
  },
};

export default meta;
