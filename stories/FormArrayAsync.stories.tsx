import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "@/useForm";
import { Form } from "@/Form";
import "./stories.css";

const meta: Meta<typeof Form> = {
  component: Form,
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  await delay(1000);
  const takenUsernames = ["admin", "root", "test"];
  return !takenUsernames.includes(username.toLowerCase());
};

export const ArrayItemAsyncValidationExample: StoryObj<typeof Form> = {
  tags: ["!dev", "!autodocs"],
  render: () => {
    const MyForm = useForm({
      usernames: ["john", "admin"],
    });

    const { append, remove } = MyForm.useArrayField("usernames");

    return (
      <MyForm>
        <div className="form">
          <MyForm.ArrayItem name="usernames">
            {({ fields }) => (
              <div className="form-item">
                <label>Usernames (async validation)</label>
                <div className="array-list">
                  {fields.map((_username, index) => (
                    <div key={index} className="array-item">
                      <MyForm.Item
                        name={["usernames", index]}
                        rules={[
                          { required: true, message: "Username is required!" },
                          {
                            validator: async (value) => {
                              const isAvailable = await checkUsernameAvailability(value);
                              if (!isAvailable) {
                                throw new Error("Username is already taken!");
                              }
                              return true;
                            },
                          },
                        ]}
                      >
                        {({ value: itemValue, onChange, errors, validationStatus }) => (
                          <div className="array-item-input">
                            <input
                              className={`input ${validationStatus === "validating" ? "input-validating" : ""} ${validationStatus === "error" ? "input-invalid" : ""} ${validationStatus === "success" ? "input-success" : ""}`}
                              value={itemValue}
                              onChange={(e) => onChange(e.target.value)}
                              placeholder="Username"
                            />
                            {validationStatus === "validating" && (
                              <div className="validating">Checking...</div>
                            )}
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
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn"
                  onClick={() => append("")}
                >
                  Add Username
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
