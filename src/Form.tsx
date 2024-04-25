import React, { useCallback, forwardRef, useState, useImperativeHandle, CSSProperties, useRef } from 'react';
import { FormItemApi } from './FormItem';
import { FieldsUpdate, FormContext, FormContextState } from './FormContext';
import omit from './helpers/omit';
import useUpdateEffect from 'react-use/esm/useUpdateEffect';
import { FieldUpdate, FieldUpdateCb } from './types';

type RenderChildrenFunction<State> = (state: State) => React.ReactNode;

export type FormProps<State extends Record<string, unknown> = Record<string, unknown>> = {
  initialState?: State
  children: React.ReactNode | RenderChildrenFunction<State>
  onFinish?: (state: State) => void
  onValuesChange?: (values: State) => void
  context?: React.Context<FormContextState<State>>
  className?: string
  style?: CSSProperties
  id?: string
  CSSPrefix?: string
}

export type FormApi<State extends Record<string, unknown>, Field = Extract<keyof State, string>> = {
  setFieldsValue: (update: FieldsUpdate<State>) => void
  resetFields: () => void
  setFieldError: (field: Field, error: string) => void
  getFieldsValue: () => State;
  getFieldValue: (field: Field) => unknown
  validateFields: (fields?: Field[]) => Promise<void>
  submit: () => Promise<void>
}

const Form = <State extends Record<string, unknown>, Field extends Extract<keyof State, string>>(
  props: FormProps<State>,
  ref: React.ForwardedRef<FormApi<State, Field>>,
) => {
  const {
    children,
    initialState = {} as State,
    onFinish,
    onValuesChange,
    className,
    style,
    id,
    CSSPrefix = 'form',
    context
  } = props;
  const [state, setState] = useState<State>(initialState);
  const [refByFieldName, setRefByFieldName] = useState<Record<string, React.RefObject<FormItemApi>>>({});
  const fieldNames = Object.keys(refByFieldName) as Field[];

  useUpdateEffect(() => {
    onValuesChange?.(state);
  }, [state]);

  const initField = useCallback((fieldName: Field, ref: React.RefObject<FormItemApi>) => {
    setRefByFieldName(obj => ({
      ...obj,
      [fieldName]: ref,
    }));
  }, []);

  const removeField = useCallback((fieldName: Field) => {
    setRefByFieldName(obj => omit(obj, fieldName));
  }, []);

  const updateFieldValue = useCallback((field: Field) => (value: FieldUpdate<State[Field]>) => {
    setState(state => ({
      ...state,
      [field]: typeof value === 'function' ? (value as FieldUpdateCb<State[Field]>)(state[field]) : value,
    }));
  }, []);

  const updateFieldsValue = useCallback((update: FieldsUpdate<State>) => {
    if (typeof update === 'function') {
      setState(update);
    } else {
      setState(state => ({
        ...state,
        ...update,
      }));
    }
  }, []);

  const resetFields = useCallback(() => {
    setState(initialState as State);
    onValuesChange?.(initialState);
    fieldNames.map((fieldName) => refByFieldName[fieldName].current?.reset());
  }, [fieldNames, initialState, onValuesChange, refByFieldName]);

  const setFieldError = useCallback((fieldName: Field, error: string) => {
    refByFieldName[fieldName].current?.setError(error);
  }, [refByFieldName]);

  const validateFields = useCallback(async (fieldNamesArray = fieldNames) => {
    const promises = fieldNamesArray.map((fieldName) => {
      if (!refByFieldName[fieldName]) {
        throw new Error(`Invalid fieldName ${fieldName}`);
      }
      return refByFieldName[fieldName].current?.validate('onFinish');
    });
    const settledPromises = await Promise.allSettled(promises);
    const noErrors = settledPromises.every(promise => promise.status === 'fulfilled');

    if (noErrors) {
      return Promise.resolve();
    } else {
      return Promise.reject();
    }
  }, [fieldNames, refByFieldName]);

  const submit = useCallback(async () => {
    await validateFields();
    onFinish?.(state);
  }, [state, onFinish, validateFields]);

  const getFieldValue = useCallback((field: string) => {
    return state[field];
  }, [state]);

  const getFieldsValue = useCallback(() => {
    return state;
  }, [state]);

  const handleSubmit = useCallback(async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    await submit();
  }, [submit]);

  useImperativeHandle(
    ref,
    () => ({
      setFieldsValue: updateFieldsValue,
      resetFields,
      setFieldError,
      validateFields,
      submit,
      getFieldValue,
      getFieldsValue,
    }),
    [updateFieldsValue, resetFields, setFieldError, validateFields, submit, getFieldValue, getFieldsValue]
  );

  const Context = (context || FormContext) as React.Context<FormContextState<State>>;

  return (
    <Context.Provider
      value={{
        fieldsValue: state,
        setFieldsValue: updateFieldsValue,
        initField,
        removeField,
        updateFieldValue,
        validateFields,
        formId: id,
        CSSPrefix,
      } as FormContextState<State>}
    >
      <form
        onSubmit={handleSubmit}
        className={`${className || ''} ${CSSPrefix}`}
        style={style}
        noValidate
        id={id}
      >
        {typeof children === 'function' ? children(state) : children}
      </form>
    </Context.Provider>
  );
}

export function useFormRef<State extends Record<string, unknown>>() {
  const formRef = useRef<FormApi<State>>(null);

  return formRef;
}

const FormWithRef = forwardRef(Form) as <State extends Record<string, unknown>, Field = Extract<keyof State, string>>(
  props: FormProps<State> & { ref?: React.ForwardedRef<FormApi<State, Field>> }
) => ReturnType<typeof Form>;

export const createForm = <State extends Record<string, unknown>>() => {
  return FormWithRef<State>;
}

export default FormWithRef;
