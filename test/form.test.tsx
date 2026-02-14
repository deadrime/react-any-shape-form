import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ValidationRule, createForm } from "../src/index";
import React from "react";

const inputTestId = "form-input-name";
const submitTestId = "form-submit-button";

describe("test Form", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("test basics", () => {
    const MyForm = createForm({
      name: "",
    });

    const formItemOnChangeCb = vi.fn();
    const formOnFinishCb = vi.fn();
    const formOnFieldChangeCb = vi.fn();

    const MyFormJsx = (
      <MyForm onFinish={formOnFinishCb} onFieldChange={formOnFieldChangeCb}>
        <MyForm.Item name="name" onChange={formItemOnChangeCb}>
          {({ value, onChange }) => (
            <input
              data-testid={inputTestId}
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          )}
        </MyForm.Item>
        <button
          data-testid={submitTestId}
          onClick={() => MyForm.formApi.submit().catch(() => {})}
        >
          Submit
        </button>
      </MyForm>
    );

    let input: HTMLInputElement;
    let submit: HTMLButtonElement;

    beforeEach(() => {
      render(MyFormJsx);
      input = screen.getByTestId(inputTestId) as HTMLInputElement;
      submit = screen.getByTestId(submitTestId) as HTMLButtonElement;
      MyForm.formApi.resetFields();
    });

    test("check elements render correctly", () => {
      expect(input).exist;
      expect(submit).exist;
    });

    test("input value changes correctly", async () => {
      await userEvent.type(input, "Rina");
      expect(input.value).toBe("Rina");
      await userEvent.clear(input);
      expect(input.value).toBe("");
    });

    test("input trigger form item onChange cb", async () => {
      await userEvent.type(input, "Rina");
      expect(formItemOnChangeCb).toBeCalledWith("Rina");
    });

    test("onField callback works", async () => {
      await userEvent.type(input, "Test");
      expect(formOnFieldChangeCb).toBeCalledWith("name", "Test");
    });

    test("form submit", async () => {
      await userEvent.type(input, "Rina");
      await userEvent.click(submit);
      expect(formOnFinishCb).toBeCalledWith({ name: "Rina" });
    });

  });

  describe("test validation", () => {
    const formItemOnChangeCb = vi.fn();
    const onErrorCb = vi.fn();

    const MyForm = createForm({
      name: "",
    });

    const formWithRules = (rules: ValidationRule<string>[]) => (
      <MyForm>
        <MyForm.Item name="name" rules={rules} onChange={formItemOnChangeCb}>
          {({ value, onChange, errors }) => {
            errors.forEach((e) => onErrorCb(e));
            return (
              <input
                data-testid={inputTestId}
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
            );
          }}
        </MyForm.Item>
        <button
          data-testid={submitTestId}
          onClick={() => MyForm.formApi.submit().catch(() => {})}
        >
          Submit
        </button>
      </MyForm>
    );

    describe("test required rule", async () => {
      const rule: ValidationRule = {
        required: true,
        message: "requiredError",
        validateTrigger: ["onFinish"],
      };

      test("must throw an error with empty input", async () => {
        const dom = render(formWithRules([rule]));
        const submit = dom.getByTestId(submitTestId);
        await userEvent.click(submit);

        const validationError = {
          errorText: "requiredError",
          value: "",
          rule: rule,
        };
        expect(onErrorCb).toBeCalledWith(validationError);
      });

      test("not throw an error with fulfilled input", async () => {
        const dom = render(formWithRules([rule]));
        const submit = dom.getByTestId(submitTestId);
        const input = dom.getByTestId(inputTestId);
        await userEvent.type(input, "qwerty");
        await userEvent.click(submit);
        expect(onErrorCb).not.toBeCalled();
      });
    });
  });

  describe("test cross-field validation with formState", () => {
    const MyForm = createForm({
      password: "",
      confirmPassword: "",
    });

    test("validator receives formState for cross-field validation", async () => {
      const crossFieldValidator = vi.fn(async (value: string, _rule, formState) => {
        if (value && formState.password && value !== formState.password) {
          return Promise.reject("Passwords do not match");
        }
      });

      const onErrorCb = vi.fn();

      const { getByTestId } = render(
        <MyForm>
          <MyForm.Item name="password">
            {({ value, onChange }) => (
              <input
                data-testid="password-input"
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
            )}
          </MyForm.Item>
          <MyForm.Item
            name="confirmPassword"
            rules={[{ validator: crossFieldValidator, message: "Passwords do not match", validateTrigger: ["onFinish"] }]}
          >
            {({ value, onChange, errors }) => {
              errors.forEach((e) => onErrorCb(e));
              return (
                <input
                  data-testid="confirm-password-input"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                />
              );
            }}
          </MyForm.Item>
          <button
            data-testid="submit-btn"
            onClick={() => MyForm.formApi.submit().catch(() => {})}
          >
            Submit
          </button>
        </MyForm>
      );

      const passwordInput = getByTestId("password-input");
      const confirmInput = getByTestId("confirm-password-input");
      const submitBtn = getByTestId("submit-btn");

      await userEvent.type(passwordInput, "abc");
      await userEvent.type(confirmInput, "xyz");
      await userEvent.click(submitBtn);

      expect(crossFieldValidator).toHaveBeenCalled();
      const lastCall = crossFieldValidator.mock.calls[crossFieldValidator.mock.calls.length - 1];
      expect(lastCall[2]).toHaveProperty("password", "abc");
      expect(lastCall[2]).toHaveProperty("confirmPassword", "xyz");
      expect(onErrorCb).toHaveBeenCalledWith(
        expect.objectContaining({ errorText: "Passwords do not match" })
      );
    });
  });

  describe("test initial state", () => {
    test("createForm with pre-filled state", () => {
      const MyForm = createForm({ name: "John" });

      const { getByTestId } = render(
        <MyForm>
          <MyForm.Item name="name">
            {({ value, onChange }) => (
              <input
                data-testid={inputTestId}
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
            )}
          </MyForm.Item>
        </MyForm>
      );

      expect((getByTestId(inputTestId) as HTMLInputElement).value).toBe("John");
    });

    test("initialState prop on Form component", () => {
      const MyForm = createForm({ name: "" });

      const { getByTestId } = render(
        <MyForm initialState={{ name: "John" }}>
          <MyForm.Item name="name">
            {({ value, onChange }) => (
              <input
                data-testid={inputTestId}
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
            )}
          </MyForm.Item>
        </MyForm>
      );

      expect((getByTestId(inputTestId) as HTMLInputElement).value).toBe("John");
    });

    test("formApi.setInitialState()", () => {
      const MyForm = createForm({ name: "" });

      const { getByTestId } = render(
        <MyForm>
          <MyForm.Item name="name">
            {({ value, onChange }) => (
              <input
                data-testid={inputTestId}
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
            )}
          </MyForm.Item>
        </MyForm>
      );

      act(() => {
        MyForm.formApi.setInitialState({ name: "John" });
      });

      expect((getByTestId(inputTestId) as HTMLInputElement).value).toBe("John");
    });
  });
});
