import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "@/useForm";
import { Form } from "@/Form";
import "./stories.css";

const meta: Meta<typeof Form> = {
  component: Form,
};

export const StylesExample: StoryObj<typeof Form> = {
  tags: ["!dev", "!autodocs"],
  render: () => {
    const MyForm = useForm({
      name: "",
      bio: "",
    });

    return (
      <MyForm>
        <div className="form">
          <MyForm.Item
            name="name"
            rules={[{ required: true }]}
          >
            {({ value, onChange, errors, validationStatus }) => (
              <div className="form-item">
                <label>Name</label>
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
          <MyForm.Item
            name="bio"
            rules={[{ required: true }]}
          >
            {({ value, onChange, errors, validationStatus }) => (
              <div className="form-item">
                <label>Bio</label>
                <textarea
                  className={`input textarea ${validationStatus === "error" ? "input-invalid" : ""}`}
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
