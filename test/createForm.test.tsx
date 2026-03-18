import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { useRef } from "react";
import { createForm } from "../src/index";
import { withArrayFields } from "../src/addons/array";
import { withFormState } from "../src/addons/formState";
import { FormApi } from "../src/FormApi";

describe("createForm — context-based API", () => {
  describe("basic rendering", () => {
    const MyForm = createForm<{ name: string; age: number }>();

    test("renders children inside <Form>", () => {
      render(
        <MyForm.Form initialState={{ name: "", age: 0 }}>
          <span data-testid="child">hello</span>
        </MyForm.Form>,
      );
      expect(screen.getByTestId("child")).toBeTruthy();
    });

    test("Form.Item renders with initial value", () => {
      render(
        <MyForm.Form initialState={{ name: "Alice", age: 0 }}>
          <MyForm.Item name="name">
            {({ value }) => <input data-testid="input" value={value} readOnly />}
          </MyForm.Item>
        </MyForm.Form>,
      );
      expect((screen.getByTestId("input") as HTMLInputElement).value).toBe("Alice");
    });

    test("each mount creates an isolated FormApi instance", () => {
      render(
        <MyForm.Form initialState={{ name: "first", age: 0 }}>
          <MyForm.Item name="name">
            {({ value }) => <span data-testid="name-a">{value}</span>}
          </MyForm.Item>
        </MyForm.Form>,
      );

      render(
        <MyForm.Form initialState={{ name: "second", age: 0 }}>
          <MyForm.Item name="name">
            {({ value }) => <span data-testid="name-b">{value}</span>}
          </MyForm.Item>
        </MyForm.Form>,
      );

      expect(screen.getByTestId("name-a").textContent).toBe("first");
      expect(screen.getByTestId("name-b").textContent).toBe("second");
    });
  });

  describe("submit via ref", () => {
    const RefForm = createForm<{ name: string; age: number }>();

    test("ref.current.submit() calls onSubmit with current state", async () => {
      const onSubmit = vi.fn();

      function TestComponent() {
        const formRef = useRef<FormApi<{ name: string; age: number }>>(null);
        return (
          <RefForm.Form ref={formRef} initialState={{ name: "", age: 0 }} onSubmit={onSubmit}>
            <RefForm.Item name="name">
              {({ value, onChange }) => (
                <input
                  data-testid="input"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                />
              )}
            </RefForm.Item>
            <button data-testid="btn" onClick={() => formRef.current?.submit().catch(() => {})} />
          </RefForm.Form>
        );
      }

      render(<TestComponent />);
      await userEvent.type(screen.getByTestId("input"), "Bob");
      await userEvent.click(screen.getByTestId("btn"));
      expect(onSubmit).toBeCalledWith({ name: "Bob", age: 0 });
    });

    test("ref exposes submit after mount", async () => {
      let capturedRef: React.RefObject<FormApi<{ name: string; age: number }> | null> | null = null;

      function TestComponent() {
        const formRef = useRef<FormApi<{ name: string; age: number }>>(null);
        capturedRef = formRef;
        return (
          <RefForm.Form ref={formRef} initialState={{ name: "", age: 0 }}>
            <span />
          </RefForm.Form>
        );
      }

      render(<TestComponent />);
      expect(capturedRef!.current).not.toBeNull();
      expect(typeof capturedRef!.current?.submit).toBe("function");
    });
  });

  describe("<Form.Submit>", () => {
    const SubmitForm = createForm<{ name: string }>();

    test("cloneElement mode — injects onClick and calls onSubmit", async () => {
      const onSubmit = vi.fn();

      render(
        <SubmitForm.Form initialState={{ name: "Eve" }} onSubmit={onSubmit}>
          <SubmitForm.Submit>
            <button data-testid="submit-btn">Submit</button>
          </SubmitForm.Submit>
        </SubmitForm.Form>,
      );

      await userEvent.click(screen.getByTestId("submit-btn"));
      expect(onSubmit).toBeCalledWith({ name: "Eve" });
    });

    test("render prop mode — calls onSubmit", async () => {
      const onSubmit = vi.fn();

      render(
        <SubmitForm.Form initialState={{ name: "Eve" }} onSubmit={onSubmit}>
          <SubmitForm.Submit>
            {({ submit }) => (
              <button data-testid="submit-btn" onClick={submit}>Submit</button>
            )}
          </SubmitForm.Submit>
        </SubmitForm.Form>,
      );

      await userEvent.click(screen.getByTestId("submit-btn"));
      expect(onSubmit).toBeCalledWith({ name: "Eve" });
    });
  });

  describe("hooks read from context", () => {
    const WatchForm = createForm<{ count: number }>();

    test("useWatch returns current field value", () => {
      function Counter() {
        const count = WatchForm.useWatch("count");
        return <span data-testid="count">{count}</span>;
      }

      render(
        <WatchForm.Form initialState={{ count: 42 }}>
          <Counter />
        </WatchForm.Form>,
      );

      expect(screen.getByTestId("count").textContent).toBe("42");
    });

    test("useField returns value and setter", async () => {
      function CounterField() {
        const [count, setCount] = WatchForm.useField("count");
        return (
          <button data-testid="inc" onClick={() => setCount((n) => (n as number) + 1)}>
            {count}
          </button>
        );
      }

      render(
        <WatchForm.Form initialState={{ count: 0 }}>
          <CounterField />
        </WatchForm.Form>,
      );

      expect(screen.getByTestId("inc").textContent).toBe("0");
      await userEvent.click(screen.getByTestId("inc"));
      expect(screen.getByTestId("inc").textContent).toBe("1");
    });
  });

  describe("withAddons", () => {
    test("withArrayFields() works via .withAddons()", async () => {
      const ArrayForm = createForm<{ tags: string[] }>().withAddons(withArrayFields());
      
      function TagList() {
        const { items, append } = ArrayForm.useArrayField("tags");
        return (
          <div>
            {items.map((item) => (
              <span key={item.index} data-testid={`tag-${item.index}`}>{item.value}</span>
            ))}
            <button data-testid="add" onClick={() => append("new-tag")} />
          </div>
        );
      }

      render(
        <ArrayForm.Form initialState={{ tags: ["first"] }}>
          <TagList />
        </ArrayForm.Form>,
      );

      expect(screen.getByTestId("tag-0").textContent).toBe("first");
      await userEvent.click(screen.getByTestId("add"));
      expect(screen.getByTestId("tag-1").textContent).toBe("new-tag");
    });

    test("withFormState() isDirty reflects field changes", async () => {
      const StateForm = createForm<{ name: string }>().withAddons(withFormState());

      function DirtyIndicator() {
        const { isDirty } = StateForm.useFormState();
        return <span data-testid="dirty">{String(isDirty)}</span>;
      }

      render(
        <StateForm.Form initialState={{ name: "" }}>
          <DirtyIndicator />
          <StateForm.Item name="name">
            {({ value, onChange }) => (
              <input
                data-testid="input"
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
            )}
          </StateForm.Item>
        </StateForm.Form>,
      );

      expect(screen.getByTestId("dirty").textContent).toBe("false");
      await userEvent.type(screen.getByTestId("input"), "hello");
      expect(screen.getByTestId("dirty").textContent).toBe("true");
    });
  });

  describe("onSubmit and onFieldChange props", () => {
    const BasicForm = createForm<{ value: string }>();

    test("onFieldChange fires when field changes", async () => {
      const onFieldChange = vi.fn();

      render(
        <BasicForm.Form initialState={{ value: "" }} onFieldChange={onFieldChange}>
          <BasicForm.Item name="value">
            {({ value, onChange }) => (
              <input
                data-testid="input"
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
            )}
          </BasicForm.Item>
        </BasicForm.Form>,
      );

      await userEvent.type(screen.getByTestId("input"), "x");
      expect(onFieldChange).toBeCalledWith("value", "x");
    });

    test("validation prevents onSubmit when field is empty", async () => {
      const onSubmit = vi.fn();

      render(
        <BasicForm.Form initialState={{ value: "" }} onSubmit={onSubmit}>
          <BasicForm.Item
            name="value"
            rules={[{ required: true, message: "required", validateTrigger: ["onSubmit"] }]}
          >
            {({ errors }) => (
              <span data-testid="error">{errors[0]?.errorText ?? ""}</span>
            )}
          </BasicForm.Item>
          <BasicForm.Submit>
            <button data-testid="submit">Submit</button>
          </BasicForm.Submit>
        </BasicForm.Form>,
      );

      await userEvent.click(screen.getByTestId("submit"));
      expect(onSubmit).not.toBeCalled();
      expect(screen.getByTestId("error").textContent).toBe("required");
    });
  });
});
