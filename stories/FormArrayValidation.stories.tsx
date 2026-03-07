import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "@/useForm";
import { Form } from "@/Form";
import "./stories.css";

const meta: Meta<typeof Form> = {
  component: Form,
};

export const ArrayItemValidationExample: StoryObj<typeof Form> = {
  tags: ["!dev", "!autodocs"],
  render: () => {
    const MyForm = useForm({
      emails: ["test@example.com", "invalid-email"],
    });

    const { append, remove } = MyForm.useArrayField("emails");

    return (
      <MyForm>
        <div className="form">
          <MyForm.ArrayItem
            name="emails"
            rules={[
              {
                required: true,
              },
              {
                type: "email",
              },
            ]}
          >
            {({ fields, onChange }) => (
              <div className="form-item">
                <label>Email Addresses</label>
                <div className="array-list">
                  {fields.map((email, index) => (
                    <div key={index} className="array-item">
                      <MyForm.Item name={["emails", index]}>
                        {({ value: itemValue, onChange: itemOnChange, errors }) => (
                          <div className="array-item-input">
                            <input
                              className={`input ${errors.length > 0 ? "input-invalid" : ""}`}
                              value={itemValue}
                              onChange={(e) => itemOnChange(e.target.value)}
                            />
                            {errors.length > 0 && (
                              <div className="error">{errors[0].errorText}</div>
                            )}
                          </div>
                        )}
                      </MyForm.Item>
                      <button
                        type="button"
                        className="btn-small"
                        onClick={() => remove(index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn"
                  onClick={() => append("")}
                >
                  Add Email
                </button>
              </div>
            )}
          </MyForm.ArrayItem>
          <button className="btn" type="button" onClick={() => MyForm.formApi.submit()}>
            Submit
          </button>
        </div>
      </MyForm>
    );
  },
};

export const ArrayWithOnChangeValidationExample: StoryObj<typeof Form> = {
  tags: ["!dev", "!autodocs"],
  render: () => {
    const MyForm = useForm({
      tags: ["react", "form"],
    });

    const { append, remove } = MyForm.useArrayField("tags");

    return (
      <MyForm>
        <div className="form">
          <MyForm.ArrayItem
            name="tags"
            itemRules={[
              {
                required: true,
                message: "Tag cannot be empty",
                validateTrigger: ["onChange"],
              },
              {
                type: "string",
                min: 2,
                max: 15,
                message: "Tag must be 2-15 characters",
                validateTrigger: ["onChange"],
              },
              {
                type: "regexp",
                pattern: /^[a-zA-Z0-9-]+$/,
                message: "Only alphanumeric and dashes allowed",
                validateTrigger: ["onChange"],
              },
            ]}
          >
            {({ fields }) => (
              <div className="form-item">
                <label>Tags (validate on change)</label>
                <div className="array-list">
                  {fields.map((tag, index) => (
                    <div key={index} className="array-item">
                      <MyForm.Item name={["tags", index]}>
                        {({ value: itemValue, onChange: itemOnChange, errors }) => (
                          <div className="array-item-input">
                            <input
                              className={`input ${errors.length > 0 ? "input-invalid" : ""}`}
                              value={itemValue}
                              onChange={(e) => itemOnChange(e.target.value)}
                              placeholder="Enter tag"
                            />
                            {errors.length > 0 && (
                              <div className="error">{errors[0].errorText}</div>
                            )}
                          </div>
                        )}
                      </MyForm.Item>
                      <button
                        type="button"
                        className="btn-small"
                        onClick={() => remove(index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn"
                  onClick={() => append("")}
                >
                  Add Tag
                </button>
              </div>
            )}
          </MyForm.ArrayItem>
          <button className="btn" type="button" onClick={() => MyForm.formApi.submit()}>
            Submit
          </button>
        </div>
      </MyForm>
    );
  },
};

export default meta;
