/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef } from "react";
import { createForm } from "@/useForm";
import { Form } from "@/Form";
import { withArrayFields } from "@/addons/array/index.js";
import { withFormState } from "@/addons/formState/index.js";
import { FormApi } from "@/FormApi";
import "./stories.css";

const meta: Meta<typeof Form> = {
  title: "Examples/createForm",
  component: Form,
};

export default meta;

/**
 * Basic usage of the context-based `createForm` API.
 *
 * Unlike `createGlobalForm`, `createForm` declares only the state type.
 * The `FormApi` instance is created per `<MyForm.Form>` mount, so you can
 * render multiple independent instances of the same form on the page.
 */
export const BasicExample: StoryObj<typeof Form> = {
  tags: ["!dev", "!autodocs"],
  render: () => {
    const MyForm = createForm<{ name: string; age: number }>();

    return (
      <div className="form">
        <MyForm.Form
          initialState={{ name: "", age: 0 }}
          onSubmit={(state) => alert(JSON.stringify(state, null, 2))}
        >
          <MyForm.Item
            name="name"
            rules={[{ required: true, message: "Name is required" }]}
          >
            {({ value, onChange, errors, validationStatus }) => (
              <div className="form-item">
                <label>Name</label>
                <input
                  className={`input${validationStatus === "error" ? " input-invalid" : ""}`}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                />
                {errors[0] && <div className="error">{errors[0].errorText}</div>}
              </div>
            )}
          </MyForm.Item>

          <MyForm.Item
            name="age"
            rules={[{ required: true, message: "Age is required" }]}
          >
            {({ value, onChange, errors, validationStatus }) => (
              <div className="form-item">
                <label>Age</label>
                <input
                  type="number"
                  className={`input${validationStatus === "error" ? " input-invalid" : ""}`}
                  value={value}
                  onChange={(e) => onChange(Number(e.target.value))}
                />
                {errors[0] && <div className="error">{errors[0].errorText}</div>}
              </div>
            )}
          </MyForm.Item>

          {/* Submit via <Form.Submit> — cloneElement mode */}
          <MyForm.Submit>
            <button className="btn">Submit</button>
          </MyForm.Submit>
        </MyForm.Form>
      </div>
    );
  },
};

/**
 * Two independent instances of the same `createForm` declaration,
 * each with their own isolated state.
 */
export const MultipleInstances: StoryObj<typeof Form> = {
  tags: ["!dev", "!autodocs"],
  render: () => {
    const UserForm = createForm<{ name: string; email: string }>();

    return (
      <div style={{ display: "flex", gap: 32 }}>
        <div className="form">
          <h3>Form A</h3>
          <UserForm.Form
            initialState={{ name: "Alice", email: "" }}
            onSubmit={(s) => alert(`A: ${JSON.stringify(s)}`)}
          >
            <UserForm.Item name="name">
              {({ value, onChange }) => (
                <div className="form-item">
                  <label>Name</label>
                  <input className="input" value={value} onChange={(e) => onChange(e.target.value)} />
                </div>
              )}
            </UserForm.Item>
            <UserForm.Submit>
              <button className="btn">Submit A</button>
            </UserForm.Submit>
          </UserForm.Form>
        </div>

        <div className="form">
          <h3>Form B</h3>
          <UserForm.Form
            initialState={{ name: "Bob", email: "" }}
            onSubmit={(s) => alert(`B: ${JSON.stringify(s)}`)}
          >
            <UserForm.Item name="name">
              {({ value, onChange }) => (
                <div className="form-item">
                  <label>Name</label>
                  <input className="input" value={value} onChange={(e) => onChange(e.target.value)} />
                </div>
              )}
            </UserForm.Item>
            <UserForm.Submit>
              <button className="btn">Submit B</button>
            </UserForm.Submit>
          </UserForm.Form>
        </div>
      </div>
    );
  },
};

/**
 * Submit triggered programmatically via `ref`.
 */
export const RefSubmit: StoryObj<typeof Form> = {
  tags: ["!dev", "!autodocs"],
  render: () => {
    const MyForm = createForm<{ message: string }>();

    function Page() {
      const formRef = useRef<FormApi<{ message: string }>>(null);

      return (
        <div className="form">
          <MyForm.Form
            ref={formRef}
            initialState={{ message: "" }}
            onSubmit={(s) => alert(JSON.stringify(s))}
          >
            <MyForm.Item name="message" rules={[{ required: true, message: "Required" }]}>
              {({ value, onChange, errors, validationStatus }) => (
                <div className="form-item">
                  <label>Message</label>
                  <input
                    className={`input${validationStatus === "error" ? " input-invalid" : ""}`}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                  />
                  {errors[0] && <div className="error">{errors[0].errorText}</div>}
                </div>
              )}
            </MyForm.Item>
          </MyForm.Form>

          {/* Button lives outside <Form> — submits via ref */}
          <button className="btn" onClick={() => formRef.current?.submit().catch(() => {})}>
            Submit via ref
          </button>
        </div>
      );
    }

    return <Page />;
  },
};

/**
 * `<Form.Submit>` render prop mode — full control over the button UI.
 */
export const SubmitRenderProp: StoryObj<typeof Form> = {
  tags: ["!dev", "!autodocs"],
  render: () => {
    const MyForm = createForm<{ title: string }>().withAddons(withFormState());

    return (
      <div className="form">
        <MyForm.Form
          initialState={{ title: "" }}
          onSubmit={(s) => alert(JSON.stringify(s))}
        >
          <MyForm.Item name="title" rules={[{ required: true, message: "Title is required" }]}>
            {({ value, onChange, errors, validationStatus }) => (
              <div className="form-item">
                <label>Title</label>
                <input
                  className={`input${validationStatus === "error" ? " input-invalid" : ""}`}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                />
                {errors[0] && <div className="error">{errors[0].errorText}</div>}
              </div>
            )}
          </MyForm.Item>

          <MyForm.Submit>
            {({ submit }) => {
              const { isDirty, isSubmitting } = MyForm.useFormState();
              return (
                <button
                  className="btn"
                  onClick={submit}
                  disabled={!isDirty || isSubmitting}
                >
                  {isSubmitting ? "Saving…" : "Save"}
                </button>
              );
            }}
          </MyForm.Submit>
        </MyForm.Form>
      </div>
    );
  },
};

/**
 * `createForm` with `withArrayFields()` addon via `.withAddons()`.
 */
export const WithArrayFields: StoryObj<typeof Form> = {
  tags: ["!dev", "!autodocs"],
  render: () => {
    const MyForm = createForm<{ tags: string[] }>().withAddons(withArrayFields());

    return (
      <div className="form">
        <MyForm.Form
          initialState={{ tags: [] }}
          onSubmit={(s) => alert(JSON.stringify(s))}
        >
          <MyForm.ArrayItem
            name="tags"
            rules={[{ type: "array", min: 1, message: "Add at least one tag" }]}
          >
            {({ items, append, remove, errors }) => (
              <div className="form-item">
                <label>Tags</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                  {items.map(({ value, index }) => (
                    <span key={index} className="tag">
                      {value}
                      <button type="button" onClick={() => remove(index)}>×</button>
                    </span>
                  ))}
                </div>
                <input
                  className="input"
                  placeholder="Type and press Enter"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const el = e.target as HTMLInputElement;
                      if (el.value.trim()) { append(el.value.trim()); el.value = ""; }
                    }
                  }}
                />
                {errors[0] && <div className="error">{errors[0].errorText}</div>}
              </div>
            )}
          </MyForm.ArrayItem>

          <MyForm.Submit>
            <button className="btn">Submit</button>
          </MyForm.Submit>
        </MyForm.Form>
      </div>
    );
  },
};
