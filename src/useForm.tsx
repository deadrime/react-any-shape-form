import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { FormApi } from "./FormApi";
import { FormApiGenericTypes, ArrayOnly, ArrayOnlyFields, CompoundFormLike, ResolveState } from "./typesHelpers";
import { FieldUpdate, ValidationRule, ValidationError } from "./types";
import { Form, FormProps } from "./Form";
import FormItem, { FormItemProps } from "./FormItem";
import FormArrayItem, { FormArrayItemProps, useArrayField } from "./FormArrayItem";

export const useCreateForm = <State extends Record<string, unknown>>(initialState: State) => {
  const formApiRef = React.useRef<FormApi<State>>(new FormApi(initialState));

  return [formApiRef.current] as const
}

const isCompoundForm = (value: unknown): value is CompoundFormLike =>
  value !== null && (typeof value === 'object' || typeof value === 'function') && 'formApi' in value && value.formApi instanceof FormApi

export const createForm = <State extends Record<string, unknown>>(initialState: State) => {
  type Resolved = ResolveState<State>;

  const resolvedInitial = {} as Record<string, unknown>;
  const childEntries: [string, FormApi<any>][] = [];

  for (const [key, value] of Object.entries(initialState)) {
    if (isCompoundForm(value)) {
      resolvedInitial[key] = value.formApi.getState();
      childEntries.push([key, value.formApi]);
    } else {
      resolvedInitial[key] = value;
    }
  }

  const form = new FormApi(resolvedInitial as Resolved);

  for (const [key, childFormApi] of childEntries) {
    form.addChildForm(key as FormApiGenericTypes<typeof form>['field'], childFormApi);
  }

  type Types = FormApiGenericTypes<typeof form>;

  type ArrayFields = ArrayOnlyFields<Types['state']>;

  const FormComponent = (props: FormProps<Types['state'], FormApi<Types['state']>>) =>
    <Form form={form} {...props} />

  const FormItemComponent = <T extends Types['field']>(props: FormItemProps<T, Types['state'][T]>) => <FormItem {...props} />

  const ArrayItemComponent = <T extends ArrayFields>(props: FormArrayItemProps<T, ArrayOnly<Types['state'][T]>>) => <FormArrayItem {...props} />

  const useWatchHook = <T extends Types['field']>(field: T) => useWatch(form, field)

  const useFieldHook = <T extends Types['field']>(field: T) => useField(form, field)

  const useFieldErrorsHook = <T extends Types['field']>(field: T) => useFieldValidation(form, field)

  const useArrayFieldHook = <T extends ArrayFields>(field: T, rules?: ValidationRule<Types['state'][T]>[]) => useArrayField(form, field, rules)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const useChildFormHook = <T extends Types['field']>(field: T, childForm: FormApi<any>) => {
    useEffect(() => {
      return form.addChildForm(field, childForm);
    }, [field, childForm])
  }

  const CompoundForm = FormComponent as typeof FormComponent & {
    Item: typeof FormItemComponent
    useWatch: typeof useWatchHook,
    useField: typeof useFieldHook,
    ArrayItem: typeof ArrayItemComponent,
    formApi: typeof form,
    useFieldErrors: typeof useFieldErrorsHook,
    useArrayField: typeof useArrayFieldHook,
    useChildForm: typeof useChildFormHook,
  }

  CompoundForm.formApi = form;
  CompoundForm.Item = FormItemComponent;
  CompoundForm.ArrayItem = ArrayItemComponent;
  CompoundForm.useWatch = useWatchHook;
  CompoundForm.useField = useFieldHook;
  CompoundForm.useArrayField = useArrayFieldHook;
  CompoundForm.useFieldErrors = useFieldErrorsHook;
  CompoundForm.useChildForm = useChildFormHook;

  return CompoundForm
}

export const useForm = <State extends Record<string, unknown>>(initialState: State) => {
  const ref = useRef(createForm(initialState));
  return ref.current;
}

export const useWatch = <
  Form extends FormApi<any>,
  Types extends FormApiGenericTypes<Form>,
  State extends Types['state'],
  Field extends Types['field']
>(form: Form, field: Field) => {
  const value = useSyncExternalStore<State[Field]>(
    cb => form.onFieldChange(field, cb),
    () => form.getFieldValue(field),
    () => form.getFieldValue(field),
  )

  return value;
}

export const useField = <
  Form extends FormApi<any>,
  Types extends FormApiGenericTypes<Form> = FormApiGenericTypes<Form>,
  State extends Types['state'] = Types['state'],
  Field extends Types['field'] = Types['field']
>(form: Form, field: Field) => {
  const value = useWatch(form, field);

  const handleUpdateFormField = useCallback((value: FieldUpdate<State[Field]>) => {
    form.setFieldValue(field, value);
  }, [field, form])

  return [value as State[Field], handleUpdateFormField] as const;
}

export const useFieldValidation = <
  Form extends FormApi<any>,
  Types extends FormApiGenericTypes<Form> = FormApiGenericTypes<Form>,
  State extends Types['state'] = Types['state'],
  Field extends Types['field'] = Types['field']
>(form: Form, field: Field) => {
  const [errors, setErrors] = useState([] as ValidationError<State[Field]>[]);
  const [status, setStatus] = useState(() => form.getFieldValidationStatus(field));

  useEffect(() => {
    return form.onFieldValidationStatusChange(field, (status, errors) => {
      setStatus(status);
      setErrors(errors || []);
    })
  }, [field, form])

  return { errors, status };
}
