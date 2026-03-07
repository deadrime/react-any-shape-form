import React, { memo, useCallback, useEffect, useMemo, useState } from "react"
import FormItem, { FormItemProps } from "./FormItem"
import { ArrayItemError, FieldUpdate, FieldUpdateCb, IArrayPlugin, ValidationError, ValidationRule, ValidationStatus } from "./types"
import type { FormArrayAPI } from "./types"
import { useField, useFieldValidation } from "./useForm"
import { FormApi } from "./FormApi"
import { ArrayOnlyFields, FormApiGenericTypes } from "./typesHelpers"
import { useFormInstance } from "./FormContext"
import { useInitField } from "./helpers/useFieldData"
import { ARRAY_PLUGIN_KEY } from "./pluginKeys"

export const useArrayField = <
  Form extends FormApi<any>,
  Types extends FormApiGenericTypes<Form> = FormApiGenericTypes<Form>,
  State extends Types['state'] = Types['state'],
  Field extends ArrayOnlyFields<State> = ArrayOnlyFields<State>,
>(form: Form, field: Field, rules?: ValidationRule<State[Field]>[], itemRules?: ValidationRule<State[Field][number]>[]) => {
  const [value, setValue] = useField(form, field);
  const [itemErrors, setItemErrors] = useState<ArrayItemError<State[Field][number]>[]>([]);
  const { status: fieldValidationStatus, errors } = useFieldValidation(form, field);

  useInitField(form, field, rules);

  // Set array item validation rules
  useEffect(() => {
    if (itemRules) {
      form.getPlugin<IArrayPlugin>(ARRAY_PLUGIN_KEY)?.setArrayItemRules(field as string, itemRules);
    }
  }, [form, field, itemRules]);

  // Subscribe to array item errors
  useEffect(() => {
    return form.getPlugin<IArrayPlugin>(ARRAY_PLUGIN_KEY)?.onArrayItemError(field as string, (errors) => {
      setItemErrors(errors);
    }) ?? (() => {});
  }, [form, field]);

  const triggerOnChangeValidation = useCallback(() => {
    form.getFieldError(field, 'onChange');
    form.getPlugin<IArrayPlugin>(ARRAY_PLUGIN_KEY)?.validateArrayItems(field as string, 'onChange');
  }, [form, field]);

  const append = useCallback((value: State[Field][number]) => {
    setValue?.(fields => fields.concat(value));
    triggerOnChangeValidation();
  }, [setValue, triggerOnChangeValidation])

  const prepend = useCallback((value: State[Field][number]) => {
    setValue?.(fields => [value].concat(fields));
    triggerOnChangeValidation();
  }, [setValue, triggerOnChangeValidation])

  const remove = useCallback((index: number) => {
    setValue?.(fields => fields.toSpliced(index, 1) as State[Field]);
    triggerOnChangeValidation();
  }, [setValue, triggerOnChangeValidation])

  const update = useCallback((index: number, value: State[Field][number] | FieldUpdateCb<State[Field][number]>) => {
    setValue?.(fields => fields.with(index, typeof value === 'function' ? (value as FieldUpdateCb<State[Field][number]>)(fields[index]) : value) as State[Field]);
    triggerOnChangeValidation();
  }, [setValue, triggerOnChangeValidation])

  const move = useCallback((from: number, to: number) => {
    setValue?.(fields => {
      const movedItem = fields[from];
      const withoutItem = fields.toSpliced(from, 1);
      return withoutItem.toSpliced(to, 0, movedItem);
    });
    triggerOnChangeValidation();
  }, [setValue, triggerOnChangeValidation])

  const items = useMemo(
    () => (value as State[Field]).map((item, index) => {
      const itemError = itemErrors.find(e => e.index === index);
      const itemValidationStatus: ValidationStatus =
        fieldValidationStatus === 'notStarted' || fieldValidationStatus === 'validating'
          ? fieldValidationStatus
          : itemError ? 'error' : 'success';
      return {
        value: item,
        index,
        onChange: (newValue: State[Field][number]) => update(index, newValue),
        errors: itemError?.errors ?? [],
        validationStatus: itemValidationStatus,
      };
    }),
    [value, itemErrors, update, fieldValidationStatus],
  );

  return {
    value,
    errors,
    items,
    itemErrors,
    append,
    prepend,
    remove,
    move,
    update,
  }
}

export type FormArrayItemProps<FieldName extends string = string, Value extends unknown[] = unknown[]> = Omit<FormItemProps<FieldName, Value>, 'children' | 'onChange'> & {
  children: (props: FormArrayAPI<Value>) => React.ReactElement
  value?: Value
  onChange?: (value: FieldUpdate<Value>, event?: unknown) => unknown
  itemRules?: ValidationRule<Value[number]>[]
}

const FormArrayItem = <FieldName extends string = string, Value extends unknown[] = unknown[]>({ children, itemRules, ...props }: FormArrayItemProps<FieldName, Value>) => {
  const form = useFormInstance();
  const formArray = useArrayField(form, props.name, props.rules, itemRules);

  return <FormItem {...props}>
    {({ errors, validationStatus }) => children({ ...formArray, errors: errors as ValidationError<Value>[], validationStatus })}
  </FormItem>
}

export default memo(FormArrayItem) as typeof FormArrayItem
