import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "@/useForm";
import { Form } from "@/Form";
import "./stories.css";

const meta: Meta<typeof Form> = {
  component: Form,
  title: 'Examples/Form API'
};

export const UsingFormApi: StoryObj<typeof Form> = {
  tags: ["!dev", "!autodocs"],
  render: () => {
    const MyForm = useForm({
      name: "John",
      age: 30,
    });

    return (
      <MyForm onSubmit={(values) => {
        alert(JSON.stringify(values, undefined, 2))
      }}>
        <div className="form">
          <MyForm.Item name="name">
            {({ value, onChange }) => (
              <div className="form-item">
                <label>Name</label>
                <input
                  className="input"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                />
              </div>
            )}
          </MyForm.Item>
          <MyForm.Item name="age">
            {({ value, onChange }) => (
              <div className="form-item">
                <label>Age</label>
                <input
                  className="input"
                  type="number"
                  value={value}
                  onChange={(e) => onChange(+e.target.value)}
                />
              </div>
            )}
          </MyForm.Item>
          <div className="button-group">
            <button
              className="btn"
              type="button"
              onClick={() => {
                alert(`Current name: ${MyForm.formApi.getFieldValue("name")}`);
              }}
            >
              Get Name
            </button>
            <button
              className="btn"
              type="button"
              onClick={() => {
                MyForm.formApi.setFieldValue("name", "Jane");
              }}
            >
              Set Name to Jane
            </button>
            <button
              className="btn"
              type="button"
              onClick={() => {
                alert(JSON.stringify(MyForm.formApi.getState(), null, 2));
              }}
            >
              Get Full State
            </button>
            <button
              className="btn"
              type="button"
              onClick={() => {
                MyForm.formApi.setFieldsValue({ name: "John", age: 30 });
              }}
            >
              Reset Values
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
