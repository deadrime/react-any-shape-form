import { beforeEach, describe, expect, expectTypeOf, test, vi } from "vitest";
import { FormApi } from "../src/FormApi";
import { ValidationRule } from "../src";
import { createForm } from "../src/useForm";
import { ChildFormsAddon, withNestedForms } from "../src/addons/nestedForm";
import { NESTED_FORMS_ADDON_KEY } from "../src/addons/addonKeys";

describe("test FormApi", () => {
  const defaultState = {
    strField: "",
    numField: 0,
    boolField: false,
    strArray: [] as string[],
    numArray: [] as number[],
  };

  let api: FormApi<typeof defaultState>;

  beforeEach(() => {
    api = new FormApi(defaultState);
    vi.resetAllMocks();
    api.resetFields();
  });

  test("get state return initial state", () => {
    expect(api.getState()).toEqual(defaultState);
  });

  test("setInitialState", () => {
    api.setInitialState({
      boolField: true,
      numArray: [3, 2, 1],
      numField: 1,
      strArray: ["3", "2", "1"],
      strField: "heh",
    });
    expect(api.getState()).toEqual({
      boolField: true,
      numArray: [3, 2, 1],
      numField: 1,
      strArray: ["3", "2", "1"],
      strField: "heh",
    });
  });

  test("types", () => {
    type FieldType =
      | "strField"
      | "numField"
      | "boolField"
      | "strArray"
      | "numArray";
    expectTypeOf(api.getState()).toEqualTypeOf<typeof defaultState>();
    expectTypeOf(api.getFieldValue).parameter(0).toEqualTypeOf<FieldType>();
    expectTypeOf(api.setFieldValue).parameter(0).toEqualTypeOf<FieldType>();
  });

  test("setFieldValue/getFieldValue", () => {
    api.setFieldValue("strField", "test");
    expect(api.getFieldValue("strField")).eq("test");
  });

  test("setFieldValue/getFieldValue", () => {
    api.setFieldValue("strField", "test");
    expect(api.getFieldValue("strField")).eq("test");
  });

  test("setFieldsValue/getFieldsValue", () => {
    api.setFieldsValue({
      strField: "test2",
      numField: 123,
      numArray: [1, 2, 3],
    });

    expect(api.getFieldsValue(["strField", "numField", "numArray"])).toEqual({
      strField: "test2",
      numField: 123,
      numArray: [1, 2, 3],
    });

    expect(api.getFieldsValue()).toEqual({
      strField: "test2",
      numField: 123,
      numArray: [1, 2, 3],
      boolField: false,
      strArray: [],
    });
  });

  test("onFieldChange", () => {
    const onFieldChange = vi.fn();
    api.onFieldChange("strField", onFieldChange);
    api.setFieldValue("strField", "test1");
    api.setFieldValue("strField", "test2");
    expect(onFieldChange).toBeCalledWith("test1");
    expect(onFieldChange).toBeCalledWith("test2");
    expect(onFieldChange).toBeCalledTimes(2);
    expect(api.getFieldValue("strField")).eq("test2");
  });

  test("onSubmit without validation rules", async () => {
    const onSubmit = vi.fn();
    api.onSubmit(onSubmit);
    api.setFieldsValue({
      strField: "test",
      numField: 123,
      numArray: [1, 2, 3],
    });
    await api.submit();
    expect(onSubmit).toBeCalledWith({
      strField: "test",
      numField: 123,
      boolField: false,
      strArray: [],
      numArray: [1, 2, 3],
    });
  });

  test("onFieldError", async () => {
    const rule: ValidationRule = {
      required: true,
      message: "StrRequired",
      validateTrigger: ["onSubmit"],
    };
    api.setFieldRules("strField", [rule]);
    api.setFieldsValue({
      strField: "",
    });
    const onFieldError = vi.fn();
    api.onFieldError("strField", onFieldError);
    const errors = await api.getFieldsError(["strField"]);
    expect(errors).toEqual([
      {
        rule,
        value: "",
        errorText: "StrRequired",
      },
    ]);
    expect(onFieldError).toBeCalledWith(
      [
        {
          rule,
          value: "",
          errorText: "StrRequired",
        },
      ],
      api.getState(),
    );
  });

  describe("validation", async () => {
    describe("required", async () => {
      test("string", async () => {
        api.setFieldRules("strField", [
          {
            required: true,
            message: "StrRequired",
          },
        ]);
        expect(api.validateField("strField")).rejects.toHaveProperty(
          "[0].errorText",
          "StrRequired",
        );
        api.setFieldValue("strField", "heh");
        expect(api.validateField("strField")).resolves.empty;
      });
      test("number", async () => {
        api.setFieldRules("numField", [
          {
            required: true,
            message: "numRequired",
          },
        ]);
        api.setFieldValue("numField", undefined as any);
        expect(api.validateField("numField")).rejects.toHaveProperty(
          "[0].errorText",
          "numRequired",
        );
        api.setFieldValue("numField", 0);
        expect(api.validateField("strField")).resolves.empty;
      });
      test("boolean", async () => {
        api.setFieldRules("boolField", [
          {
            required: true,
            message: "boolRequired",
          },
        ]);
        api.setFieldValue("boolField", undefined as any);
        expect(api.validateField("boolField")).rejects.toHaveProperty(
          "[0].errorText",
          "boolRequired",
        );
        api.setFieldValue("boolField", false);
        expect(api.validateField("strField")).resolves.empty;
      });
      test("array", async () => {
        api.setFieldRules("numArray", [
          {
            required: true,
            message: "numArrayRequired",
          },
        ]);
        api.setFieldValue("numArray", []);
        expect(api.validateField("numArray")).rejects.toHaveProperty(
          "[0].errorText",
          "numArrayRequired",
        );
        api.setFieldValue("numArray", [1, 2, 3]);
        expect(api.validateField("strField")).resolves.empty;
      });
    });
    describe("min/max", async () => {
      describe("type = string, min = 4, max = 8", async () => {
        beforeEach(() => {
          api.setFieldRules("strField", [
            {
              min: 4,
              max: 8,
              type: "string",
              message: "minMaxError",
            },
          ]);
        });

        test("error if value = undefined", async () => {
          api.setFieldValue("strField", undefined as any);
          expect(api.validateField("strField")).rejects.toHaveProperty(
            "[0].errorText",
            "minMaxError",
          );
        });

        test("error if value = ''", async () => {
          expect(api.validateField("strField")).rejects.toHaveProperty(
            "[0].errorText",
            "minMaxError",
          );
        });

        test("error if length = 3", async () => {
          api.setFieldValue("strField", "123");
          expect(api.validateField("strField")).rejects.toHaveProperty(
            "[0].errorText",
            "minMaxError",
          );
        });

        test("no error if length = 4", async () => {
          api.setFieldValue("strField", "1234");
          expect(api.validateField("strField")).resolves.empty;
        });

        test("no error if length = 8", async () => {
          api.setFieldValue("strField", "12345678");
          expect(api.validateField("strField")).resolves.empty;
        });

        test("error if length = 9", async () => {
          api.setFieldValue("strField", "123456789");
          expect(api.validateField("strField")).rejects.toHaveProperty(
            "[0].errorText",
            "minMaxError",
          );
        });
      });
      describe("type = number, min = 4, max = 8", async () => {
        beforeEach(() => {
          api.setFieldRules("numField", [
            {
              min: 4,
              max: 8,
              type: "number",
              message: "minMaxError",
            },
          ]);
        });

        test("error if value = undefined", async () => {
          api.setFieldValue("numField", undefined as any);
          expect(api.validateField("numField")).rejects.toHaveProperty(
            "[0].errorText",
            "minMaxError",
          );
        });

        test("error if value = 0", async () => {
          api.setFieldValue("numField", 0);
          expect(api.validateField("numField")).rejects.toHaveProperty(
            "[0].errorText",
            "minMaxError",
          );
        });

        test("error if value = 1", async () => {
          api.setFieldValue("numField", 1);
          expect(api.validateField("numField")).rejects.toHaveProperty(
            "[0].errorText",
            "minMaxError",
          );
        });

        test("no error if value = 4", async () => {
          api.setFieldValue("numField", 4);
          expect(api.validateField("numField")).resolves.empty;
        });

        test("no error if value = 8", async () => {
          api.setFieldValue("numField", 8);
          expect(api.validateField("numField")).resolves.empty;
        });

        test("error if value = 9", async () => {
          api.setFieldValue("numField", 9);
          expect(api.validateField("numField")).rejects.toHaveProperty(
            "[0].errorText",
            "minMaxError",
          );
        });
      });

      describe("type = array, min = 4", async () => {
        beforeEach(() => {
          api.setFieldRules("numArray", [
            {
              min: 4,
              max: 8,
              type: "array",
              message: "minMaxError",
            },
          ]);
        });

        test("error if field value = undefined", async () => {
          api.setFieldValue("numArray", undefined as any);
          expect(api.validateField("numArray")).rejects.toHaveProperty(
            "[0].errorText",
            "minMaxError",
          );
        });

        test("error if field value = []", async () => {
          api.setFieldValue("numArray", []);
          expect(api.validateField("numArray")).rejects.toHaveProperty(
            "[0].errorText",
            "minMaxError",
          );
        });

        test("error if field value = [1,2,3]", async () => {
          api.setFieldValue("numArray", [1, 2, 3]);
          expect(api.validateField("numArray")).rejects.toHaveProperty(
            "[0].errorText",
            "minMaxError",
          );
        });

        test("no error if field value = [1,2,3,4]", async () => {
          api.setFieldValue("numArray", [1, 2, 3, 4]);
          expect(api.validateField("numArray")).resolves.empty;
        });

        test("no error if field value = [1,2,3,4,5,6,7,8]", async () => {
          api.setFieldValue("numArray", [1, 2, 3, 4, 5, 6, 7, 8]);
          expect(api.validateField("numArray")).resolves.empty;
        });

        test("error if field value = [1,2,3,4,5,6,7,8,9]", async () => {
          api.setFieldValue("numArray", [1, 2, 3, 4, 5, 6, 7, 8, 9]);
          expect(api.validateField("numArray")).rejects.toHaveProperty(
            "[0].errorText",
            "minMaxError",
          );
        });
      });
    });

    describe("email", async () => {
      beforeEach(() => {
        api.setFieldRules("strField", [
          {
            type: "email",
            message: "emailInvalidError",
          },
        ]);
      });

      test("error if value = undefined", async () => {
        api.setFieldValue("strField", undefined as any);
        expect(api.validateField("strField")).rejects.toHaveProperty(
          "[0].errorText",
          "emailInvalidError",
        );
      });

      test("error if value = ''", async () => {
        expect(api.validateField("strField")).rejects.toHaveProperty(
          "[0].errorText",
          "emailInvalidError",
        );
      });

      test('error if "abcd"', async () => {
        api.setFieldValue("strField", "abcd");
        expect(api.validateField("strField")).rejects.toHaveProperty(
          "[0].errorText",
          "emailInvalidError",
        );
      });

      test('error if "abcd@"', async () => {
        api.setFieldValue("strField", "abcd@");
        expect(api.validateField("strField")).rejects.toHaveProperty(
          "[0].errorText",
          "emailInvalidError",
        );
      });

      test('error if "abcd@."', async () => {
        api.setFieldValue("strField", "abcd@.");
        expect(api.validateField("strField")).rejects.toHaveProperty(
          "[0].errorText",
          "emailInvalidError",
        );
      });

      test('error if "abcd@a"', async () => {
        api.setFieldValue("strField", "abcd@a");
        expect(api.validateField("strField")).rejects.toHaveProperty(
          "[0].errorText",
          "emailInvalidError",
        );
      });

      test('error if "a@abc.com"', async () => {
        api.setFieldValue("strField", "abcd@a");
        expect(api.validateField("strField")).rejects.toHaveProperty(
          "[0].errorText",
          "emailInvalidError",
        );
      });

      test('error if "abcd@hostname"', async () => {
        api.setFieldValue("strField", "abcd@hostname");
        expect(api.validateField("strField")).rejects.toHaveProperty(
          "[0].errorText",
          "emailInvalidError",
        );
      });

      test('no error if "abcd@hostname.com"', async () => {
        api.setFieldValue("strField", "abcd@hostname.com");
        expect(api.validateField("strField")).resolves.empty;
      });
    });

    describe("regexp", async () => {
      beforeEach(() => {
        api.setFieldRules("strField", [
          {
            type: "regexp",
            pattern: /[a-z]+/g,
            message: "patternError",
          },
        ]);
      });

      test('error if value "123"', async () => {
        api.setFieldValue("strField", "123");
        expect(api.validateField("strField")).rejects.toHaveProperty(
          "[0].errorText",
          "patternError",
        );
      });

      test('no error if value "abcd"', async () => {
        api.setFieldValue("strField", "abcd");
        expect(api.validateField("strField")).resolves.empty;
      });
    });
  });

  describe("child forms", () => {
    type ParentState = { name: string; address: { city: string; zip: string } };
    let parent: FormApi<ParentState>;
    let child: FormApi<{ city: string; zip: string }>;
    let parentAddon: ChildFormsAddon;

    beforeEach(() => {
      parent = new FormApi<ParentState>({
        name: "",
        address: { city: "", zip: "" },
      });
      child = new FormApi<{ city: string; zip: string }>({
        city: "NY",
        zip: "10001",
      });
      parentAddon = new ChildFormsAddon();
      parent.installAddon(NESTED_FORMS_ADDON_KEY, parentAddon);
    });

    test("getState merges child state", () => {
      parentAddon.addChildForm("address", child);
      expect(parent.getState()).toEqual({
        name: "",
        address: { city: "NY", zip: "10001" },
      });
    });

    test("getState returns own state when no children", () => {
      expect(parent.getState()).toEqual({
        name: "",
        address: { city: "", zip: "" },
      });
    });

    test("cleanup removes child form", () => {
      const cleanup = parentAddon.addChildForm("address", child);
      cleanup();
      expect(parent.getState()).toEqual({
        name: "",
        address: { city: "", zip: "" },
      });
    });

    test("removeChildForm removes child", () => {
      parentAddon.addChildForm("address", child);
      parentAddon.removeChildForm("address");
      expect(parent.getState()).toEqual({
        name: "",
        address: { city: "", zip: "" },
      });
    });

    test("submit returns merged state", async () => {
      parentAddon.addChildForm("address", child);
      const state = await parent.submit();
      expect(state).toEqual({
        name: "",
        address: { city: "NY", zip: "10001" },
      });
    });

    test("submit validates child forms", async () => {
      child.setFieldRules("city", [
        { required: true, message: "City required" },
      ]);
      child.setFieldVisible("city", true);
      child.setFieldValue("city", "");
      parentAddon.addChildForm("address", child);
      await expect(parent.submit()).rejects.toBeDefined();
    });

    test("submit calls onSubmit with merged state", async () => {
      parentAddon.addChildForm("address", child);
      const onSubmit = vi.fn();
      parent.onSubmit(onSubmit);
      await parent.submit();
      expect(onSubmit).toBeCalledWith({
        name: "",
        address: { city: "NY", zip: "10001" },
      });
    });

    test("child onSubmit is not triggered by parent submit", async () => {
      parentAddon.addChildForm("address", child);
      const childOnSubmit = vi.fn();
      child.onSubmit(childOnSubmit);
      await parent.submit();
      expect(childOnSubmit).not.toBeCalled();
    });

    test("recursive nesting works", async () => {
      type MiddleState = { city: string; geo: { lat: number; lng: number } };
      const middle = new FormApi<MiddleState>({
        city: "NY",
        geo: { lat: 0, lng: 0 },
      });
      const inner = new FormApi<{ lat: number; lng: number }>({
        lat: 40,
        lng: -74,
      });
      const middleAddon = new ChildFormsAddon();
      middle.installAddon(NESTED_FORMS_ADDON_KEY, middleAddon);
      middleAddon.addChildForm("geo", inner);
      parentAddon.addChildForm("address", middle);
      const state = await parent.submit();
      expect((state.address as any).geo).toEqual({ lat: 40, lng: -74 });
    });
  });

  describe("createForm with nested forms via withNestedForms addon", () => {
    test("auto-registers child forms and merges state", async () => {
      const AddressForm = createForm({ city: "NY", zip: "10001" });
      const ParentForm = createForm(
        { name: "John" },
        withNestedForms({ address: AddressForm }),
      );

      const state = ParentForm.formApi.getState();
      expect(state).toEqual({
        name: "John",
        address: { city: "NY", zip: "10001" },
      });
    });

    test("submit validates nested createForm children", async () => {
      const AddressForm = createForm({ city: "", zip: "" });
      AddressForm.formApi.setFieldRules("city", [
        { required: true, message: "City required" },
      ]);
      AddressForm.formApi.setFieldVisible("city", true);

      const ParentForm = createForm(
        { name: "John" },
        withNestedForms({ address: AddressForm }),
      );

      await expect(ParentForm.formApi.submit()).rejects.toBeDefined();
    });

    test("submit returns merged state from nested createForm", async () => {
      const AddressForm = createForm({ city: "NY", zip: "10001" });
      const ParentForm = createForm(
        { name: "John" },
        withNestedForms({ address: AddressForm }),
      );

      const onSubmit = vi.fn();
      ParentForm.formApi.onSubmit(onSubmit);
      await ParentForm.formApi.submit();
      expect(onSubmit).toBeCalledWith({
        name: "John",
        address: { city: "NY", zip: "10001" },
      });
    });

    test("type inference resolves nested form state", () => {
      const AddressForm = createForm({ city: "", zip: "" });
      const ParentForm = createForm(
        { name: "" },
        withNestedForms({ address: AddressForm }),
      );

      type State = ReturnType<typeof ParentForm.formApi.getState>;
      expectTypeOf<State>().toEqualTypeOf<{
        name: string;
        address: { city: string; zip: string };
      }>();
    });
  });

  describe("addons", () => {
    test("installAddon / getAddon", () => {
      const addon = {};
      const KEY = Symbol("test");
      api.installAddon(KEY, addon);
      expect(api.getAddon(KEY)).toBe(addon);
    });

    test("onFieldUpdate is called on setFieldValue", () => {
      const KEY = Symbol("test");
      const onFieldUpdate = vi.fn();
      api.installAddon(KEY, { onFieldUpdate });
      api.setFieldValue("strField", "hello");
      expect(onFieldUpdate).toHaveBeenCalledWith("strField", "hello");
    });

    test("onGetState can transform state", () => {
      const KEY = Symbol("test");
      api.installAddon(KEY, {
        onGetState: (state) => ({ ...state, strField: "overridden" }),
      });
      expect(api.getState().strField).toBe("overridden");
    });

    test("getAddonsErrors returns empty when addon returns no errors", async () => {
      const KEY = Symbol("test");
      api.installAddon(KEY, { onValidateFields: async () => [] });
      const errors = await api.getAddonsErrors(["strField"]);
      expect(errors).toEqual([]);
    });

    test("getAddonsErrors returns errors from addon", async () => {
      const KEY = Symbol("test");
      const error = { rule: "required", value: "", errorText: "Required" };
      api.installAddon(KEY, { onValidateFields: async () => [error] });
      const errors = await api.getAddonsErrors(["strField"]);
      expect(errors).toEqual([error]);
    });

    test("getAddonsErrors merges errors from multiple addons", async () => {
      const KEY1 = Symbol("a");
      const KEY2 = Symbol("b");
      const err1 = { rule: "required", value: "", errorText: "Err1" };
      const err2 = { rule: "min", value: "", errorText: "Err2" };
      api.installAddon(KEY1, { onValidateFields: async () => [err1] });
      api.installAddon(KEY2, { onValidateFields: async () => [err2] });
      const errors = await api.getAddonsErrors(["strField"]);
      expect(errors).toEqual([err1, err2]);
    });

    test("validateFields throws when addon returns errors", async () => {
      const KEY = Symbol("test");
      const error = { rule: "custom", value: "", errorText: "Addon error" };
      api.installAddon(KEY, { onValidateFields: async () => [error] });
      api.setFieldVisible("strField", true);
      await expect(api.validateFields()).rejects.toContainEqual(error);
    });

    describe("new lifecycle hooks", () => {
      test("onReset is called after resetFields with reset state", () => {
        const KEY = Symbol("test");
        const onReset = vi.fn();
        api.installAddon(KEY, { onReset });
        api.setFieldValue("strField", "changed");
        api.resetFields();
        expect(onReset).toHaveBeenCalledWith(expect.objectContaining({ strField: "" }));
      });

      test("onFieldVisible is called with true when field becomes visible", () => {
        const KEY = Symbol("test");
        const onFieldVisible = vi.fn();
        api.installAddon(KEY, { onFieldVisible });
        api.setFieldVisible("strField", true);
        expect(onFieldVisible).toHaveBeenCalledWith("strField", true);
      });

      test("onFieldVisible is called with false when field becomes invisible", () => {
        const KEY = Symbol("test");
        const onFieldVisible = vi.fn();
        api.installAddon(KEY, { onFieldVisible });
        api.setFieldVisible("strField", false);
        expect(onFieldVisible).toHaveBeenCalledWith("strField", false);
      });

      test("onSubmit is called after successful submit with form state", async () => {
        const KEY = Symbol("test");
        const onSubmit = vi.fn();
        api.installAddon(KEY, { onSubmit });
        await api.submit();
        expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ strField: "" }));
      });

      test("onSubmit is NOT called when validation fails", async () => {
        const KEY = Symbol("test");
        const onSubmit = vi.fn();
        api.installAddon(KEY, { onSubmit });
        api.setFieldVisible("strField", true);
        api.setFieldRules("strField", [{ required: true, message: "Required" }]);
        await expect(api.submit()).rejects.toBeDefined();
        expect(onSubmit).not.toHaveBeenCalled();
      });

      test("onValidationError is called when field has a validation error", async () => {
        const KEY = Symbol("test");
        const onValidationError = vi.fn();
        api.installAddon(KEY, { onValidationError });
        api.setFieldVisible("strField", true);
        api.setFieldRules("strField", [{ required: true, message: "Required" }]);
        await api.getFieldError("strField");
        expect(onValidationError).toHaveBeenCalledWith(
          "strField",
          expect.arrayContaining([expect.objectContaining({ errorText: "Required" })]),
        );
      });

      test("onSetInitialState is called after setInitialState with the new state", () => {
        const KEY = Symbol("test");
        const onSetInitialState = vi.fn();
        api.installAddon(KEY, { onSetInitialState });
        const newState = { strField: "new", numField: 42, boolField: true, strArray: [], numArray: [] };
        api.setInitialState(newState);
        expect(onSetInitialState).toHaveBeenCalledWith(expect.objectContaining({ strField: "new", numField: 42 }));
      });
    });
  });
});
