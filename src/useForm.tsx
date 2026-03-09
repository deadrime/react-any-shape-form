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
  Prettify,
  MergeAddonStates,
  MergeAddonExtensions,
  GetFields,
} from "./typesHelpers";
import {
  FieldUpdate,
  ValidationError,
  ValidationStatus,
  FormAddon,
} from "./types";
import { Form, FormProps } from "./Form";
import FormItem, { FormItemProps } from "./FormItem";

// ---------------------------------------------------------------------------
// Return-type helpers
// ---------------------------------------------------------------------------

type FullFormState<
  State extends Record<string, unknown>,
  Addons extends readonly FormAddon<any>[],
> = Prettify<State & MergeAddonStates<Addons>>;


/** The full return type of `createForm` — base properties + optional array extension. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CreateFormReturn<
  State extends Record<string, unknown>,
  Addons extends readonly FormAddon<any>[],
> = {
  (
    props: FormProps<
      FullFormState<State, Addons>,
      FormApi<FullFormState<State, Addons>>
    >,
  ): React.ReactElement;
  formApi: FormApi<FullFormState<State, Addons>>;
  Item: <T extends GetFields<FullFormState<State, Addons>>>(
    props: FormItemProps<T, FullFormState<State, Addons>[T]>,
  ) => React.ReactElement;
  useWatch: {
    <T extends GetFields<FullFormState<State, Addons>>>(
      field: T,
    ): FullFormState<State, Addons>[T];
    <T extends GetFields<FullFormState<State, Addons>>>(
      fields: T[],
    ): Pick<FullFormState<State, Addons>, T>;
  };
  useField: <T extends GetFields<FullFormState<State, Addons>>>(
    field: T,
  ) => readonly [
    FullFormState<State, Addons>[T],
    (value: FieldUpdate<FullFormState<State, Addons>[T]>) => void,
  ];
  useFieldErrors: <T extends GetFields<FullFormState<State, Addons>>>(
    field: T,
  ) => {
    errors: ValidationError<FullFormState<State, Addons>[T]>[];
    status: ValidationStatus;
  };
} & MergeAddonExtensions<FullFormState<State, Addons>, Addons>;

// ---------------------------------------------------------------------------
// createForm / useForm
// ---------------------------------------------------------------------------

export const useCreateForm = <State extends Record<string, unknown>>(
  initialState: State,
) => {
  const formApiRef = React.useRef<FormApi<State>>(new FormApi(initialState));

  return [formApiRef.current] as const;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createForm = <
  State extends Record<string, unknown>,
  Addons extends FormAddon<any>[],
>(
  initialState: State,
  ...addons: [...Addons]
): CreateFormReturn<State, Addons> => {
  type FullState = FullFormState<State, Addons>;

  const resolvedInitial = { ...initialState } as Record<string, unknown>;
  for (const addon of addons) {
    Object.assign(resolvedInitial, addon._addonState);
  }

  const form = new FormApi(resolvedInitial as FullState);

  for (const addon of addons) {
    addon._setup?.(form);
  }

  type Types = FormApiGenericTypes<typeof form>;

  const FormComponent = (
    props: FormProps<Types["state"], FormApi<Types["state"]>>,
  ) => <Form form={form} {...props} />;

  const FormItemComponent = <T extends Types["field"]>(
    props: FormItemProps<T, Types["state"][T]>,
  ) => <FormItem {...props} />;

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

  const CompoundForm = FormComponent as typeof FormComponent & {
    Item: typeof FormItemComponent;
    useWatch: typeof useWatchHook;
    useField: typeof useFieldHook;
    formApi: typeof form;
    useFieldErrors: typeof useFieldErrorsHook;
  };

  CompoundForm.formApi = form;
  CompoundForm.Item = FormItemComponent;
  CompoundForm.useWatch = useWatchHook;
  CompoundForm.useField = useFieldHook;
  CompoundForm.useFieldErrors = useFieldErrorsHook;

  for (const addon of addons) {
    addon._extend?.(CompoundForm, form);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return CompoundForm as unknown as CreateFormReturn<State, Addons>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useForm = <
  State extends Record<string, unknown>,
  Addons extends FormAddon<any>[],
>(
  initialState: State,
  ...addons: [...Addons]
): CreateFormReturn<State, Addons> => {
  // useRef captures the initial form instance; subsequent renders reuse it.
  // We cast because TypeScript widens the inferred type when spreading ...addons
  // into the inner createForm call, losing the tuple type of Addons.
  const ref = useRef<CreateFormReturn<State, Addons>>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    null as any,
  );
  if (!ref.current) {
    ref.current = createForm(
      initialState,
      ...addons,
    ) as unknown as CreateFormReturn<State, Addons>;
  }
  return ref.current;
};

// ---------------------------------------------------------------------------
// Low-level hooks (exported for direct use with FormApi instances)
// ---------------------------------------------------------------------------

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

