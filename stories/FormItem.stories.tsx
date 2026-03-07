/* eslint-disable @typescript-eslint/no-explicit-any */
import { Meta, StoryObj } from "@storybook/react-vite";
import { Form, FormItem } from "../src";

const meta: Meta<typeof FormItem> = {
  component: FormItem,
  tags: ["!dev", "!autodocs"],
  parameters: {
    docsOnly: true,
  },
  render: (props) => (
    <Form>
      <FormItem {...props} />
    </Form>
  ),
  args: {
    name: "field",
    rules: [
      {
        required: true,
      },
    ],
  },
  argTypes: {
    children: {
      control: false,
      description:
        "Render function that receives field props (value, onChange, validationStatus, errors, id) and returns React elements to render.",
    },
    name: {
      control: "text",
      description:
        "Field name that identifies this field in the form state. Must be unique within the form.",
    },
    rules: {
      control: "object",
      description:
        "Array of validation rules to apply to this field. Supports built-in validators (required, min, max, pattern, email) and custom async validators.",
    },
    onChange: {
      control: false,
      description:
        "Optional callback fired when the field value changes. Receives the new value as an argument. Note: Usually not needed - prefer using the render function for accessing field state.",
    },
    onInvalid: {
      control: false,
      description:
        "Optional callback fired when field validation fails. Receives validation errors array and current field value as arguments.",
    },
    validationDebounceDelay: {
      control: "number",
      description:
        "Debounce delay in milliseconds for onChange validation. Default is 300ms. Only applies to rules with validateTrigger: ['onChange'].",
    },
  },
};

export const Props: StoryObj<typeof FormItem> = {};

export default meta;
