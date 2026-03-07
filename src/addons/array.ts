import React, { useEffect, useState } from "react";
import FormArrayItem, { FormArrayItemProps } from "../FormArrayItem";
import { useArrayField } from "../FormArrayItem";
import { FormApi } from "../FormApi";
import { ArrayOnly, ArrayOnlyFields, FormApiGenericTypes } from "../typesHelpers";
import { ArrayItemError, FormAddon, ValidationRule, ValidationStatus } from "../types";

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
  const [status, setStatus] = useState<ValidationStatus>(() =>
    form.getArrayItemErrors(field).length > 0 ? "error" : "notStarted",
  );

  useEffect(() => {
    return form.onArrayItemError(field, (errors) => {
      setErrors(errors);
      setStatus(errors.length > 0 ? "error" : "success");
    });
  }, [field, form]);

  return { errors, status };
};

export type ArrayFieldsAddon = FormAddon<Record<never, never>> & {
  readonly _addonType: "array";
};

export function withArrayFields(): ArrayFieldsAddon {
  return {
    _addonType: "array" as const,
    _addonState: {} as Record<never, never>,
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
