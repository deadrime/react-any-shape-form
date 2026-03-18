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
  MergeAddonFormProps,
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
import { FormSubmit } from "./FormSubmit";
import { FormContext, useFormInstance } from "./FormContext";
import { useIsomorphicLayoutEffect } from "./helpers/useIsomorphicLayoutEffect";

// ---------------------------------------------------------------------------
// Return-type helpers
// ---------------------------------------------------------------------------

type FullFormState<
  State extends Record<string, unknown>,
  Addons extends readonly FormAddon<any>[],
> = Prettify<State & MergeAddonStates<Addons>>;


/** The full return type of `createGlobalForm` — base properties + optional array extension. */
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

/** Handle exposed via ref on the context-based <Form> component. */
/** @deprecated Use `FormApi` directly as the ref type. Kept for backward compatibility. */
export type FormHandle = FormApi<any>;

/** Props for the context-based <Form> component created by `createForm`. */
export type FormBuilderProps<
  State extends Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Addons extends readonly FormAddon<any>[] = [],
> = {
  initialState: FullFormState<State, Addons>;
  children: React.ReactNode;
  onSubmit?: (state: FullFormState<State, Addons>) => void;
  onFieldChange?: (
    field: keyof FullFormState<State, Addons>,
    value: FullFormState<State, Addons>[keyof FullFormState<State, Addons>],
  ) => void;
  id?: string;
} & MergeAddonFormProps<Addons>;

/** The full return type of `createForm`. */
export type FormBuilderReturn<
  State extends Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Addons extends readonly FormAddon<any>[],
> = {
  Form: React.ForwardRefExoticComponent<
    FormBuilderProps<State, Addons> & React.RefAttributes<FormApi<FullFormState<State, Addons>>>
  >;
  Item: <T extends GetFields<FullFormState<State, Addons>>>(
    props: FormItemProps<T, FullFormState<State, Addons>[T]>,
  ) => React.ReactElement;
  Submit: typeof FormSubmit;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  withAddons: <NewAddons extends FormAddon<any>[]>(
    ...addons: [...NewAddons]
  ) => FormBuilderReturn<State, [...Addons, ...NewAddons]>;
} & MergeAddonExtensions<FullFormState<State, Addons>, Addons>;

// ---------------------------------------------------------------------------
// createGlobalForm / useForm (legacy API — global FormApi instance)
// ---------------------------------------------------------------------------

export const useCreateForm = <State extends Record<string, unknown>>(
  initialState: State,
) => {
  const formApiRef = React.useRef<FormApi<State>>(new FormApi(initialState));

  return [formApiRef.current] as const;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createGlobalForm = <
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
  const ref = useRef<CreateFormReturn<State, Addons>>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    null as any,
  );
  if (!ref.current) {
    ref.current = createGlobalForm(
      initialState,
      ...addons,
    ) as unknown as CreateFormReturn<State, Addons>;
  }
  return ref.current;
};

// ---------------------------------------------------------------------------
// createForm — context-based API (FormApi created per <Form> render)
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildFormBuilder<
  State extends Record<string, unknown>,
  Addons extends FormAddon<any>[],
>(addons: [...Addons]): FormBuilderReturn<State, Addons> {
  type FullState = FullFormState<State, Addons>;

  // Merge addon initial states — used when creating FormApi in ContextForm
  const mergedAddonStates = {} as Record<string, unknown>;
  for (const addon of addons) {
    Object.assign(mergedAddonStates, addon._addonState);
  }

  const ContextForm = React.forwardRef<FormApi<FullState>, FormBuilderProps<State, Addons>>(
    function ContextFormInner(props, ref) {
      const formApiRef = React.useRef<FormApi<FullState> | null>(null);
      if (!formApiRef.current) {
        const resolvedInitial = {
          ...mergedAddonStates,
          ...(props.initialState as Record<string, unknown>),
        } as FullState;
        const api = new FormApi<FullState>(resolvedInitial);
        for (const addon of addons) {
          addon._setup?.(api);
        }
        formApiRef.current = api;
      }
      const formApi = formApiRef.current;

      useIsomorphicLayoutEffect(() => {
        formApi.setInitialState(props.initialState);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      useEffect(() => {
        if (!props.onSubmit) return;
        return formApi.onSubmit(props.onSubmit as (state: Record<string, unknown>) => void);
      }, [formApi, props.onSubmit]);

      React.useImperativeHandle(ref, () => formApi, [formApi]);

      // Run addon context-mount effects (e.g., for withNestedForms)
      useEffect(() => {
        const cleanups: (() => void)[] = [];
        for (const addon of addons) {
          const cleanup = addon._onContextMount?.(formApi, props as unknown as Record<string, unknown>);
          if (cleanup) cleanups.push(cleanup);
        }
        return () => cleanups.forEach(fn => fn());
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      return (
        <FormContext.Provider
          value={{
            formApi: formApi as FormApi<any>,
            formId: props.id,
            onFieldChange: props.onFieldChange as ((field: string, value: unknown) => void) | undefined,
          }}
        >
          {props.children}
        </FormContext.Provider>
      );
    },
  );

  // Context-based hooks
  function useWatchHook<T extends GetFields<FullState>>(field: T): FullState[T];
  function useWatchHook<T extends GetFields<FullState>>(fields: T[]): Pick<FullState, T>;
  function useWatchHook<T extends GetFields<FullState>>(fieldOrFields: T | T[]) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const form = useFormInstance<FullState>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return useWatch(form, fieldOrFields as any);
  }

  const useFieldHook = <T extends GetFields<FullState>>(field: T) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const form = useFormInstance<FullState>();
    return useField(form, field);
  };

  const useFieldErrorsHook = <T extends GetFields<FullState>>(field: T) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const form = useFormInstance<FullState>();
    return useFieldValidation(form, field);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const withAddonsFn = <NewAddons extends FormAddon<any>[]>(...newAddons: [...NewAddons]) => {
    return buildFormBuilder<State, [...Addons, ...NewAddons]>([...addons, ...newAddons]);
  };

  const ItemComponent = <T extends GetFields<FullState>>(
    props: FormItemProps<T, FullState[T]>,
  ) => React.createElement(FormItem, props as any);

  const compound = {
    Form: ContextForm,
    Item: ItemComponent,
    Submit: FormSubmit,
    useWatch: useWatchHook,
    useField: useFieldHook,
    useFieldErrors: useFieldErrorsHook,
    withAddons: withAddonsFn,
  };

  // Let addons extend the compound form (context mode: formApi = null)
  for (const addon of addons) {
    addon._extend?.(compound, null);
  }

  return compound as unknown as FormBuilderReturn<State, Addons>;
}

export function createForm<State extends Record<string, unknown>>(): FormBuilderReturn<State, []> {
  return buildFormBuilder<State, []>([]);
}

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
