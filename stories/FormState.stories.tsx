/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "@/useForm";
import { Form } from "@/Form";
import { withFormState } from "@/addons/formState";
import "./stories.css";

const meta: Meta<typeof Form> = {
  component: Form,
  title: "Examples/Form State",
};

export default meta;

/**
 * `useFormState()` gives a reactive snapshot of the whole form:
 * dirty state, touched fields, submit progress, and overall validity.
 * The Submit button is disabled until the form is dirty, valid, and not already submitting.
 */
export const UseFormState: StoryObj<typeof Form> = {
  tags: ["!dev", "!autodocs"],
  render: () => {
    const MyForm = useForm(
      { name: "", email: "" },
      withFormState(),
    );

    const { isDirty, dirtyFields, touchedFields, isSubmitting, isValid } =
      MyForm.useFormState();

    return (
      <MyForm
        onSubmit={() =>
          new Promise((resolve) => setTimeout(resolve, 1500))
        }
      >
        <div className="form">
          <MyForm.Item
            name="name"
            rules={[{ required: true, message: "Name is required" }]}
            validateTrigger="onChange"
          >
            {({ value, onChange, errors }) => (
              <div className="form-item">
                <label>Name</label>
                <input
                  className={`input${errors.length ? " input-invalid" : ""}`}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                />
                {errors[0] && (
                  <div className="error">{errors[0].errorText}</div>
                )}
              </div>
            )}
          </MyForm.Item>

          <MyForm.Item
            name="email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Invalid email" },
            ]}
            validateTrigger="onChange"
          >
            {({ value, onChange, errors }) => (
              <div className="form-item">
                <label>Email</label>
                <input
                  className={`input${errors.length ? " input-invalid" : ""}`}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                />
                {errors[0] && (
                  <div className="error">{errors[0].errorText}</div>
                )}
              </div>
            )}
          </MyForm.Item>

          <button
            className="btn"
            type="submit"
            disabled={!isDirty || !isValid || isSubmitting}
          >
            {isSubmitting ? "Saving…" : "Save"}
          </button>

          <div className="status">
            <div>isDirty: {String(isDirty)}</div>
            <div>isValid: {String(isValid)}</div>
            <div>isSubmitting: {String(isSubmitting)}</div>
            <div>dirtyFields: [{dirtyFields.join(", ")}]</div>
            <div>touchedFields: [{touchedFields.join(", ")}]</div>
          </div>
        </div>
      </MyForm>
    );
  },
};

/**
 * `useFieldState(field)` provides per-field metadata without re-rendering
 * when other fields change. Useful for showing inline hints like "(modified)"
 * or suppressing error display until the field has been touched.
 */
export const UseFieldState: StoryObj<typeof Form> = {
  tags: ["!dev", "!autodocs"],
  render: () => {
    const MyForm = useForm(
      { username: "", password: "" },
      withFormState(),
    );

    return (
      <MyForm>
        <div className="form">
          <FieldRow form={MyForm} fieldName="username" label="Username" />
          <FieldRow form={MyForm} fieldName="password" label="Password" type="password" />
        </div>
      </MyForm>
    );
  },
};

function FieldRow({
  form,
  fieldName,
  label,
  type = "text",
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  fieldName: "username" | "password";
  label: string;
  type?: string;
}) {
  const MyForm = form;
  const { isTouched, isDirty, isValid } = MyForm.useFieldState(fieldName);

  return (
    <MyForm.Item
      name={fieldName}
      rules={[{ required: true, message: `${label} is required` }]}
      validateTrigger="onChange"
    >
      {({ value, onChange, errors }: { value: string; onChange: (v: string) => void; errors: { errorText: string }[] }) => (
        <div className="form-item">
          <label>
            {label}
            {isDirty && <span className="status"> (modified)</span>}
          </label>
          <input
            className={`input${isTouched && !isValid ? " input-invalid" : ""}`}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          {isTouched && errors[0] && (
            <div className="error">{errors[0].errorText}</div>
          )}
          <div className="status">
            isTouched: {String(isTouched)} · isDirty: {String(isDirty)} · isValid: {String(isValid)}
          </div>
        </div>
      )}
    </MyForm.Item>
  );
}
