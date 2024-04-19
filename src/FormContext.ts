import { createContext, useContext } from 'react';
import { FormItemApi } from './FormItem';
import { FieldUpdate } from 'types';

export type FormContextState<State extends Record<string, unknown> = Record<string, unknown>, Field extends Extract<keyof State, string> = Extract<keyof State, string>> = {
  fieldsValue: State
  updateFieldValue: (field: Field) => (value: FieldUpdate<State[Field]>) => void
  setFieldsValue: (update: Partial<State>) => void
  initField: (fieldName: Field, ref: React.RefObject<FormItemApi>) => void
  removeField: (fieldName: Field) => void
  validateFields: (fieldNames?: Field[]) => Promise<void>
  formId?: string
  CSSPrefix?: string
}

const formDefaultContext: FormContextState<Record<string, unknown>> = {
  fieldsValue: {},
  initField: () => { },
  updateFieldValue: () => () => { },
  setFieldsValue: () => { },
  removeField: () => { },
  validateFields: async () => { },
  CSSPrefix: 'simple-form'
};

export const createFormContext = <State extends Record<string, unknown> = Record<string, unknown>>() => {
  return createContext<FormContextState<State>>(formDefaultContext as unknown as FormContextState<State>)
}

export const FormContext = createContext<FormContextState>(formDefaultContext)

export const useFormContext = <State extends Record<string, unknown> = Record<string, unknown>>() => {
  return useContext<FormContextState<State>>(FormContext as unknown as React.Context<FormContextState<State>>)
}

export const useField = <T, Field extends string = string>(field: Field) => {
  const { updateFieldValue, fieldsValue } = useFormContext();

  const value = typeof fieldsValue[field] !== 'undefined' ? fieldsValue[field] : '';

  return [value as T, updateFieldValue(field) as (value: T) => void,] as const;
};
