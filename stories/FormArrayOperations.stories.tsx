import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "@/useForm";
import { Form } from "@/Form";
import { withArrayFields } from "@/addons/array";
import "./stories.css";

const meta: Meta<typeof Form> = {
  component: Form,
};

export const ArrayOperationsExample: StoryObj<typeof Form> = {
  tags: ["!dev", "!autodocs"],
  render: () => {
    const MyForm = useForm(
      { items: ["First", "Second", "Third"] },
      withArrayFields(),
    );

    const { append, prepend, remove, move } = MyForm.useArrayField("items");

    return (
      <MyForm>
        <div className="form">
          <MyForm.ArrayItem name="items">
            {({ value }) => (
              <div className="form-item">
                <label>Items</label>
                <div className="array-list">
                  {value.map((item, index) => (
                    <div key={index} className="array-item">
                      <span>{item}</span>
                      <div className="array-actions">
                        <button
                          type="button"
                          className="btn-small"
                          onClick={() => move(index, index - 1)}
                          disabled={index === 0}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="btn-small"
                          onClick={() => move(index, index + 1)}
                          disabled={index === value.length - 1}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className="btn-small"
                          onClick={() => remove(index)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="button-group">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => append("New Item")}
                  >
                    Append
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => prepend("New Item")}
                  >
                    Prepend
                  </button>
                </div>
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
