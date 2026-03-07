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
          <MyForm.ArrayItem
            name="usernames"
            itemRules={[
              { required: true, message: "Username is required!" },
              {
                validator: async (value: string) => {
                  const isAvailable = await checkUsernameAvailability(value);
                  if (!isAvailable) {
                    throw new Error("Username is already taken!");
                  }
                },
              },
            ]}
          >
            {({ items }) => (
              <div className="form-item">
                <label>Usernames (async validation)</label>
                <div className="array-list">
                  {items.map((item, index) => (
                    <div key={index} className="array-item">
                      <div className="array-item-input">
                        <input
                          className={`input ${item.validationStatus === "validating" ? "input-validating" : ""} ${item.validationStatus === "error" ? "input-invalid" : ""} ${item.validationStatus === "success" ? "input-success" : ""}`}
                          value={item.value}
                          onChange={(e) => item.onChange(e.target.value)}
                          placeholder="Username"
                        />
                        {item.validationStatus === "validating" && (
                          <div className="validating">Checking...</div>
                        )}
                        {item.errors.length > 0 && (
                          <div className="error">{item.errors[0].errorText}</div>
                        )}
                      </div>
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
