import { beforeEach, afterEach, describe, expect, test, vi } from "vitest";
import { act, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createForm } from "../src/index";
import { useArrayField } from "../src/addons/array/FormArrayItem";
import { withArrayFields } from "../src/addons/array";
import { useFormInstance } from "../src/FormContext";
import React from "react";

describe("Form.ArrayItem tests", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic array operations", () => {
    const MyForm = createForm<{ value: string[] }>().withAddons(withArrayFields());

    test("append adds item to the end", async () => {
      const { getByTestId } = render(
        <MyForm.Form initialState={{ value: [] }}>
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
        </MyForm.Form>
      );

      expect(getByTestId("value-count").textContent).toBe("0");

      await userEvent.click(getByTestId("add-btn"));

      expect(getByTestId("value-count").textContent).toBe("1");
    });

    test("prepend adds item to the beginning", async () => {
      const { getByTestId } = render(
        <MyForm.Form initialState={{ value: ["second"] }}>
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
        </MyForm.Form>
      );

      await userEvent.click(getByTestId("prepend-btn"));

      expect(getByTestId("first-item").textContent).toBe("first");
    });

    test("remove deletes item by index", async () => {
      const { getByTestId } = render(
        <MyForm.Form initialState={{ value: ["item1", "item2", "item3"] }}>
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
        </MyForm.Form>
      );

      await userEvent.click(getByTestId("remove-btn"));

      expect(getByTestId("value-count").textContent).toBe("2");
    });

    test("update modifies item by index", async () => {
      const { getByTestId } = render(
        <MyForm.Form initialState={{ value: ["old"] }}>
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
        </MyForm.Form>
      );

      await userEvent.click(getByTestId("update-btn"));

      expect(getByTestId("first-item").textContent).toBe("new");
    });

    test("update with callback function", async () => {
      const { getByTestId } = render(
        <MyForm.Form initialState={{ value: ["hello"] }}>
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
        </MyForm.Form>
      );

      await userEvent.click(getByTestId("update-btn"));

      expect(getByTestId("first-item").textContent).toBe("hello world");
    });

    test("move reorders value", async () => {
      const { getByTestId } = render(
        <MyForm.Form initialState={{ value: ["a", "b", "c"] }}>
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
        </MyForm.Form>
      );

      await userEvent.click(getByTestId("move-btn"));

      expect(getByTestId("value").textContent).toBe("b,c,a");
    });

    test("move from end to beginning", async () => {
      const { getByTestId } = render(
        <MyForm.Form initialState={{ value: ["a", "b", "c"] }}>
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
        </MyForm.Form>
      );

      await userEvent.click(getByTestId("move-btn"));

      expect(getByTestId("value").textContent).toBe("c,a,b");
    });

    test("move to middle position", async () => {
      const { getByTestId } = render(
        <MyForm.Form initialState={{ value: ["a", "b", "c", "d"] }}>
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
        </MyForm.Form>
      );

      await userEvent.click(getByTestId("move-btn"));

      expect(getByTestId("value").textContent).toBe("a,d,b,c");
    });

    test("move with same from and to index", async () => {
      const { getByTestId } = render(
        <MyForm.Form initialState={{ value: ["a", "b", "c"] }}>
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
        </MyForm.Form>
      );

      await userEvent.click(getByTestId("move-btn"));

      // Array should remain unchanged
      expect(getByTestId("value").textContent).toBe("a,b,c");
    });

    test("move triggers re-render with updated order", async () => {
      const { getByTestId } = render(
        <MyForm.Form initialState={{ value: ["first", "second", "third"] }}>
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
        </MyForm.Form>
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
    const MyForm = createForm<{ tags: string[] }>().withAddons(withArrayFields());

    test("required array validation", async () => {
      const onErrorCb = vi.fn();

      const ErrorDisplay = () => {
        const { errors } = MyForm.useFieldErrors("tags");
        errors.forEach((e) => onErrorCb(e));
        return null;
      };

      const { getByTestId } = render(
        <MyForm.Form initialState={{ tags: [] }}>
          <MyForm.ArrayItem
            name="tags"
            rules={[
              {
                required: true,
                message: "At least one tag is required",
                validateTrigger: ["onSubmit"],
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
          <MyForm.Submit>
            <button data-testid="submit-btn">Submit</button>
          </MyForm.Submit>
        </MyForm.Form>
      );

      await userEvent.click(getByTestId("submit-btn"));

      await waitFor(() => {
        expect(onErrorCb).toHaveBeenCalledWith(
          expect.objectContaining({ errorText: "At least one tag is required" })
        );
      });
    });

    test("array min validation", async () => {
      const onErrorCb = vi.fn();

      const ErrorDisplay = () => {
        const { errors } = MyForm.useFieldErrors("tags");
        errors.forEach((e) => onErrorCb(e));
        return null;
      };

      const { getByTestId } = render(
        <MyForm.Form initialState={{ tags: ["tag1"] }}>
          <MyForm.ArrayItem
            name="tags"
            rules={[
              {
                type: "array",
                min: 2,
                message: "At least 2 tags required",
                validateTrigger: ["onSubmit"],
              },
            ]}
          >
            {({ value }) => <div data-testid="value-count">{value.length}</div>}
          </MyForm.ArrayItem>
          <ErrorDisplay />
          <MyForm.Submit>
            <button data-testid="submit-btn">Submit</button>
          </MyForm.Submit>
        </MyForm.Form>
      );

      await userEvent.click(getByTestId("submit-btn"));

      await waitFor(() => {
        expect(onErrorCb).toHaveBeenCalledWith(
          expect.objectContaining({ errorText: "At least 2 tags required" })
        );
      });
    });

    test("array max validation", async () => {
      const onErrorCb = vi.fn();

      const ErrorDisplay = () => {
        const { errors } = MyForm.useFieldErrors("tags");
        errors.forEach((e) => onErrorCb(e));
        return null;
      };

      const { getByTestId } = render(
        <MyForm.Form initialState={{ tags: ["tag1", "tag2", "tag3", "tag4"] }}>
          <MyForm.ArrayItem
            name="tags"
            rules={[
              {
                type: "array",
                max: 3,
                message: "Maximum 3 tags allowed",
                validateTrigger: ["onSubmit"],
              },
            ]}
          >
            {({ value }) => <div data-testid="value-count">{value.length}</div>}
          </MyForm.ArrayItem>
          <ErrorDisplay />
          <MyForm.Submit>
            <button data-testid="submit-btn">Submit</button>
          </MyForm.Submit>
        </MyForm.Form>
      );

      await userEvent.click(getByTestId("submit-btn"));

      await waitFor(() => {
        expect(onErrorCb).toHaveBeenCalledWith(
          expect.objectContaining({ errorText: "Maximum 3 tags allowed" })
        );
      });
    });

    test("custom validator for whole array", async () => {
      const onErrorCb = vi.fn();

      const ErrorDisplay = () => {
        const { errors } = MyForm.useFieldErrors("tags");
        errors.forEach((e) => onErrorCb(e));
        return null;
      };

      const { getByTestId } = render(
        <MyForm.Form initialState={{ tags: ["tag1", "tag1", "tag2"] }}>
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
                validateTrigger: ["onSubmit"],
              },
            ]}
          >
            {({ value }) => <div data-testid="value-count">{value.length}</div>}
          </MyForm.ArrayItem>
          <ErrorDisplay />
          <MyForm.Submit>
            <button data-testid="submit-btn">Submit</button>
          </MyForm.Submit>
        </MyForm.Form>
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
    const MyForm = createForm<{ emails: string[] }>().withAddons(withArrayFields());

    test("itemRules validates each item individually", async () => {
      const { getByTestId } = render(
        <MyForm.Form initialState={{ emails: ["valid@test.com", "", "invalid"] }}>
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
          <MyForm.Submit>
            <button data-testid="submit-btn">Submit</button>
          </MyForm.Submit>
        </MyForm.Form>
      );

      await userEvent.click(getByTestId("submit-btn"));

      await waitFor(() => {
        // Should have errors for index 1 (empty) and index 2 (invalid)
        expect(getByTestId("error-count").textContent).toBe("2");
      });
    });

    test("itemErrors updates on value change", async () => {
      const { getByTestId } = render(
        <MyForm.Form initialState={{ emails: [""] }}>
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
        </MyForm.Form>
      );

      const input = getByTestId("email-input");

      // Type a valid email
      await userEvent.type(input, "test@example.com");

      await waitFor(() => {
        expect(getByTestId("has-error").textContent).toBe("no");
      });
    });

    test("itemRules with email validation", async () => {
      const { getByTestId } = render(
        <MyForm.Form initialState={{ emails: ["not-an-email"] }}>
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
          <MyForm.Submit>
            <button data-testid="submit-btn">Submit</button>
          </MyForm.Submit>
        </MyForm.Form>
      );

      await userEvent.click(getByTestId("submit-btn"));

      await waitFor(() => {
        expect(getByTestId("error-message").textContent).toBe("Invalid email");
      });
    });

    test("itemRules with min/max length", async () => {
      const MyForm2 = createForm<{ tags: string[] }>().withAddons(withArrayFields());

      const { getByTestId } = render(
        <MyForm2.Form
          initialState={{ tags: ["ab", "valid-tag", "this-tag-is-way-too-long-to-be-valid"] }}
        >
          <MyForm2.ArrayItem
            name="tags"
            itemRules={[
              {
                type: "string",
                min: 3,
                message: "Min 3 characters",
                validateTrigger: ["onSubmit"],
              },
              {
                type: "string",
                max: 20,
                message: "Max 20 characters",
                validateTrigger: ["onSubmit"],
              },
            ]}
          >
            {({ itemErrors }) => (
              <div data-testid="error-count">{itemErrors.length}</div>
            )}
          </MyForm2.ArrayItem>
          <MyForm2.Submit>
            <button data-testid="submit-btn">Submit</button>
          </MyForm2.Submit>
        </MyForm2.Form>
      );

      await userEvent.click(getByTestId("submit-btn"));

      await waitFor(() => {
        // Should have 2 errors: index 0 (too short) and index 2 (too long)
        expect(getByTestId("error-count").textContent).toBe("2");
      });
    });

    test("itemRules with custom validator", async () => {
      const customValidator = vi.fn(async (value: string) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        if (value.includes("admin")) {
          return Promise.reject("Admin email not allowed");
        }
      });

      const { getByTestId } = render(
        <MyForm.Form
          initialState={{ emails: ["test@example.com", "admin@example.com"] }}
        >
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
          <MyForm.Submit>
            <button data-testid="submit-btn">Submit</button>
          </MyForm.Submit>
        </MyForm.Form>
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
      const MyForm = createForm<{ value: string[] }>().withAddons(withArrayFields());

      function TestUseArrayField() {
        const { value, append } = MyForm.useArrayField("value");

        return (
          <div>
            <div data-testid="count">{value.length}</div>
            <button data-testid="add-btn" onClick={() => append("item")}>
              Add
            </button>
          </div>
        );
      }

      const { getByTestId } = render(
        <MyForm.Form initialState={{ value: [] }}>
          <TestUseArrayField />
        </MyForm.Form>
      );

      expect(getByTestId("count").textContent).toBe("0");
    });

    test("useArrayField with validation rules", async () => {
      const MyForm = createForm<{ value: string[] }>().withAddons(withArrayFields());

      function TestUseArrayField() {
        const { value, append } = MyForm.useArrayField("value", {
          rules: [
            {
              type: "array",
              min: 1,
              message: "At least one item required",
            },
          ],
        });

        const { errors } = MyForm.useFieldErrors("value");

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

      const { getByTestId } = render(
        <MyForm.Form initialState={{ value: [] }}>
          <TestUseArrayField />
          <MyForm.Submit>
            <button data-testid="submit-btn">Submit</button>
          </MyForm.Submit>
        </MyForm.Form>
      );

      await userEvent.click(getByTestId("submit-btn"));

      await waitFor(() => {
        expect(getByTestId("error").textContent).toBe("At least one item required");
      });
    });

    test("useArrayField with itemRules", async () => {
      const MyForm = createForm<{ emails: string[] }>().withAddons(withArrayFields());

      function TestUseArrayField() {
        // Use direct import to test itemRules parameter
        const form = useFormInstance<{ emails: string[] }>();
        const { value, itemErrors } = useArrayField(
          form,
          "emails",
          {
            itemRules: [
              {
                type: "email",
                message: "Invalid email format",
                validateTrigger: ["onSubmit"],
              },
            ],
          }
        );

        return (
          <div>
            <div data-testid="count">{value.length}</div>
            <div data-testid="item-error-count">{itemErrors.length}</div>
          </div>
        );
      }

      const { getByTestId } = render(
        <MyForm.Form
          initialState={{ emails: ["invalid-email"] }}
        >
          <TestUseArrayField />
          <MyForm.Submit>
            <button data-testid="submit-btn">Submit</button>
          </MyForm.Submit>
        </MyForm.Form>
      );

      await userEvent.click(getByTestId("submit-btn"));

      await waitFor(() => {
        expect(getByTestId("item-error-count").textContent).toBe("1");
      });
    });
  });

  describe("Integration tests", () => {
    test("both array and item validation work together", async () => {
      const MyForm = createForm<{ emails: string[] }>().withAddons(withArrayFields());

      const TestComponent = () => {
        const { errors } = MyForm.useFieldErrors("emails");
        return (
          <div>
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
            <MyForm.Submit>
              <button data-testid="submit-btn">Submit</button>
            </MyForm.Submit>
          </div>
        );
      };

      const { getByTestId } = render(
        <MyForm.Form
          initialState={{ emails: ["valid@test.com"] }}
        >
          <TestComponent />
        </MyForm.Form>
      );

      await userEvent.click(getByTestId("submit-btn"));

      await waitFor(() => {
        // Array validation should fail (need 2 emails)
        expect(getByTestId("array-errors").textContent).toBe("1");
        // Item validation should pass (valid email)
        expect(getByTestId("item-errors").textContent).toBe("0");
      });
    });

    test("form submission fails if array item validation fails", async () => {
      const MyForm = createForm<{ emails: string[] }>().withAddons(withArrayFields());
      const onSubmit = vi.fn();

      const { getByTestId } = render(
        <MyForm.Form
          initialState={{ emails: ["invalid-email"] }}
          onSubmit={onSubmit}
        >
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
          <MyForm.Submit>
            <button data-testid="submit-btn">Submit</button>
          </MyForm.Submit>
        </MyForm.Form>
      );

      await userEvent.click(getByTestId("submit-btn"));

      await waitFor(() => {
        // onSubmit should NOT be called because validation failed
        expect(onSubmit).not.toHaveBeenCalled();
      });
    });

    test("removing item removes its validation errors", async () => {
      const MyForm = createForm<{ emails: string[] }>().withAddons(withArrayFields());

      const { getByTestId } = render(
        <MyForm.Form
          initialState={{ emails: ["invalid1", "invalid2"] }}
        >
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
          <MyForm.Submit>
            <button data-testid="submit-btn">Submit</button>
          </MyForm.Submit>
        </MyForm.Form>
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
