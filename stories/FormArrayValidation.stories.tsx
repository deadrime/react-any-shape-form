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
            {({ items }) => (
              <div className="form-item">
                <label>Email Addresses</label>
                <div className="array-list">
                  {items.map((item, index) => (
                    <div key={index} className="array-item">
                      <div className="array-item-input">
                        <input
                          className={`input ${item.errors.length > 0 ? "input-invalid" : ""}`}
                          value={item.value}
                          onChange={(e) => item.onChange(e.target.value)}
                        />
                        {item.errors.length > 0 && (
                          <div className="error">{item.errors.map(err => err.errorText).join(', ')}</div>
                        )}
                      </div>
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
            {({ items }) => (
              <div className="form-item">
                <label>Tags (validate on change)</label>
                <div className="array-list">
                  {items.map((item, index) => (
                    <div key={index} className="array-item">
                      <div className="array-item-input">
                        <input
                          className={`input ${item.errors.length > 0 ? "input-invalid" : ""}`}
                          value={item.value}
                          onChange={(e) => item.onChange(e.target.value)}
                          placeholder="Enter tag"
                        />
                        {item.errors.length > 0 && (
                          <div className="error">{item.errors.map(err => err.errorText).join(', ')}</div>
                        )}
                      </div>
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
