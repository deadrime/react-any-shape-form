import React, { useCallback, forwardRef, useState, useImperativeHandle, CSSProperties, useRef } from 'react';
import { FormItemApi } from './FormItem';
import { FormContext } from './FormContext';
import omit from './helpers/omit';
import { useUpdateEffect } from 'react-use';
import classNames from 'classnames';

export type FormProps<State = Record<string, unknown>> = {
  initialState?: State
  children: React.ReactNode
  onFinish?: (state: State) => void
  onValuesChange?: (values: State) => void
  className?: string
  style?: CSSProperties
  id?: string
  CSSPrefix?: string
}

export type FormApi<State extends Record<string, unknown>, Field = Extract<keyof State, string>> = {
  setFieldsValue: (update: Partial<State>) => void
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
    CSSPrefix = 'form'
  } = props;
  const [fieldsValue, setFieldsValue] = useState<State>(initialState);
  const [refByFieldName, setRefByFieldName] = useState<Record<string, React.RefObject<FormItemApi>>>({});
  const fieldNames = Object.keys(refByFieldName) as Field[];

  const initField = useCallback((fieldName: Field, ref: React.RefObject<FormItemApi>) => {
    setRefByFieldName(obj => ({
      ...obj,
      [fieldName]: ref,
    }));
  }, []);

  const removeField = useCallback((fieldName: Field) => {
    setRefByFieldName(obj => omit(obj, fieldName));
  }, []);

  const updateFieldValue = useCallback((field: Field) => (value: State[Field]) => {
    setFieldsValue(values => ({
      ...values,
      [field]: value,
    }));
  }, []);

  const updateFieldsValue = useCallback((update: Partial<State>) => {
    setFieldsValue(values => ({
      ...values,
      ...update,
    }));
  }, []);

  useUpdateEffect(() => {
    onValuesChange?.(fieldsValue);
  }, [fieldsValue]);

  const resetFields = useCallback(() => {
    setFieldsValue(initialState as State);
    fieldNames.map((fieldName) => refByFieldName[fieldName].current?.reset());
  }, [fieldNames, initialState, refByFieldName]);

  const setFieldError = useCallback((fieldName: string, error: string) => {
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
    onFinish?.(fieldsValue);
  }, [fieldsValue, onFinish, validateFields]);

  const getFieldValue = useCallback((field: string) => {
    return fieldsValue[field];
  }, [fieldsValue]);

  const getFieldsValue = useCallback(() => {
    return fieldsValue;
  }, [fieldsValue]);

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

  const handleSubmit = useCallback(async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    await submit();
  }, [submit]);

  return (
    <FormContext.Provider
      value={{
        fieldsValue,
        initField,
        removeField,
        setFieldsValue,
        updateFieldValue,
        validateFields,
        formId: id,
        CSSPrefix,
      } as unknown as any}
    >
      <form
        onSubmit={handleSubmit}
        className={classNames(className, CSSPrefix)}
        style={style}
        noValidate
        id={id}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
}

export function useFormRef<State extends Record<string, unknown>>() {
  const formRef = useRef<FormApi<State>>(null);

  return formRef;
}

export default forwardRef(Form) as <State extends Record<string, unknown>, Field = Extract<keyof State, string>>(
  props: FormProps<State> & { ref?: React.ForwardedRef<FormApi<State, Field>> }
) => ReturnType<typeof Form>;
