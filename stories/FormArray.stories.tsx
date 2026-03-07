import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "@/useForm";
import { Form } from "@/Form";

const meta: Meta<typeof Form> = {
  component: Form,
};

export const ArrayExample: StoryObj<typeof Form> = {
  // tags: ["!dev", "!autodocs"],
  render: () => {
    const MyForm = useForm({
      tags: ["react", "form"],
    });

    return (
      <MyForm onSubmit={(state) => {
        alert(JSON.stringify(state, undefined, 2))
      }}>
        <div className="flex flex-col gap-4 p-4 max-w-sm">
          <MyForm.ArrayItem
            name="tags"
            rules={[
              { type: "array", min: 2, message: "Минимум 2 тега" },
              { type: "array", max: 5, message: "Максимум 5 тегов" },
            ]}
            itemRules={[
              { type: "string", min: 2, message: "Тег минимум 2 символа", validateTrigger: ['onChange', 'onFinish'] },
            ]}
          >
            {({ items, append, remove, errors }) => (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Tags</label>
                <div className="flex flex-wrap gap-1">
                  {items.map(({ value: tag, index, errors: itemErrors }) => (
                    <div key={index} className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-sm">
                        {tag}
                        <button type="button" onClick={() => remove(index)} className="text-gray-400 hover:text-gray-700">×</button>
                      </span>
                      {itemErrors.length > 0 && (
                        <span className="text-red-500 text-xs">
                          {itemErrors.map((e) => e.errorText).join(", ")}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <input
                  className="border rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="Add tag, press Enter..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      if (input.value.trim()) {
                        append(input.value.trim());
                        input.value = "";
                      }
                    }
                  }}
                />
                {errors.length > 0 && (
                  <span className="text-red-500 text-xs">{errors.map((e) => e.errorText).join(", ")}</span>
                )}
              </div>
            )}
          </MyForm.ArrayItem>
          <button
            className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            type="button"
            onClick={() => MyForm.formApi.submit()}
          >
            Submit
          </button>
        </div>
      </MyForm>
    );
  },
};

export default meta;
