import { afterEach, describe, expect, test, vi } from "vitest";
import { act, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createGlobalForm, useWatch } from "../src/index";
import React from "react";

const MyForm = createGlobalForm({ firstName: "", lastName: "", age: 0 });

afterEach(() => {
  MyForm.formApi.resetFields();
});

describe("useWatch with multiple fields", () => {
  test("returns object with values for multiple fields", () => {
    const renderSpy = vi.fn();

    const TestComponent = () => {
      const values = MyForm.useWatch(["firstName", "lastName"]);
      renderSpy(values);
      return (
        <div>
          <MyForm.Item name="firstName">
            {({ value, onChange }) => (
              <input
                data-testid="first-name"
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
            )}
          </MyForm.Item>
          <MyForm.Item name="lastName">
            {({ value, onChange }) => (
              <input
                data-testid="last-name"
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
            )}
          </MyForm.Item>
        </div>
      );
    };

    render(
      <MyForm>
        <TestComponent />
      </MyForm>
    );
    expect(renderSpy).toHaveBeenLastCalledWith({
      firstName: "",
      lastName: "",
    });
  });

  test("updates when any of the watched fields changes", async () => {
    const renderSpy = vi.fn();

    const TestComponent = () => {
      const values = MyForm.useWatch(["firstName", "lastName"]);
      renderSpy(values);
      return (
        <div>
          <MyForm.Item name="firstName">
            {({ value, onChange }) => (
              <input
                data-testid="first-name"
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
            )}
          </MyForm.Item>
          <MyForm.Item name="lastName">
            {({ value, onChange }) => (
              <input
                data-testid="last-name"
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
            )}
          </MyForm.Item>
        </div>
      );
    };

    const { getByTestId } = render(
      <MyForm>
        <TestComponent />
      </MyForm>
    );

    await userEvent.type(getByTestId("first-name"), "John");
    expect(renderSpy).toHaveBeenLastCalledWith({
      firstName: "John",
      lastName: "",
    });

    await userEvent.type(getByTestId("last-name"), "Doe");
    expect(renderSpy).toHaveBeenLastCalledWith({
      firstName: "John",
      lastName: "Doe",
    });
  });

  test("does not re-render when an unwatched field changes", async () => {
    const renderSpy = vi.fn();

    const TestComponent = () => {
      const values = MyForm.useWatch(["firstName"]);
      renderSpy(values);
      return (
        <div>
          <MyForm.Item name="firstName">
            {({ value, onChange }) => (
              <input
                data-testid="first-name"
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
            )}
          </MyForm.Item>
          <MyForm.Item name="age">
            {({ value, onChange }) => (
              <input
                data-testid="age"
                type="number"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
              />
            )}
          </MyForm.Item>
        </div>
      );
    };

    render(
      <MyForm>
        <TestComponent />
      </MyForm>
    );
    const callCountBefore = renderSpy.mock.calls.length;

    act(() => {
      MyForm.formApi.setFieldValue("age", 25);
    });

    expect(renderSpy.mock.calls.length).toBe(callCountBefore);
  });

  test("standalone useWatch with single field", () => {
    const MyForm2 = createGlobalForm({ x: 1, y: 2 });
    const renderSpy = vi.fn();

    const TestComponent = () => {
      const x = useWatch(MyForm2.formApi, "x");
      renderSpy(x);
      return <MyForm2>{null}</MyForm2>;
    };

    render(<TestComponent />);
    expect(renderSpy).toHaveBeenLastCalledWith(1);

    act(() => {
      MyForm2.formApi.setFieldValue("x", 42);
    });

    expect(renderSpy).toHaveBeenLastCalledWith(42);

    act(() => {
      MyForm2.formApi.setFieldValue("y", 99);
    });

    // y не наблюдается — лишних ре-рендеров не должно быть
    expect(renderSpy).toHaveBeenLastCalledWith(42);
  });

  test("standalone useWatch with array of fields", () => {
    const MyForm2 = createGlobalForm({ x: 1, y: 2, z: 3 });
    const renderSpy = vi.fn();

    const TestComponent = () => {
      const values = useWatch(MyForm2.formApi, ["x", "y"]);
      renderSpy(values);
      return <MyForm2>{null}</MyForm2>;
    };

    render(<TestComponent />);
    expect(renderSpy).toHaveBeenLastCalledWith({ x: 1, y: 2 });

    act(() => {
      MyForm2.formApi.setFieldValue("x", 10);
    });

    expect(renderSpy).toHaveBeenLastCalledWith({ x: 10, y: 2 });
  });
});
