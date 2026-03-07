import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "@/useForm";
import { Form } from "@/Form";
import "./stories.css";

const meta: Meta<typeof Form> = {
  component: Form,
};

export const UseWatchExample: StoryObj<typeof Form> = {
  tags: ["!dev", "!autodocs"],
  render: () => {
    const MyForm = useForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    });

    const firstName = MyForm.useWatch("firstName");
    const lastName = MyForm.useWatch("lastName");
    const fullName = `${firstName || ""} ${lastName || ""}`.trim();

    return (
      <MyForm>
        <div className="form">
          <MyForm.Item name="firstName">
            {({ value, onChange }) => (
              <div className="form-item">
                <label>First Name</label>
                <input
                  className="input"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                />
              </div>
            )}
          </MyForm.Item>
          <MyForm.Item name="lastName">
            {({ value, onChange }) => (
              <div className="form-item">
                <label>Last Name</label>
                <input
                  className="input"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                />
              </div>
            )}
          </MyForm.Item>
          <div className="form-item">
            <label>Full Name (computed):</label>
            <div className="input" style={{ background: "#f5f5f5", minHeight: "38px" }}>
              {fullName || "-"}
            </div>
          </div>
          <MyForm.Item
            name="email"
            rules={[{ required: true, type: "email" }]}
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
          <MyForm.Item
            name="phone"
            rules={[{ required: true }]}
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
          <button className="btn" type="button" onClick={() => MyForm.formApi.submit()}>
            Submit
          </button>
        </div>
      </MyForm>
    );
  },
};

export default meta;
