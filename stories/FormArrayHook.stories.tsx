import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "@/useForm";
import { Form } from "@/Form";
import "./stories.css";

const meta: Meta<typeof Form> = {
  component: Form,
};

export const ArrayHookExample: StoryObj<typeof Form> = {
  tags: ["!dev", "!autodocs"],
  render: () => {
    const MyForm = useForm({
      items: ["item1", "item2"],
    });

    const { value, append, remove, update } = MyForm.useArrayField("items");

    return (
      <MyForm>
        <div className="form">
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
                      onClick={() => update(index, prompt("Update item:", item) || item)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-small"
                      onClick={() => remove(index)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn"
              onClick={() => append(`item${value.length + 1}`)}
            >
              Add Item
            </button>
          </div>
          <button className="btn" type="button" onClick={() => MyForm.formApi.submit()}>
            Submit
          </button>
        </div>
      </MyForm>
    );
  },
};

export default meta;
