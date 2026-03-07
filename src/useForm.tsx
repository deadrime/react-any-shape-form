import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { FormApi } from "./FormApi";
import {
  FormApiGenericTypes,
  ArrayOnly,
  ArrayOnlyFields,
  CompoundFormLike,
  Prettify,
  ExtractFormState,
} from "./typesHelpers";
import { FieldUpdate, ValidationRule, ValidationError } from "./types";
import { Form, FormProps } from "./Form";
import FormItem, { FormItemProps } from "./FormItem";
import FormArrayItem, {
  FormArrayItemProps,
  useArrayField,
} from "./FormArrayItem";

export const useCreateForm = <State extends Record<string, unknown>>(
  initialState: State,
) => {
  const formApiRef = React.useRef<FormApi<State>>(new FormApi(initialState));

  return [formApiRef.current] as const;
};

export const createForm = <
  State extends Record<string, unknown>,
  Nested extends Record<string, CompoundFormLike> = Record<never, never>,
>(
  initialState: State,
  nestedForms?: Nested,
) => {
  type FullState = Prettify<
    State & { [K in keyof Nested]: ExtractFormState<Nested[K]> }
  >;

  const resolvedInitial = { ...initialState } as Record<string, unknown>;

  if (nestedForms) {
    for (const [key, compoundForm] of Object.entries(nestedForms)) {
      resolvedInitial[key] = compoundForm.formApi.getState();
    }
  }

  const form = new FormApi(resolvedInitial as FullState);

  if (nestedForms) {
    for (const [key, compoundForm] of Object.entries(nestedForms)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      form.addChildForm(key as any, compoundForm.formApi);
    }
  }

  type Types = FormApiGenericTypes<typeof form>;

  type ArrayFields = ArrayOnlyFields<Types["state"]>;

  const FormComponent = (
    props: FormProps<Types["state"], FormApi<Types["state"]>>,
  ) => <Form form={form} {...props} />;

  const FormItemComponent = <T extends Types["field"]>(
    props: FormItemProps<T, Types["state"][T]>,
  ) => <FormItem {...props} />;

  const ArrayItemComponent = <T extends ArrayFields>(
    props: FormArrayItemProps<T, ArrayOnly<Types["state"][T]>>,
  ) => <FormArrayItem {...props} />;

  function useWatchHook<T extends Types["field"]>(field: T): Types["state"][T];
  function useWatchHook<T extends Types["field"]>(
    fields: T[],
  ): Pick<Types["state"], T>;
  function useWatchHook<T extends Types["field"]>(fieldOrFields: T | T[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return useWatch(form, fieldOrFields as any);
  }

  const useFieldHook = <T extends Types["field"]>(field: T) =>
    useField(form, field);

  const useFieldErrorsHook = <T extends Types["field"]>(field: T) =>
    useFieldValidation(form, field);

  const useArrayFieldHook = <T extends ArrayFields>(
    field: T,
    rules?: ValidationRule<Types["state"][T]>[],
    itemRules?: ValidationRule<ArrayOnly<Types["state"][T]>[number]>[],
  ) => useArrayField(form, field, rules, itemRules);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const useChildFormHook = <T extends Types["field"]>(
    field: T,
    childForm: FormApi<any>,
  ) => {
    useEffect(() => {
      return form.addChildForm(field, childForm);
    }, [field, childForm]);
  };

  const CompoundForm = FormComponent as typeof FormComponent & {
    Item: typeof FormItemComponent;
    useWatch: typeof useWatchHook;
    useField: typeof useFieldHook;
    ArrayItem: typeof ArrayItemComponent;
    formApi: typeof form;
    useFieldErrors: typeof useFieldErrorsHook;
    useArrayField: typeof useArrayFieldHook;
    useChildForm: typeof useChildFormHook;
  };

  CompoundForm.formApi = form;
  CompoundForm.Item = FormItemComponent;
  CompoundForm.ArrayItem = ArrayItemComponent;
  CompoundForm.useWatch = useWatchHook;
  CompoundForm.useField = useFieldHook;
  CompoundForm.useArrayField = useArrayFieldHook;
  CompoundForm.useFieldErrors = useFieldErrorsHook;
  CompoundForm.useChildForm = useChildFormHook;

  return CompoundForm;
};

export const useForm = <
  State extends Record<string, unknown>,
  Nested extends Record<string, CompoundFormLike> = Record<never, never>,
>(
  initialState: State,
  nestedForms?: Nested,
) => {
  const ref = useRef(createForm(initialState, nestedForms));
  return ref.current;
};

export function useWatch<
  Form extends FormApi<any>,
  Types extends FormApiGenericTypes<Form>,
  State extends Types["state"],
  Field extends Types["field"],
>(form: Form, field: Field): State[Field];

export function useWatch<
  Form extends FormApi<any>,
  Types extends FormApiGenericTypes<Form>,
  State extends Types["state"],
  Field extends Types["field"],
>(form: Form, fields: Field[]): Pick<State, Field>;

export function useWatch<
  Form extends FormApi<any>,
  Types extends FormApiGenericTypes<Form>,
  State extends Types["state"],
  Field extends Types["field"],
>(
  form: Form,
  fieldOrFields: Field | Field[],
): State[Field] | Pick<State, Field> {
  const isArray = Array.isArray(fieldOrFields);
  const fieldsKey = isArray
    ? (fieldOrFields as Field[]).join(",")
    : (fieldOrFields as Field);

  // Cache the last snapshot object so useSyncExternalStore doesn't see a new
  // reference on every call, which would cause an infinite re-render loop.
  const cachedSnapshot = useRef<Pick<State, Field> | null>(null);

  const getSnapshot = useCallback(
    () => {
      if (!isArray) {
        return form.getFieldValue(fieldOrFields as Field);
      }
      const fields = fieldOrFields as Field[];
      const prev = cachedSnapshot.current;
      if (prev !== null) {
        const changed = fields.some((f) => prev[f] !== form.getFieldValue(f));
        if (!changed) return prev;
      }
      const next = {} as Pick<State, Field>;
      for (const f of fields) {
        next[f] = form.getFieldValue(f);
      }
      cachedSnapshot.current = next;
      return next;
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, fieldsKey],
  );

  const subscribe = useCallback(
    (cb: () => void) => {
      if (!isArray) {
        return form.onFieldChange(fieldOrFields as Field, cb);
      }
      const unsubscribers = (fieldOrFields as Field[]).map((f) =>
        form.onFieldChange(f, cb),
      );
      return () => unsubscribers.forEach((unsub) => unsub());
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, fieldsKey],
  );

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export const useField = <
  Form extends FormApi<any>,
  Types extends FormApiGenericTypes<Form> = FormApiGenericTypes<Form>,
  State extends Types["state"] = Types["state"],
  Field extends Types["field"] = Types["field"],
>(
  form: Form,
  field: Field,
) => {
  const value = useWatch(form, field);

  const handleUpdateFormField = useCallback(
    (value: FieldUpdate<State[Field]>) => {
      form.setFieldValue(field, value);
    },
    [field, form],
  );

  return [value as State[Field], handleUpdateFormField] as const;
};

export const useFieldValidation = <
  Form extends FormApi<any>,
  Types extends FormApiGenericTypes<Form> = FormApiGenericTypes<Form>,
  State extends Types["state"] = Types["state"],
  Field extends Types["field"] = Types["field"],
>(
  form: Form,
  field: Field,
) => {
  const [errors, setErrors] = useState([] as ValidationError<State[Field]>[]);
  const [status, setStatus] = useState(() =>
    form.getFieldValidationStatus(field),
  );

  useEffect(() => {
    return form.onFieldValidationStatusChange(field, (status, errors) => {
      setStatus(status);
      setErrors(errors || []);
    });
  }, [field, form]);

  return { errors, status };
};
