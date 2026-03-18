import { afterEach, describe, expect, test, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { createGlobalForm } from "../src/index";
import { withFormState } from "../src/addons/formState";
import React from "react";

const MyForm = createGlobalForm({ name: "", email: "", age: 0 }, withFormState());

afterEach(() => {
  MyForm.formApi.resetFields();
});

describe("useFormState", () => {
  test("returns initial snapshot", () => {
    const renderSpy = vi.fn();

    const TestComponent = () => {
      const state = MyForm.useFormState();
      renderSpy(state);
      return null;
    };

    render(<MyForm><TestComponent /></MyForm>);

    expect(renderSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        isDirty: false,
        dirtyFields: [],
        touchedFields: [],
        isSubmitting: false,
        isValid: true,
      }),
    );
  });

  test("updates isDirty and dirtyFields when field changes", () => {
    const renderSpy = vi.fn();

    const TestComponent = () => {
      const state = MyForm.useFormState();
      renderSpy(state);
      return null;
    };

    render(<MyForm><TestComponent /></MyForm>);

    act(() => {
      MyForm.formApi.setFieldValue("name", "Alice");
    });

    expect(renderSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        isDirty: true,
        dirtyFields: ["name"],
        touchedFields: ["name"],
      }),
    );
  });

  test("isDirty false after restoring field to initial value", () => {
    const renderSpy = vi.fn();

    const TestComponent = () => {
      const state = MyForm.useFormState();
      renderSpy(state);
      return null;
    };

    render(<MyForm><TestComponent /></MyForm>);

    act(() => {
      MyForm.formApi.setFieldValue("name", "Alice");
    });
    act(() => {
      MyForm.formApi.setFieldValue("name", "");
    });

    expect(renderSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({ isDirty: false, dirtyFields: [] }),
    );
  });

  test("isValid false after validation error, true after fix", async () => {
    const renderSpy = vi.fn();

    const TestComponent = () => {
      const state = MyForm.useFormState();
      renderSpy(state);
      return null;
    };

    render(<MyForm><TestComponent /></MyForm>);

    MyForm.formApi.setFieldRules("name", [{ required: true, message: "Required" }]);
    MyForm.formApi.setFieldVisible("name", true);

    await act(async () => {
      await MyForm.formApi.getFieldsError(["name"]);
    });

    expect(renderSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({ isValid: false }),
    );

    act(() => {
      MyForm.formApi.setFieldValue("name", "Alice");
    });

    expect(renderSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({ isValid: true }),
    );
  });

  test("re-renders on every field change (global hook)", () => {
    const renderSpy = vi.fn();

    const TestComponent = () => {
      const state = MyForm.useFormState();
      renderSpy(state);
      return null;
    };

    render(<MyForm><TestComponent /></MyForm>);
    const before = renderSpy.mock.calls.length;

    act(() => {
      MyForm.formApi.setFieldValue("email", "a@b.com");
    });

    expect(renderSpy.mock.calls.length).toBeGreaterThan(before);
  });
});

describe("useFieldState", () => {
  test("returns initial snapshot for a field", () => {
    const renderSpy = vi.fn();

    const TestComponent = () => {
      const state = MyForm.useFieldState("name");
      renderSpy(state);
      return null;
    };

    render(<MyForm><TestComponent /></MyForm>);

    expect(renderSpy).toHaveBeenLastCalledWith({
      isTouched: false,
      isDirty: false,
      isValid: true,
    });
  });

  test("updates when watched field changes", () => {
    const renderSpy = vi.fn();

    const TestComponent = () => {
      const state = MyForm.useFieldState("name");
      renderSpy(state);
      return null;
    };

    render(<MyForm><TestComponent /></MyForm>);

    act(() => {
      MyForm.formApi.setFieldValue("name", "Alice");
    });

    expect(renderSpy).toHaveBeenLastCalledWith({
      isTouched: true,
      isDirty: true,
      isValid: true,
    });
  });

  test("does not re-render when a different field changes", () => {
    const renderSpy = vi.fn();

    const TestComponent = () => {
      const state = MyForm.useFieldState("name");
      renderSpy(state);
      return null;
    };

    render(<MyForm><TestComponent /></MyForm>);
    const before = renderSpy.mock.calls.length;

    act(() => {
      MyForm.formApi.setFieldValue("email", "a@b.com");
    });

    expect(renderSpy.mock.calls.length).toBe(before);
  });

  test("isTouched stays true after restoring initial value, isDirty becomes false", () => {
    const renderSpy = vi.fn();

    const TestComponent = () => {
      const state = MyForm.useFieldState("name");
      renderSpy(state);
      return null;
    };

    render(<MyForm><TestComponent /></MyForm>);

    act(() => {
      MyForm.formApi.setFieldValue("name", "Alice");
    });
    act(() => {
      MyForm.formApi.setFieldValue("name", "");
    });

    expect(renderSpy).toHaveBeenLastCalledWith({
      isTouched: true,
      isDirty: false,
      isValid: true,
    });
  });

  test("isValid false after validation error on that field", async () => {
    const renderSpy = vi.fn();

    const TestComponent = () => {
      const state = MyForm.useFieldState("name");
      renderSpy(state);
      return null;
    };

    render(<MyForm><TestComponent /></MyForm>);

    MyForm.formApi.setFieldRules("name", [{ required: true, message: "Required" }]);
    MyForm.formApi.setFieldVisible("name", true);

    await act(async () => {
      await MyForm.formApi.getFieldsError(["name"]);
    });

    expect(renderSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({ isValid: false }),
    );
  });

  test("isValid unaffected on sibling field error", async () => {
    const renderSpy = vi.fn();

    const TestComponent = () => {
      const state = MyForm.useFieldState("email");
      renderSpy(state);
      return null;
    };

    render(<MyForm><TestComponent /></MyForm>);

    MyForm.formApi.setFieldRules("name", [{ required: true, message: "Required" }]);
    MyForm.formApi.setFieldVisible("name", true);

    await act(async () => {
      await MyForm.formApi.getFieldsError(["name"]);
    });

    expect(renderSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({ isValid: true }),
    );
  });

  test("resets on resetFields()", () => {
    const renderSpy = vi.fn();

    const TestComponent = () => {
      const state = MyForm.useFieldState("name");
      renderSpy(state);
      return null;
    };

    render(<MyForm><TestComponent /></MyForm>);

    act(() => {
      MyForm.formApi.setFieldValue("name", "Alice");
    });
    act(() => {
      MyForm.formApi.resetFields();
    });

    expect(renderSpy).toHaveBeenLastCalledWith({
      isTouched: false,
      isDirty: false,
      isValid: true,
    });
  });
});
