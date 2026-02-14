import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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

    const formWithRules = (rules) => (
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
});
