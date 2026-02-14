import React, { useCallback, useRef, memo } from "react";
import { useDebounce } from "react-use";
import { useFormContext } from "./FormContext";
import { ValidationRule, ValidationStatus, ValidationError } from "./types";
import { useFieldValidation } from "./useForm";
import { useFieldData } from "./helpers/useFieldData";

export type FormItemChildrenProps<V = any> = {
  value: V;
  onChange: (value: V) => unknown;
  validationStatus?: ValidationStatus;
  errors: ValidationError<V>[];
  id?: string;
};

type FormItemChildren<V = any> = (
  props: FormItemChildrenProps<V>,
) => React.ReactNode;

export type FormItemProps<
  FieldName extends string = string,
  Value = unknown,
  Children extends FormItemChildren<Value> = FormItemChildren<Value>,
> = {
  children: Children;
  name: FieldName;
  rules?: ValidationRule<Value>[];
  onChange?: (value: Value) => unknown;
  onInvalid?: (error: ValidationError[], value: Value) => void;
  id?: string;
  validationDebounceDelay?: number;
};

const FormItem = <
  Value,
  FieldName extends string = string,
  Children extends FormItemChildren = FormItemChildren,
>(
  props: FormItemProps<FieldName, Value, Children>,
) => {
  const {
    children,
    name,
    rules = [],
    onChange,
    onInvalid,
    id: idFromProps,
    validationDebounceDelay = 300,
  } = props;
  const { formApi, onFieldChange } = useFormContext();
  const { value, setValue, id } = useFieldData<Value>(name, rules);
  const { errors, status } = useFieldValidation(formApi, name);
  const formItemId = idFromProps || id;
  const stateRef = useRef<{ valueChanged: boolean }>({ valueChanged: false });

  useDebounce(
    () => {
      if (!stateRef?.current.valueChanged) {
        return;
      }
      formApi.getFieldError(name, "onChange").then((validationErrors) => {
        if (validationErrors.length > 0) {
          onInvalid?.(validationErrors, value);
        }
      });
    },
    validationDebounceDelay,
    [value, formApi.validateField],
  );

  const handleChange = useCallback(
    async (value: Value) => {
      stateRef.current.valueChanged = true;
      setValue(value);
      onChange?.(value);
      onFieldChange?.(name, value);
    },
    [setValue, onChange, onFieldChange, name],
  );

  return children?.({
    value,
    onChange: handleChange,
    validationStatus: status,
    errors: errors as ValidationError<Value>[],
    id: formItemId,
  })
};

FormItem.displayName = "FormItem";

export default memo(FormItem) as typeof FormItem;
