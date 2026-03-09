import React, { useEffect, useState } from "react";
import FormArrayItem, { FormArrayItemProps } from "../FormArrayItem";
import { useArrayField } from "../FormArrayItem";
import { FormApi } from "../FormApi";
import { AddonExtensionHKT, ArrayOnly, ArrayOnlyFields, FormApiGenericTypes } from "../typesHelpers";
import { ArrayItemError, ArrayItemProps, FieldUpdateCb, FormAddon, FormApiPlugin, IArrayPlugin, ValidationError, ValidationRule, ValidationStatus, ValidateTrigger } from "../types";
import { ARRAY_PLUGIN_KEY } from "../pluginKeys";
import { getValidationErrors, prepareRules } from "../helpers/getValidationErrors";

export class ArrayItemsPlugin implements FormApiPlugin, IArrayPlugin {
  private rules = new Map<string, ValidationRule<unknown>[]>();
  private errors = new Map<string, ArrayItemError<unknown>[]>();
  private subs = new Map<string, ((errors: ArrayItemError<unknown>[]) => void)[]>();

  constructor(private readonly formApi: FormApi<Record<string, unknown>>) {}

  onFieldUpdate(field: string) {
    if (this.errors.has(field)) {
      this.errors.delete(field);
      this.subs.get(field)?.forEach(cb => cb([]));
    }
  }

  onGetState(state: Record<string, unknown>) {
    return state;
  }

  async onValidateFields(fields: string[], trigger?: ValidateTrigger): Promise<ValidationError[]> {
    const results = await Promise.all(fields.map(f => this.validateArrayItems(f, trigger)));
    return results.flat().map(itemError => ({
      rule: itemError.errors[0]?.rule ?? {} as ValidationRule,
      value: itemError.errors[0]?.value,
      errorText: `Item ${itemError.index}: ${itemError.errors.map(e => e.errorText).join(', ')}`,
    })) as ValidationError[];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setArrayItemRules(field: string, rules: ValidationRule<any>[]) {
    this.rules.set(field, rules);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onArrayItemError(field: string, cb: (errors: ArrayItemError<any>[]) => void): () => void {
    const subs = this.subs.get(field) ?? [];
    this.subs.set(field, [...subs, cb]);
    return () => {
      this.subs.set(field, this.subs.get(field)?.filter(s => s !== cb) ?? []);
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getArrayItemErrors(field: string): ArrayItemError<any>[] {
    return this.errors.get(field) ?? [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async validateArrayItems(field: string, trigger?: ValidateTrigger): Promise<ArrayItemError<any>[]> {
    const rules = this.rules.get(field);
    const value = this.formApi.getFieldValue(field as never);
    const state = this.formApi.getFieldsValue() as Record<string, unknown>;

    if (!rules || !Array.isArray(value)) {
      return [];
    }

    const preparedRules = prepareRules(rules, trigger);

    if (preparedRules.length === 0) {
      return [];
    }

    const itemErrors = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (value as any[]).map(async (item, index) => {
        const validationErrors = await getValidationErrors(item, preparedRules, state);
        if (validationErrors.length > 0) {
          return { index, errors: validationErrors };
        }
        return null;
      })
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors = itemErrors.filter((e): e is ArrayItemError<any> => e !== null);

    if (errors.length > 0) {
      this.errors.set(field, errors);
      this.subs.get(field)?.forEach(cb => cb(errors));
    } else {
      this.errors.delete(field);
      this.subs.get(field)?.forEach(cb => cb([]));
    }

    return errors;
  }
}

const useArrayFieldValidation = <
  Form extends FormApi<any>,
  Types extends FormApiGenericTypes<Form> = FormApiGenericTypes<Form>,
  State extends Types["state"] = Types["state"],
  Field extends ArrayOnlyFields<State> = ArrayOnlyFields<State>,
>(
  form: Form,
  field: Field,
) => {
  const [errors, setErrors] = useState(
    [] as ArrayItemError<State[Field][number]>[],
  );
  const [status, setStatus] = useState<ValidationStatus>(() => {
    const plugin = form.getPlugin<IArrayPlugin>(ARRAY_PLUGIN_KEY);
    return (plugin?.getArrayItemErrors(field as string).length ?? 0) > 0 ? "error" : "notStarted";
  });

  useEffect(() => {
    return form.getPlugin<IArrayPlugin>(ARRAY_PLUGIN_KEY)?.onArrayItemError(field as string, (errors) => {
      setErrors(errors);
      setStatus(errors.length > 0 ? "error" : "success");
    }) ?? (() => {});
  }, [field, form]);

  return { errors, status };
};

/** The array-specific properties added to the compound form when `withArrayFields()` is passed. */
export type ArrayCompoundFormExtension<State extends Record<string, unknown>> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ArrayItem: <T extends ArrayOnlyFields<State>>(
    props: FormArrayItemProps<T, ArrayOnly<State[T]>>,
  ) => React.ReactElement;
  useArrayField: <T extends ArrayOnlyFields<State>>(
    field: T,
    rules?: ValidationRule<State[T]>[],
    itemRules?: ValidationRule<ArrayOnly<State[T]>[number]>[],
  ) => {
    value: State[T];
    errors: ValidationError<State[T]>[];
    items: ArrayItemProps<ArrayOnly<State[T]>[number]>[];
    itemErrors: ArrayItemError<ArrayOnly<State[T]>[number]>[];
    append: (value: ArrayOnly<State[T]>[number]) => void;
    prepend: (value: ArrayOnly<State[T]>[number]) => void;
    remove: (index: number) => void;
    move: (from: number, to: number) => void;
    update: (
      index: number,
      value:
        | ArrayOnly<State[T]>[number]
        | FieldUpdateCb<ArrayOnly<State[T]>[number]>,
    ) => void;
  };
  useArrayFieldValidation: <T extends ArrayOnlyFields<State>>(
    field: T,
  ) => {
    errors: ArrayItemError<ArrayOnly<State[T]>[number]>[];
    status: ValidationStatus;
  };
};

/** HKT that maps a form state type to the array compound-form extension. */
export interface ArrayExtensionHKT extends AddonExtensionHKT {
  readonly type: ArrayCompoundFormExtension<this['_State']>;
}

export type ArrayFieldsAddon = FormAddon<Record<never, never>, ArrayExtensionHKT>;

export function withArrayFields(): ArrayFieldsAddon {
  return {
    _addonType: "array" as const,
    _addonState: {} as Record<never, never>,
    _setup(formApi: FormApi<any>) {
      formApi.installPlugin(ARRAY_PLUGIN_KEY, new ArrayItemsPlugin(formApi));
    },
    _extend(compoundForm: any, form: FormApi<any>) {
      type State = ReturnType<typeof form.getState>;

      const ArrayItemComponent = <T extends ArrayOnlyFields<State>>(
        props: FormArrayItemProps<T, ArrayOnly<State[T]>>,
      ) => React.createElement(FormArrayItem as any, props);

      const useArrayFieldHook = <T extends ArrayOnlyFields<State>>(
        field: T,
        rules?: ValidationRule<State[T]>[],
        itemRules?: ValidationRule<ArrayOnly<State[T]>[number]>[],
      ) => useArrayField(form, field, rules, itemRules);

      const useArrayFieldValidationHook = <T extends ArrayOnlyFields<State>>(
        field: T,
      ) => useArrayFieldValidation(form, field);

      compoundForm.ArrayItem = ArrayItemComponent;
      compoundForm.useArrayField = useArrayFieldHook;
      compoundForm.useArrayFieldValidation = useArrayFieldValidationHook;
    },
  };
}
