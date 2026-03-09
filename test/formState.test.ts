import { beforeEach, describe, expect, test, vi } from "vitest";
import { FormApi } from "../src/FormApi";
import { FormStatePlugin, withFormState } from "../src/addons/formState";
import { FORM_STATE_ADDON_KEY } from "../src/addons/addonKeys";
import { ValidationRule } from "../src";

const makeState = () => ({ name: "", email: "", age: 0 });

describe("FormStatePlugin", () => {
  let api: FormApi<ReturnType<typeof makeState>>;
  let plugin: FormStatePlugin;

  beforeEach(() => {
    api = new FormApi(makeState());
    withFormState()._setup!(api as FormApi<Record<string, unknown>>);
    plugin = api.getAddon<FormStatePlugin>(FORM_STATE_ADDON_KEY)!;
  });

  describe("isDirty", () => {
    test("false by default", () => {
      expect(plugin.getSnapshot().isDirty).toBe(false);
    });

    test("true after field change", () => {
      api.setFieldValue("name", "Alice");
      expect(plugin.getSnapshot().isDirty).toBe(true);
    });

    test("false after resetting to initial value", () => {
      api.setFieldValue("name", "Alice");
      api.setFieldValue("name", "");
      expect(plugin.getSnapshot().isDirty).toBe(false);
    });

    test("false after resetFields()", () => {
      api.setFieldValue("name", "Alice");
      api.resetFields();
      expect(plugin.getSnapshot().isDirty).toBe(false);
    });
  });

  describe("dirtyFields", () => {
    test("empty by default", () => {
      expect(plugin.getSnapshot().dirtyFields).toEqual([]);
    });

    test("contains changed field", () => {
      api.setFieldValue("name", "Alice");
      expect(plugin.getSnapshot().dirtyFields).toContain("name");
      expect(plugin.getSnapshot().dirtyFields).not.toContain("email");
    });

    test("multiple dirty fields", () => {
      api.setFieldValue("name", "Alice");
      api.setFieldValue("email", "alice@example.com");
      const { dirtyFields } = plugin.getSnapshot();
      expect(dirtyFields).toContain("name");
      expect(dirtyFields).toContain("email");
    });

    test("field removed from dirtyFields when restored to initial", () => {
      api.setFieldValue("name", "Alice");
      api.setFieldValue("name", "");
      expect(plugin.getSnapshot().dirtyFields).not.toContain("name");
    });
  });

  describe("touchedFields", () => {
    test("empty by default", () => {
      expect(plugin.getSnapshot().touchedFields).toEqual([]);
    });

    test("accumulates fields on interaction", () => {
      api.setFieldValue("name", "Alice");
      expect(plugin.getSnapshot().touchedFields).toContain("name");
    });

    test("keeps field touched even after restoring initial value", () => {
      api.setFieldValue("name", "Alice");
      api.setFieldValue("name", "");
      expect(plugin.getSnapshot().touchedFields).toContain("name");
    });

    test("clears on resetFields()", () => {
      api.setFieldValue("name", "Alice");
      api.resetFields();
      expect(plugin.getSnapshot().touchedFields).toEqual([]);
    });

    test("clears on setInitialState()", () => {
      api.setFieldValue("name", "Alice");
      api.setInitialState({ name: "Bob", email: "", age: 0 });
      expect(plugin.getSnapshot().touchedFields).toEqual([]);
    });
  });

  describe("isSubmitting", () => {
    test("false by default", () => {
      expect(plugin.getSnapshot().isSubmitting).toBe(false);
    });

    test("true during submit, false after", async () => {
      const states: boolean[] = [];
      plugin.subscribe(() => {
        states.push(plugin.getSnapshot().isSubmitting);
      });
      await api.submit();
      expect(states).toContain(true);
      expect(plugin.getSnapshot().isSubmitting).toBe(false);
    });

    test("false after failed submit (validation error)", async () => {
      const rule: ValidationRule = { required: true, message: "Required" };
      api.setFieldRules("name", [rule]);
      api.setFieldVisible("name", true);
      try {
        await api.submit();
      } catch {
        // expected
      }
      expect(plugin.getSnapshot().isSubmitting).toBe(false);
    });
  });

  describe("isValid", () => {
    test("true by default (no errors)", () => {
      expect(plugin.getSnapshot().isValid).toBe(true);
    });

    test("false after validation error", async () => {
      const rule: ValidationRule = {
        required: true,
        message: "Required",
        validateTrigger: ["onFinish"],
      };
      api.setFieldRules("name", [rule]);
      api.setFieldVisible("name", true);
      await api.getFieldsError(["name"]);
      expect(plugin.getSnapshot().isValid).toBe(false);
    });

    test("true after fixing field with error", async () => {
      const rule: ValidationRule = {
        required: true,
        message: "Required",
        validateTrigger: ["onFinish"],
      };
      api.setFieldRules("name", [rule]);
      api.setFieldVisible("name", true);
      await api.getFieldsError(["name"]);
      expect(plugin.getSnapshot().isValid).toBe(false);
      api.setFieldValue("name", "Alice");
      expect(plugin.getSnapshot().isValid).toBe(true);
    });
  });

  describe("subscribe", () => {
    test("subscriber notified on field update", () => {
      const cb = vi.fn();
      plugin.subscribe(cb);
      api.setFieldValue("name", "Alice");
      expect(cb).toHaveBeenCalled();
    });

    test("unsubscribe stops notifications", () => {
      const cb = vi.fn();
      const unsub = plugin.subscribe(cb);
      unsub();
      api.setFieldValue("name", "Alice");
      expect(cb).not.toHaveBeenCalled();
    });
  });

  describe("getFieldSnapshot / useFieldState", () => {
    test("isTouched false by default, true after interaction", () => {
      expect(plugin.getFieldSnapshot("name").isTouched).toBe(false);
      api.setFieldValue("name", "Alice");
      expect(plugin.getFieldSnapshot("name").isTouched).toBe(true);
      expect(plugin.getFieldSnapshot("email").isTouched).toBe(false);
    });

    test("isDirty false by default, true after change", () => {
      expect(plugin.getFieldSnapshot("name").isDirty).toBe(false);
      api.setFieldValue("name", "Alice");
      expect(plugin.getFieldSnapshot("name").isDirty).toBe(true);
    });

    test("isDirty false when value restored to initial", () => {
      api.setFieldValue("name", "Alice");
      api.setFieldValue("name", "");
      expect(plugin.getFieldSnapshot("name").isDirty).toBe(false);
    });

    test("isValid false after validation error on that field", async () => {
      const rule: ValidationRule = {
        required: true,
        message: "Required",
        validateTrigger: ["onFinish"],
      };
      api.setFieldRules("name", [rule]);
      api.setFieldVisible("name", true);
      await api.getFieldsError(["name"]);
      expect(plugin.getFieldSnapshot("name").isValid).toBe(false);
      expect(plugin.getFieldSnapshot("email").isValid).toBe(true);
    });

    test("isValid true after fixing field", async () => {
      const rule: ValidationRule = {
        required: true,
        message: "Required",
        validateTrigger: ["onFinish"],
      };
      api.setFieldRules("name", [rule]);
      api.setFieldVisible("name", true);
      await api.getFieldsError(["name"]);
      api.setFieldValue("name", "Alice");
      expect(plugin.getFieldSnapshot("name").isValid).toBe(true);
    });

    test("returns same object reference when field state unchanged", () => {
      api.setFieldValue("name", "Alice");
      const snap1 = plugin.getFieldSnapshot("email");
      api.setFieldValue("name", "Bob"); // email didn't change
      const snap2 = plugin.getFieldSnapshot("email");
      expect(snap1).toBe(snap2); // same reference
    });

    test("clears isTouched and isDirty on resetFields", () => {
      api.setFieldValue("name", "Alice");
      api.resetFields();
      expect(plugin.getFieldSnapshot("name").isTouched).toBe(false);
      expect(plugin.getFieldSnapshot("name").isDirty).toBe(false);
    });
  });

  describe("setInitialState updates baseline", () => {
    test("new initial state becomes dirty baseline", () => {
      api.setInitialState({ name: "Alice", email: "", age: 0 });
      expect(plugin.getSnapshot().isDirty).toBe(false);
      api.setFieldValue("name", "Bob");
      expect(plugin.getSnapshot().isDirty).toBe(true);
      expect(plugin.getSnapshot().dirtyFields).toContain("name");
    });
  });
});
