import React, { memo, useCallback, useEffect, useMemo, useState } from "react"
import FormItem, { FormItemProps } from "../../FormItem"
import { ArrayItemError, FieldUpdate, FieldUpdateCb, IArrayAddon, ItemSchemaResolver, ValidationError, ValidationRule, ValidationStatus } from "../../types"
import type { FormArrayAPI } from "../../types"
import { useField, useFieldValidation } from "../../useForm"
import { FormApi } from "../../FormApi"
import { ArrayOnlyFields, FormApiGenericTypes } from "../../typesHelpers"
import { useFormInstance } from "../../FormContext"
import { useInitField } from "../../helpers/useFieldData"
import { ARRAY_ADDON_KEY } from "../addonKeys"

export const useArrayField = <
  Form extends FormApi<any>,
  Types extends FormApiGenericTypes<Form> = FormApiGenericTypes<Form>,
  State extends Types['state'] = Types['state'],
  Field extends ArrayOnlyFields<State> = ArrayOnlyFields<State>,
>(form: Form, field: Field, options?: {
  rules?: ValidationRule<State[Field]>[];
  itemRules?: ValidationRule<State[Field][number]>[];
  schema?: ItemSchemaResolver<State[Field][number]>;
}) => {
  const [value, setValue] = useField(form, field);
  const [itemErrors, setItemErrors] = useState<ArrayItemError<State[Field][number]>[]>([]);
  const { status: fieldValidationStatus, errors } = useFieldValidation(form, field);

  useInitField(form, field, options?.rules);

  const effectiveItemRules = useMemo(() => {
    if (!options?.schema) return options?.itemRules;
    const schemaRule: ValidationRule = {
      validateTrigger: options.schema.validateTrigger ?? ['onSubmit'],
      validator: async (value: unknown) => {
        const errs = await options.schema!._validate(value as State[Field][number]);
        if (errs.length > 0) throw new Error(errs.join(', '));
      },
    } as unknown as ValidationRule;
    return [...(options?.itemRules ?? []), schemaRule];
  }, [options?.itemRules, options?.schema]);

  // Set array item validation rules
  useEffect(() => {
    if (effectiveItemRules) {
      form.getAddon<IArrayAddon>(ARRAY_ADDON_KEY)?.setArrayItemRules(field as string, effectiveItemRules);
    }
  }, [form, field, effectiveItemRules]);

  // Subscribe to array item errors
  useEffect(() => {
    return form.getAddon<IArrayAddon>(ARRAY_ADDON_KEY)?.onArrayItemError(field as string, (errors) => {
      setItemErrors(errors);
    }) ?? (() => {});
  }, [form, field]);

  const schema = options?.schema;

  const triggerOnChangeValidation = useCallback(() => {
    form.getFieldError(field, 'onChange');
    form.getAddon<IArrayAddon>(ARRAY_ADDON_KEY)?.validateArrayItems(field as string, 'onChange');
  }, [form, field]);

  const validateItem = useCallback(async (itemValue: State[Field][number]) => {
    if (!schema) return;
    const errs = await schema._validate(itemValue);
    if (errs.length > 0) throw new Error(errs.join(', '));
  }, [schema]);

  const append = useCallback(async (itemValue: State[Field][number]) => {
    await validateItem(itemValue);
    setValue?.(fields => fields.concat(itemValue));
    triggerOnChangeValidation();
  }, [setValue, triggerOnChangeValidation, validateItem]);

  const prepend = useCallback(async (itemValue: State[Field][number]) => {
    await validateItem(itemValue);
    setValue?.(fields => [itemValue].concat(fields));
    triggerOnChangeValidation();
  }, [setValue, triggerOnChangeValidation, validateItem]);

  const insert = useCallback(async (index: number, itemValue: State[Field][number]) => {
    await validateItem(itemValue);
    setValue?.(fields => fields.toSpliced(index, 0, itemValue) as State[Field]);
    triggerOnChangeValidation();
  }, [setValue, triggerOnChangeValidation, validateItem]);

  const remove = useCallback((index: number) => {
    setValue?.(fields => fields.toSpliced(index, 1) as State[Field]);
    triggerOnChangeValidation();
  }, [setValue, triggerOnChangeValidation]);

  const update = useCallback(async (index: number, itemValue: State[Field][number] | FieldUpdateCb<State[Field][number]>) => {
    const resolved = typeof itemValue === 'function'
      ? (itemValue as FieldUpdateCb<State[Field][number]>)((value as State[Field])[index])
      : itemValue;
    await validateItem(resolved);
    setValue?.(fields => fields.with(index, resolved) as State[Field]);
    triggerOnChangeValidation();
  }, [value, setValue, triggerOnChangeValidation, validateItem]);

  // Inline editing in items — no schema blocking, errors shown via itemErrors
  const updateItem = useCallback((index: number, itemValue: State[Field][number]) => {
    setValue?.(fields => fields.with(index, itemValue) as State[Field]);
    triggerOnChangeValidation();
  }, [setValue, triggerOnChangeValidation]);

  const move = useCallback((from: number, to: number) => {
    setValue?.(fields => {
      const movedItem = fields[from];
      const withoutItem = fields.toSpliced(from, 1);
      return withoutItem.toSpliced(to, 0, movedItem);
    });
    triggerOnChangeValidation();
  }, [setValue, triggerOnChangeValidation]);

  const items = useMemo(
    () => (value as State[Field]).map((item: State[Field][number], index: number) => {
      const itemError = itemErrors.find(e => e.index === index);
      const itemValidationStatus: ValidationStatus =
        fieldValidationStatus === 'notStarted' || fieldValidationStatus === 'validating'
          ? fieldValidationStatus
          : itemError ? 'error' : 'success';
      return {
        value: item,
        index,
        onChange: (newValue: State[Field][number]) => updateItem(index, newValue),
        errors: itemError?.errors ?? [],
        validationStatus: itemValidationStatus,
      };
    }),
    [value, itemErrors, updateItem, fieldValidationStatus],
  );

  return {
    value,
    errors,
    items,
    itemErrors,
    append,
    prepend,
    insert,
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
  schema?: ItemSchemaResolver<Value[number]>
}

const FormArrayItem = <FieldName extends string = string, Value extends unknown[] = unknown[]>({ children, itemRules, schema, ...props }: FormArrayItemProps<FieldName, Value>) => {
  const form = useFormInstance();
  const formArray = useArrayField(form, props.name, { rules: props.rules, itemRules, schema });

  return <FormItem {...props}>
    {({ errors, validationStatus }) => children({ ...formArray, errors: errors as ValidationError<Value>[], validationStatus })}
  </FormItem>
}

export default memo(FormArrayItem) as typeof FormArrayItem
