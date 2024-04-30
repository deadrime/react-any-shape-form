import { useCallback, useEffect, useRef, useState } from "react";
import { FormApi } from "./FormApi";
import { FormApiGenericTypes, ArrayOnly, ArrayOnlyFields } from "./typesHelpers";
import { FieldUpdate, FormItemRule, ValidationError } from "./types";
import { Form, FormProps } from "./Form";
import { FormItem, FormItemProps } from "./FormItem";
import { FormArrayItem, FormArrayItemProps, useArrayField } from "./FormArrayItem";

export const useCreateForm = <State extends Record<string, unknown>>(initialState: State) => {
  const formApiRef = useRef<FormApi<State>>(new FormApi(initialState));

  return [formApiRef.current] as const
}

export const createForm = <State extends Record<string, unknown>>(initialState: State) => {
  const form = new FormApi(initialState);

  type Types = FormApiGenericTypes<typeof form>;

  type ArrayFields = ArrayOnlyFields<Types['state']>;

  const FormComponent = (props: FormProps<Types['state'], FormApi<Types['state']>>) =>
    <Form form={form} {...props} />

  const FormItemComponent = <T extends Types['field']>(props: FormItemProps<T, Types['state'][T]>) => <FormItem {...props} />

  const ArrayItemComponent = <T extends ArrayFields>(props: FormArrayItemProps<T, ArrayOnly<Types['state'][T]>>) => <FormArrayItem {...props} />

  const useWatchHook = <T extends Types['field']>(field: T) => useWatch(form, field)

  const useFieldHook = <T extends Types['field']>(field: T) => useField(form, field)

  const useFieldErrorHook = <T extends Types['field']>(field: T) => useFieldError(form, field)

  const useArrayFieldHook = <T extends ArrayFields>(field: T, rules?: FormItemRule<Types['state'][T]>[]) => useArrayField(form, field, rules)

  const CompoundForm = FormComponent as typeof FormComponent & {
    Item: typeof FormItemComponent
    useWatch: typeof useWatchHook,
    useField: typeof useFieldHook,
    ArrayItem: typeof ArrayItemComponent,
    formApi: typeof form,
    useFieldError: typeof useFieldErrorHook,
    useArrayField: typeof useArrayFieldHook,
  }

  CompoundForm.formApi = form;
  CompoundForm.Item = FormItemComponent;
  CompoundForm.ArrayItem = ArrayItemComponent;
  CompoundForm.useWatch = useWatchHook;
  CompoundForm.useField = useFieldHook;
  CompoundForm.useArrayField = useArrayFieldHook;
  CompoundForm.useFieldError = useFieldErrorHook;

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
  const [value, setValue] = useState(form.getFieldValue(field));

  useEffect(() => {
    const unsubscribe = form.onFieldChange(field, setValue);
    return unsubscribe
  }, [field, form])

  return value as State[Field]
}

export const useField = <
  Form extends FormApi<any>,
  Types extends FormApiGenericTypes<Form> = FormApiGenericTypes<Form>,
  State extends Types['state'] = Types['state'],
  Field extends Types['field'] = Types['field']
>(form: Form, field: Field) => {
  const [value, setValue] = useState(form.getFieldValue(field));

  useEffect(() => {
    const unsubscribe = form.onFieldChange(field, setValue);
    return unsubscribe
  }, [field, form])

  const handleUpdateFormField = useCallback((value: FieldUpdate<State[Field]>) => {
    form.setFieldValue(field, value);
  }, [field, form])

  return [value as State[Field], handleUpdateFormField] as const;
}

export const useFieldError = <
  Form extends FormApi<any>,
  Types extends FormApiGenericTypes<Form> = FormApiGenericTypes<Form>,
  State extends Types['state'] = Types['state'],
  Field extends Types['field'] = Types['field']
>(form: Form, field: Field) => {
  const [validationErrors, setValidationErrors] = useState([] as ValidationError<State[Field]>[]);

  useEffect(() => {
    const unsubscribe = form.onFieldError(field, (errors) => setValidationErrors(errors as ValidationError<State[Field]>[]));
    return unsubscribe;
  }, [field, form])

  return validationErrors;
}
