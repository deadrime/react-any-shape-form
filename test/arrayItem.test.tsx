import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { act, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createForm } from "../src/index";
import { useArrayField } from "../src/addons/array/FormArrayItem";
import { withArrayFields } from "../src/addons/array";
import React from "react";

describe("Form.ArrayItem tests", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic array operations", () => {
    const MyForm = createForm(
      { value: [] as string[] },
      withArrayFields(),
    );

    test("append adds item to the end", async () => {
      const { getByTestId } = render(
        <MyForm>
          <MyForm.ArrayItem name="value">
            {({ value, append }) => (
              <div>
                <div data-testid="value-count">{value.length}</div>
                <button
                  data-testid="add-btn"
                  onClick={() => append("new item")}
                >
                  Add
                </button>
              </div>
            )}
          </MyForm.ArrayItem>
        </MyForm>
      );

      expect(getByTestId("value-count").textContent).toBe("0");

      await userEvent.click(getByTestId("add-btn"));

      expect(getByTestId("value-count").textContent).toBe("1");
      expect(MyForm.formApi.getFieldValue("value")).toEqual(["new item"]);
    });

    test("prepend adds item to the beginning", async () => {
      MyForm.formApi.setFieldValue("value", ["second"]);

      const { getByTestId } = render(
        <MyForm>
          <MyForm.ArrayItem name="value">
            {({ value, prepend }) => (
              <div>
                <div data-testid="first-item">{value[0]}</div>
                <button
                  data-testid="prepend-btn"
                  onClick={() => prepend("first")}
                >
                  Prepend
                </button>
              </div>
            )}
          </MyForm.ArrayItem>
        </MyForm>
      );

      await userEvent.click(getByTestId("prepend-btn"));

      expect(getByTestId("first-item").textContent).toBe("first");
      expect(MyForm.formApi.getFieldValue("value")).toEqual(["first", "second"]);
    });

    test("remove deletes item by index", async () => {
      MyForm.formApi.setFieldValue("value", ["item1", "item2", "item3"]);

      const { getByTestId } = render(
        <MyForm>
          <MyForm.ArrayItem name="value">
            {({ value, remove }) => (
              <div>
                <div data-testid="value-count">{value.length}</div>
                <button
                  data-testid="remove-btn"
                  onClick={() => remove(1)}
                >
                  Remove middle
                </button>
              </div>
            )}
          </MyForm.ArrayItem>
        </MyForm>
      );

      await userEvent.click(getByTestId("remove-btn"));

      expect(getByTestId("value-count").textContent).toBe("2");
      expect(MyForm.formApi.getFieldValue("value")).toEqual(["item1", "item3"]);
    });

    test("update modifies item by index", async () => {
      MyForm.formApi.setFieldValue("value", ["old"]);

      const { getByTestId } = render(
        <MyForm>
          <MyForm.ArrayItem name="value">
            {({ value, update }) => (
              <div>
                <div data-testid="first-item">{value[0]}</div>
                <button
                  data-testid="update-btn"
                  onClick={() => update(0, "new")}
                >
                  Update
                </button>
              </div>
            )}
          </MyForm.ArrayItem>
        </MyForm>
      );

      await userEvent.click(getByTestId("update-btn"));

      expect(getByTestId("first-item").textContent).toBe("new");
      expect(MyForm.formApi.getFieldValue("value")).toEqual(["new"]);
    });

    test("update with callback function", async () => {
      MyForm.formApi.setFieldValue("value", ["hello"]);

      const { getByTestId } = render(
        <MyForm>
          <MyForm.ArrayItem name="value">
            {({ value, update }) => (
              <div>
                <div data-testid="first-item">{value[0]}</div>
                <button
                  data-testid="update-btn"
                  onClick={() => update(0, (prev) => prev + " world")}
                >
                  Update
                </button>
              </div>
            )}
          </MyForm.ArrayItem>
        </MyForm>
      );

      await userEvent.click(getByTestId("update-btn"));

      expect(getByTestId("first-item").textContent).toBe("hello world");
    });

    test("move reorders value", async () => {
      MyForm.formApi.setFieldValue("value", ["a", "b", "c"]);

      const { getByTestId } = render(
        <MyForm>
          <MyForm.ArrayItem name="value">
            {({ value, move }) => (
              <div>
                <div data-testid="value">{value.join(",")}</div>
                <button
                  data-testid="move-btn"
                  onClick={() => move(0, 2)}
                >
                  Move first to last
                </button>
              </div>
            )}
          </MyForm.ArrayItem>
        </MyForm>
      );

      await userEvent.click(getByTestId("move-btn"));

      const result = MyForm.formApi.getFieldValue("value");
      expect(result).toEqual(["b", "c", "a"]);
    });

    test("move from end to beginning", async () => {
      MyForm.formApi.setFieldValue("value", ["a", "b", "c"]);

      const { getByTestId } = render(
        <MyForm>
          <MyForm.ArrayItem name="value">
            {({ value, move }) => (
              <div>
                <div data-testid="value">{value.join(",")}</div>
                <button
                  data-testid="move-btn"
                  onClick={() => move(2, 0)}
                >
                  Move last to first
                </button>
              </div>
            )}
          </MyForm.ArrayItem>
        </MyForm>
      );

      await userEvent.click(getByTestId("move-btn"));

      expect(MyForm.formApi.getFieldValue("value")).toEqual(["c", "a", "b"]);
    });

    test("move to middle position", async () => {
      MyForm.formApi.setFieldValue("value", ["a", "b", "c", "d"]);

      const { getByTestId } = render(
        <MyForm>
          <MyForm.ArrayItem name="value">
            {({ value, move }) => (
              <div>
                <div data-testid="value">{value.join(",")}</div>
                <button
                  data-testid="move-btn"
                  onClick={() => move(3, 1)}
                >
                  Move last to second position
                </button>
              </div>
            )}
          </MyForm.ArrayItem>
        </MyForm>
      );

      await userEvent.click(getByTestId("move-btn"));

      expect(MyForm.formApi.getFieldValue("value")).toEqual(["a", "d", "b", "c"]);
    });

    test("move does not mutate original array", async () => {
      const originalArray = ["a", "b", "c"];
      MyForm.formApi.setFieldValue("value", originalArray);

      const { getByTestId } = render(
        <MyForm>
          <MyForm.ArrayItem name="value">
            {({ value, move }) => (
              <div>
                <div data-testid="value">{value.join(",")}</div>
                <button
                  data-testid="move-btn"
                  onClick={() => move(0, 2)}
                >
                  Move
                </button>
              </div>
            )}
          </MyForm.ArrayItem>
        </MyForm>
      );

      await userEvent.click(getByTestId("move-btn"));

      // Original array should not be mutated
      expect(originalArray).toEqual(["a", "b", "c"]);

      // Form value should be different
      const result = MyForm.formApi.getFieldValue("value");
      expect(result).toEqual(["b", "c", "a"]);
      expect(result).not.toBe(originalArray);
    });

    test("move with same from and to index", async () => {
      MyForm.formApi.setFieldValue("value", ["a", "b", "c"]);

      const { getByTestId } = render(
        <MyForm>
          <MyForm.ArrayItem name="value">
            {({ value, move }) => (
              <div>
                <div data-testid="value">{value.join(",")}</div>
                <button
                  data-testid="move-btn"
                  onClick={() => move(1, 1)}
                >
                  Move to same position
                </button>
              </div>
            )}
          </MyForm.ArrayItem>
        </MyForm>
      );

      await userEvent.click(getByTestId("move-btn"));

      // Array should remain unchanged
      expect(MyForm.formApi.getFieldValue("value")).toEqual(["a", "b", "c"]);
    });

    test("move triggers re-render with updated order", async () => {
      MyForm.formApi.setFieldValue("value", ["first", "second", "third"]);

      const { getByTestId } = render(
        <MyForm>
          <MyForm.ArrayItem name="value">
            {({ value, move }) => (
              <div>
                {value.map((item, index) => (
                  <div key={index} data-testid={`item-${index}`}>
                    {item}
                  </div>
                ))}
                <button
                  data-testid="move-btn"
                  onClick={() => move(0, 2)}
                >
                  Move
                </button>
              </div>
            )}
          </MyForm.ArrayItem>
        </MyForm>
      );

      expect(getByTestId("item-0").textContent).toBe("first");
      expect(getByTestId("item-1").textContent).toBe("second");
      expect(getByTestId("item-2").textContent).toBe("third");

      await userEvent.click(getByTestId("move-btn"));

      // UI should update to reflect new order
      expect(getByTestId("item-0").textContent).toBe("second");
      expect(getByTestId("item-1").textContent).toBe("third");
      expect(getByTestId("item-2").textContent).toBe("first");
    });
  });

  describe("Array validation (whole array)", () => {
    const MyForm = createForm(
      { tags: [] as string[] },
      withArrayFields(),
    );

    test("required array validation", async () => {
      const onErrorCb = vi.fn();

      const ErrorDisplay = () => {
        const { errors } = MyForm.useFieldErrors("tags");
        errors.forEach((e) => onErrorCb(e));
        return null;
      };

      const { getByTestId } = render(
        <MyForm>
          <MyForm.ArrayItem
            name="tags"
            rules={[
              {
                required: true,
                message: "At least one tag is required",
                validateTrigger: ["onFinish"],
              },
            ]}
          >
            {({ value, append }) => (
              <div>
                <div data-testid="value-count">{value.length}</div>
                <button data-testid="add-btn" onClick={() => append("tag")}>
                  Add
                </button>
              </div>
            )}
          </MyForm.ArrayItem>
          <ErrorDisplay />
          <button
            data-testid="submit-btn"
            onClick={() => MyForm.formApi.submit().catch(() => {})}
          >
            Submit
          </button>
        </MyForm>
      );

      await userEvent.click(getByTestId("submit-btn"));

      await waitFor(() => {
        expect(onErrorCb).toHaveBeenCalledWith(
          expect.objectContaining({ errorText: "At least one tag is required" })
        );
      });
    });

    test("array min validation", async () => {
      MyForm.formApi.setFieldValue("tags", ["tag1"]);
      const onErrorCb = vi.fn();

      const ErrorDisplay = () => {
        const { errors } = MyForm.useFieldErrors("tags");
        errors.forEach((e) => onErrorCb(e));
        return null;
      };

      const { getByTestId } = render(
        <MyForm>
          <MyForm.ArrayItem
            name="tags"
            rules={[
              {
                type: "array",
                min: 2,
                message: "At least 2 tags required",
                validateTrigger: ["onFinish"],
              },
            ]}
          >
            {({ value }) => <div data-testid="value-count">{value.length}</div>}
          </MyForm.ArrayItem>
          <ErrorDisplay />
          <button
            data-testid="submit-btn"
            onClick={() => MyForm.formApi.submit().catch(() => {})}
          >
            Submit
          </button>
        </MyForm>
      );

      await userEvent.click(getByTestId("submit-btn"));

      await waitFor(() => {
        expect(onErrorCb).toHaveBeenCalledWith(
          expect.objectContaining({ errorText: "At least 2 tags required" })
        );
      });
    });

    test("array max validation", async () => {
      MyForm.formApi.setFieldValue("tags", ["tag1", "tag2", "tag3", "tag4"]);
      const onErrorCb = vi.fn();

      const ErrorDisplay = () => {
        const { errors } = MyForm.useFieldErrors("tags");
        errors.forEach((e) => onErrorCb(e));
        return null;
      };

      const { getByTestId } = render(
        <MyForm>
          <MyForm.ArrayItem
            name="tags"
            rules={[
              {
                type: "array",
                max: 3,
                message: "Maximum 3 tags allowed",
                validateTrigger: ["onFinish"],
              },
            ]}
          >
            {({ value }) => <div data-testid="value-count">{value.length}</div>}
          </MyForm.ArrayItem>
          <ErrorDisplay />
          <button
            data-testid="submit-btn"
            onClick={() => MyForm.formApi.submit().catch(() => {})}
          >
            Submit
          </button>
        </MyForm>
      );

      await userEvent.click(getByTestId("submit-btn"));

      await waitFor(() => {
        expect(onErrorCb).toHaveBeenCalledWith(
          expect.objectContaining({ errorText: "Maximum 3 tags allowed" })
        );
      });
    });

    test("custom validator for whole array", async () => {
      MyForm.formApi.setFieldValue("tags", ["tag1", "tag1", "tag2"]);
      const onErrorCb = vi.fn();

      const ErrorDisplay = () => {
        const { errors } = MyForm.useFieldErrors("tags");
        errors.forEach((e) => onErrorCb(e));
        return null;
      };

      const { getByTestId } = render(
        <MyForm>
          <MyForm.ArrayItem
            name="tags"
            rules={[
              {
                validator: async (value) => {
                  const hasDuplicates = value.length !== new Set(value).size;
                  if (hasDuplicates) {
                    return Promise.reject("Duplicate tags not allowed");
                  }
                },
                validateTrigger: ["onFinish"],
              },
            ]}
          >
            {({ value }) => <div data-testid="value-count">{value.length}</div>}
          </MyForm.ArrayItem>
          <ErrorDisplay />
          <button
            data-testid="submit-btn"
            onClick={() => MyForm.formApi.submit().catch(() => {})}
          >
            Submit
          </button>
        </MyForm>
      );

      await userEvent.click(getByTestId("submit-btn"));

      await waitFor(() => {
        expect(onErrorCb).toHaveBeenCalledWith(
          expect.objectContaining({ errorText: "Duplicate tags not allowed" })
        );
      });
    });
  });

  describe("Array item validation (itemRules)", () => {
    const MyForm = createForm(
      { emails: [] as string[] },
      withArrayFields(),
    );

    beforeEach(() => {
      MyForm.formApi.resetFields();
    });

    test("itemRules validates each item individually", async () => {
      MyForm.formApi.setFieldValue("emails", ["valid@test.com", "", "invalid"]);

      const { getByTestId } = render(
        <MyForm>
          <MyForm.ArrayItem
            name="emails"
            itemRules={[
              {
                required: true,
                message: "Email is required",
              },
              {
                type: "email",
                message: "Invalid email format",
              },
            ]}
          >
            {({ value: _value, itemErrors }) => (
              <div>
                <div data-testid="error-count">{itemErrors.length}</div>
                {itemErrors.map((err) => (
                  <div key={err.index} data-testid={`error-${err.index}`}>
                    {err.errors.map((e) => e.errorText).join(", ")}
                  </div>
                ))}
              </div>
            )}
          </MyForm.ArrayItem>
          <button
            data-testid="submit-btn"
            onClick={() => MyForm.formApi.submit().catch(() => {})}
          >
            Submit
          </button>
        </MyForm>
      );

      await userEvent.click(getByTestId("submit-btn"));

      await waitFor(() => {
        // Should have errors for index 1 (empty) and index 2 (invalid)
        expect(getByTestId("error-count").textContent).toBe("2");
      });
    });

    test("itemErrors updates on value change", async () => {
      MyForm.formApi.setFieldValue("emails", [""]);

      const { getByTestId } = render(
        <MyForm>
          <MyForm.ArrayItem
            name="emails"
            itemRules={[
              {
                required: true,
                message: "Email is required",
                validateTrigger: ["onChange"],
              },
            ]}
          >
            {({ value, update, itemErrors }) => (
              <div>
                <input
                  data-testid="email-input"
                  value={value[0] || ""}
                  onChange={(e) => update(0, e.target.value)}
                />
                <div data-testid="has-error">{itemErrors.length > 0 ? "yes" : "no"}</div>
              </div>
            )}
          </MyForm.ArrayItem>
        </MyForm>
      );

      const input = getByTestId("email-input");

      // Type a valid email
      await userEvent.type(input, "test@example.com");

      await waitFor(() => {
        expect(getByTestId("has-error").textContent).toBe("no");
      });
    });

    test("itemRules with email validation", async () => {
      MyForm.formApi.setFieldValue("emails", ["not-an-email"]);

      const { getByTestId } = render(
        <MyForm>
          <MyForm.ArrayItem
            name="emails"
            itemRules={[
              {
                type: "email",
                message: "Invalid email",
              },
            ]}
          >
            {({ itemErrors }) => (
              <div>
                {itemErrors.length > 0 && (
                  <div data-testid="error-message">
                    {itemErrors[0].errors[0].errorText}
                  </div>
                )}
              </div>
            )}
          </MyForm.ArrayItem>
          <button
            data-testid="submit-btn"
            onClick={() => MyForm.formApi.submit().catch(() => {})}
          >
            Submit
          </button>
        </MyForm>
      );

      await userEvent.click(getByTestId("submit-btn"));

      await waitFor(() => {
        expect(getByTestId("error-message").textContent).toBe("Invalid email");
      });
    });

    test("itemRules with min/max length", async () => {
      const MyForm = createForm(
        { tags: [] as string[] },
        withArrayFields(),
      );

      MyForm.formApi.setFieldValue("tags", ["ab", "valid-tag", "this-tag-is-way-too-long-to-be-valid"]);

      const { getByTestId } = render(
        <MyForm>
          <MyForm.ArrayItem
            name="tags"
            itemRules={[
              {
                type: "string",
                min: 3,
                message: "Min 3 characters",
                validateTrigger: ["onFinish"],
              },
              {
                type: "string",
                max: 20,
                message: "Max 20 characters",
                validateTrigger: ["onFinish"],
              },
            ]}
          >
            {({ itemErrors }) => (
              <div data-testid="error-count">{itemErrors.length}</div>
            )}
          </MyForm.ArrayItem>
          <button
            data-testid="submit-btn"
            onClick={() => MyForm.formApi.submit().catch(() => {})}
          >
            Submit
          </button>
        </MyForm>
      );

      await userEvent.click(getByTestId("submit-btn"));

      await waitFor(() => {
        // Should have 2 errors: index 0 (too short) and index 2 (too long)
        expect(getByTestId("error-count").textContent).toBe("2");
      });
    });

    test("itemRules with custom validator", async () => {
      MyForm.formApi.setFieldValue("emails", ["test@example.com", "admin@example.com"]);

      const customValidator = vi.fn(async (value: string) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        if (value.includes("admin")) {
          return Promise.reject("Admin email not allowed");
        }
      });

      const { getByTestId } = render(
        <MyForm>
          <MyForm.ArrayItem
            name="emails"
            itemRules={[
              {
                validator: customValidator,
              },
            ]}
          >
            {({ itemErrors }) => (
              <div>
                <div data-testid="error-count">{itemErrors.length}</div>
                {itemErrors.map((err) => (
                  <div key={err.index} data-testid={`error-${err.index}`}>
                    {err.errors[0].errorText}
                  </div>
                ))}
              </div>
            )}
          </MyForm.ArrayItem>
          <button
            data-testid="submit-btn"
            onClick={() => MyForm.formApi.submit().catch(() => {})}
          >
            Submit
          </button>
        </MyForm>
      );

      await userEvent.click(getByTestId("submit-btn"));

      await waitFor(() => {
        expect(customValidator).toHaveBeenCalledTimes(2);
        expect(getByTestId("error-count").textContent).toBe("1");
        expect(getByTestId("error-1").textContent).toBe("Admin email not allowed");
      });
    });
  });

  describe("useArrayField hook", () => {
    test("useArrayField returns array operations", () => {
      const MyForm = createForm(
        { value: [] as string[] },
        withArrayFields(),
      );

      const { getByTestId } = render(
        <MyForm>
          <TestUseArrayField form={MyForm} />
        </MyForm>
      );

      function TestUseArrayField({ form }: { form: typeof MyForm }) {
        const { value, append } = form.useArrayField("value");

        return (
          <div>
            <div data-testid="count">{value.length}</div>
            <button data-testid="add-btn" onClick={() => append("item")}>
              Add
            </button>
          </div>
        );
      }

      expect(getByTestId("count").textContent).toBe("0");
    });

    test("useArrayField with validation rules", async () => {
      const MyForm = createForm(
        { value: [] as string[] },
        withArrayFields(),
      );

      const { getByTestId } = render(
        <MyForm>
          <TestUseArrayField form={MyForm} />
          <button
            data-testid="submit-btn"
            onClick={() => MyForm.formApi.submit().catch(() => {})}
          >
            Submit
          </button>
        </MyForm>
      );

      function TestUseArrayField({ form }: { form: typeof MyForm }) {
        const { value, append } = form.useArrayField("value", [
          {
            type: "array",
            min: 1,
            message: "At least one item required",
          },
        ]);

        const { errors } = form.useFieldErrors("value");

        return (
          <div>
            <div data-testid="count">{value.length}</div>
            <button data-testid="add-btn" onClick={() => append("item")}>
              Add
            </button>
            {errors.length > 0 && (
              <div data-testid="error">{errors[0].errorText}</div>
            )}
          </div>
        );
      }

      await userEvent.click(getByTestId("submit-btn"));

      await waitFor(() => {
        expect(getByTestId("error").textContent).toBe("At least one item required");
      });
    });

    test("useArrayField with itemRules", async () => {
      const MyForm = createForm(
        { emails: [] as string[] },
        withArrayFields(),
      );

      function TestUseArrayField({ form }: { form: typeof MyForm }) {
        // Use direct import to test itemRules parameter
        const { value, itemErrors } = useArrayField(
          form.formApi,
          "emails",
          undefined,
          [
            {
              type: "email",
              message: "Invalid email format",
              validateTrigger: ["onFinish"],
            },
          ]
        );

        return (
          <div>
            <div data-testid="count">{value.length}</div>
            <div data-testid="item-error-count">{itemErrors.length}</div>
          </div>
        );
      }

      const { getByTestId } = render(
        <MyForm>
          <TestUseArrayField form={MyForm} />
          <button
            data-testid="submit-btn"
            onClick={() => MyForm.formApi.submit().catch(() => {})}
          >
            Submit
          </button>
        </MyForm>
      );

      // Set value after render so itemRules are registered
      act(() => {
        MyForm.formApi.setFieldValue("emails", ["invalid-email"]);
      });

      await userEvent.click(getByTestId("submit-btn"));

      await waitFor(() => {
        expect(getByTestId("item-error-count").textContent).toBe("1");
      });
    });
  });

  describe("Integration tests", () => {
    test("both array and item validation work together", async () => {
      const MyForm = createForm(
        { emails: [] as string[] },
        withArrayFields(),
      );

      MyForm.formApi.setFieldValue("emails", ["valid@test.com"]);

      const TestComponent = () => {
        const { errors } = MyForm.useFieldErrors("emails");
        return (
          <MyForm>
            <MyForm.ArrayItem
              name="emails"
              rules={[
                {
                  type: "array",
                  min: 2,
                  message: "Need at least 2 emails",
                },
              ]}
              itemRules={[
                {
                  type: "email",
                  message: "Invalid email",
                },
              ]}
            >
              {({ itemErrors }) => (
                <div>
                  <div data-testid="array-errors">{errors.length}</div>
                  <div data-testid="item-errors">{itemErrors.length}</div>
                </div>
              )}
            </MyForm.ArrayItem>
            <button
              data-testid="submit-btn"
              onClick={() => MyForm.formApi.submit().catch(() => {})}
            >
              Submit
            </button>
          </MyForm>
        );
      };

      const { getByTestId } = render(<TestComponent />);

      await userEvent.click(getByTestId("submit-btn"));

      await waitFor(() => {
        // Array validation should fail (need 2 emails)
        expect(getByTestId("array-errors").textContent).toBe("1");
        // Item validation should pass (valid email)
        expect(getByTestId("item-errors").textContent).toBe("0");
      });
    });

    test("form submission fails if array item validation fails", async () => {
      const MyForm = createForm(
        { emails: [] as string[] },
        withArrayFields(),
      );

      MyForm.formApi.setFieldValue("emails", ["invalid-email"]);
      const onSubmit = vi.fn();

      const { getByTestId } = render(
        <MyForm onSubmit={onSubmit}>
          <MyForm.ArrayItem
            name="emails"
            itemRules={[
              {
                type: "email",
                message: "Invalid email",
              },
            ]}
          >
            {({ value }) => (
              <div data-testid="count">{value.length}</div>
            )}
          </MyForm.ArrayItem>
          <button
            data-testid="submit-btn"
            onClick={() => MyForm.formApi.submit().catch(() => {})}
          >
            Submit
          </button>
        </MyForm>
      );

      await userEvent.click(getByTestId("submit-btn"));

      await waitFor(() => {
        // onSubmit should NOT be called because validation failed
        expect(onSubmit).not.toHaveBeenCalled();
      });
    });

    test("removing item removes its validation errors", async () => {
      const MyForm = createForm(
        { emails: [] as string[] },
        withArrayFields(),
      );

      MyForm.formApi.setFieldValue("emails", ["invalid1", "invalid2"]);

      const { getByTestId } = render(
        <MyForm>
          <MyForm.ArrayItem
            name="emails"
            itemRules={[
              {
                type: "email",
                message: "Invalid email",
              },
            ]}
          >
            {({ value: _value, remove, itemErrors }) => (
              <div>
                <div data-testid="error-count">{itemErrors.length}</div>
                <button data-testid="remove-btn" onClick={() => remove(0)}>
                  Remove first
                </button>
              </div>
            )}
          </MyForm.ArrayItem>
          <button
            data-testid="submit-btn"
            onClick={() => MyForm.formApi.submit().catch(() => {})}
          >
            Submit
          </button>
        </MyForm>
      );

      // Trigger validation
      await userEvent.click(getByTestId("submit-btn"));

      await waitFor(() => {
        expect(getByTestId("error-count").textContent).toBe("2");
      });

      // Remove first item
      await userEvent.click(getByTestId("remove-btn"));

      // Trigger validation again
      await userEvent.click(getByTestId("submit-btn"));

      await waitFor(() => {
        // Should only have 1 error now
        expect(getByTestId("error-count").textContent).toBe("1");
      });
    });
  });
});
