/* eslint-disable react-hooks/rules-of-hooks */
import { Meta, StoryObj } from "@storybook/react-vite";
import { createForm } from "../src";
import { Form } from "../src/Form";
import { withNestedForms } from "../src/addons/nestedForm";
import "./stories.css";

const meta: Meta<typeof Form> = {
  component: Form,
  parameters: {
    docsOnly: true,
  },
};

export default meta;

export const UserAndAddressExample: StoryObj<typeof Form> = {
  tags: ["!dev", "!autodocs"],
  render: () => {
    // Create separate form instances
    const UserForm = createForm({
      name: "",
      email: "",
    });

    const AddressForm = createForm({
      street: "",
      city: "",
      zipCode: "",
    });

    // Compose nested forms together
    const MyForm = createForm(
      {},
      withNestedForms({
        user: UserForm,
        address: AddressForm,
      }),
    );

    function UserSection() {
      return (
        <div className="form-section">
          <h3>User Info</h3>
          <UserForm.Item name="name" rules={[{ required: true, message: "Name is required" }]}>
            {({ value, onChange, errors, validationStatus }) => (
              <div>
                <label>Name</label>
                <input
                  className={`input ${validationStatus === "error" ? "input-invalid" : ""}`}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                />
                {errors[0] && <div className="error">{errors[0].errorText}</div>}
              </div>
            )}
          </UserForm.Item>
          <UserForm.Item name="email" rules={[{ required: true, message: "Email is required" }, { type: "email", message: "Invalid email" }]}>
            {({ value, onChange, errors, validationStatus }) => (
              <div>
                <label>Email</label>
                <input
                  className={`input ${validationStatus === "error" ? "input-invalid" : ""}`}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                />
                {errors[0] && <div className="error">{errors[0].errorText}</div>}
              </div>
            )}
          </UserForm.Item>
        </div>
      );
    }

    function AddressSection() {
      return (
        <div className="form-section">
          <h3>Address</h3>
          <AddressForm.Item name="street" rules={[{ required: true, message: "Street is required" }]}>
            {({ value, onChange, errors, validationStatus }) => (
              <div>
                <label>Street</label>
                <input
                  className={`input ${validationStatus === "error" ? "input-invalid" : ""}`}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                />
                {errors[0] && <div className="error">{errors[0].errorText}</div>}
              </div>
            )}
          </AddressForm.Item>
          <AddressForm.Item name="city" rules={[{ required: true, message: "City is required" }]}>
            {({ value, onChange, errors, validationStatus }) => (
              <div>
                <label>City</label>
                <input
                  className={`input ${validationStatus === "error" ? "input-invalid" : ""}`}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                />
                {errors[0] && <div className="error">{errors[0].errorText}</div>}
              </div>
            )}
          </AddressForm.Item>
          <AddressForm.Item name="zipCode">
            {({ value, onChange }) => (
              <div>
                <label>Zip Code (optional)</label>
                <input
                  className="input"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                />
              </div>
            )}
          </AddressForm.Item>
        </div>
      );
    }

    return (
      <MyForm
        onSubmit={(state) => {
          alert(JSON.stringify(state, undefined, 2));
        }}
      >
        <div className="form">
          <UserForm>
            <UserSection />
          </UserForm>
          <AddressForm>
            <AddressSection />
          </AddressForm>
          <button className="btn" type="button" onClick={() => MyForm.formApi.submit()}>
            Submit
          </button>
        </div>
      </MyForm>
    );
  },
};

export const NestedFormExample: StoryObj<typeof Form> = {
  tags: ["!dev", "!autodocs"],
  render: () => {
    // ContactForm is a standalone form that can be used independently
    // or embedded as a nested form inside another form.
    const ContactForm = createForm({
      firstName: "",
      lastName: "",
      email: "",
    });

    // OrderForm embeds ContactForm as a nested form under the "contact" key.
    // On submit, the resulting state will be:
    // { orderId: "", contact: { firstName: "", lastName: "", email: "" } }
    const OrderForm = createForm(
      { orderId: "" },
      withNestedForms({ contact: ContactForm }),
    );

    return (
      <OrderForm
        onSubmit={(state) => {
          console.log(state.orderId, state.contact);
          alert(JSON.stringify(state, undefined, 2));
        }}
      >
        <div className="form">
          <h3>Order</h3>

          <OrderForm.Item
            name="orderId"
            rules={[{ required: true, message: "Order ID is required" }]}
          >
            {({ value, onChange, errors, validationStatus }) => (
              <div>
                <label>Order ID</label>
                <input
                  className={`input ${validationStatus === "error" ? "input-invalid" : ""}`}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="ORD-001"
                />
                {errors.length > 0 && (
                  <div className="error">
                    {errors.map((e) => e.errorText).join(", ")}
                  </div>
                )}
              </div>
            )}
          </OrderForm.Item>

          <h3>Contact</h3>

          {/* Nested form fields must be rendered inside their own form provider */}
          <ContactForm>
            <ContactForm.Item
              name="firstName"
              rules={[{ required: true, message: "First name is required" }]}
            >
              {({ value, onChange, errors, validationStatus }) => (
                <div>
                  <label>First name</label>
                  <input
                    className={`input ${validationStatus === "error" ? "input-invalid" : ""}`}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="John"
                  />
                  {errors.length > 0 && (
                    <div className="error">
                      {errors.map((e) => e.errorText).join(", ")}
                    </div>
                  )}
                </div>
              )}
            </ContactForm.Item>

            <ContactForm.Item
              name="lastName"
              rules={[{ required: true, message: "Last name is required" }]}
            >
              {({ value, onChange, errors, validationStatus }) => (
                <div>
                  <label>Last name</label>
                  <input
                    className={`input ${validationStatus === "error" ? "input-invalid" : ""}`}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Doe"
                  />
                  {errors.length > 0 && (
                    <div className="error">
                      {errors.map((e) => e.errorText).join(", ")}
                    </div>
                  )}
                </div>
              )}
            </ContactForm.Item>

            <ContactForm.Item
              name="email"
              rules={[
                { required: true, message: "Email is required" },
                { type: "email", message: "Enter a valid email" },
              ]}
            >
              {({ value, onChange, errors, validationStatus }) => (
                <div>
                  <label>Email</label>
                  <input
                    className={`input ${validationStatus === "error" ? "input-invalid" : ""}`}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="john@example.com"
                  />
                  {errors.length > 0 && (
                    <div className="error">
                      {errors.map((e) => e.errorText).join(", ")}
                    </div>
                  )}
                </div>
              )}
            </ContactForm.Item>
          </ContactForm>

          <button
            className="btn"
            type="button"
            onClick={() => OrderForm.formApi.submit()}
          >
            Submit
          </button>
        </div>
      </OrderForm>
    );
  },
};
