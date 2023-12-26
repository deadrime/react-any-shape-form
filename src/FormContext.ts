import { createContext, useContext } from 'react';
import { FormItemApi } from './FormItem';

export type FormContextState<State extends Record<string, unknown> = Record<string, unknown>, Field = Extract<keyof State, string>> = {
  fieldsValue: Record<string, unknown>
  updateFieldValue: (field: Field) => (value: unknown) => void
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
  return createContext<FormContextState<State>>(formDefaultContext)
}

export const FormContext = createContext<FormContextState>(formDefaultContext)

export const useFormContext = <State extends Record<string, unknown> = Record<string, unknown>>() => {
  return useContext<FormContextState<State>>(FormContext as unknown as React.Context<FormContextState<State>>)
}
