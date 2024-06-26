import { FormApi } from "@/FormApi";
import { useFormContext } from "@/FormContext";
import { FieldUpdate, ValidationRule } from "@/types";
import { useField } from "@/useForm";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

export const useInitField = <Value, T extends string = string>(formApi: FormApi<any>, field: T, rules?: ValidationRule<Value>[]) => {
  useIsomorphicLayoutEffect(() => {
    if (rules) {
      formApi.setFieldRules(field, rules);
    }

    // Init with undefined
    if (!(field in formApi.getState())) {
      formApi.setFieldValue(field, undefined);
    }

    formApi.setFieldVisible(field, true);

    return () => {
      formApi.setFieldVisible(field, false);
    }
    // reset maybe?
  }, [field, formApi, rules])
}

export const useFieldData = <Value, T extends string = string>(field: T, rules?: ValidationRule<Value>[]) => {
  const { formApi, formId, CSSPrefix } = useFormContext()
  const [value, setValue] = useField(formApi, field);

  useInitField(formApi, field, rules);

  return {
    value: value as Value,
    setValue: setValue as (value: FieldUpdate<Value>) => void,
    id: formId ? `${formId}:${field}` : undefined,
    CSSPrefix,
  };
};
