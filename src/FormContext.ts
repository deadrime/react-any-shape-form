import { createContext, useContext } from 'react';

import { FormApi } from './FormApi';

export type FormContextState<F extends FormApi<any> = FormApi<any>> = {
  formApi: F
  formId?: string
  CSSPrefix?: string
}

const formDefaultContext: FormContextState = {
  formApi: new FormApi({} as Record<string, unknown>),
  CSSPrefix: 'simple-form'
};

export const createFormContext = <F extends FormApi<any> = FormApi<any>>() => {
  return createContext<FormContextState<F>>(formDefaultContext as unknown as FormContextState<F>)
}

export const FormContext = createContext<FormContextState>(formDefaultContext)

export const useFormContext = <F extends FormApi<any> = FormApi<any>>() => {
  return useContext<FormContextState<F>>(FormContext as unknown as React.Context<FormContextState<F>>)
}

export const useFormInstance = <F extends FormApi<any> = FormApi<any>>() => {
  const {formApi} = useFormContext<F>();
  return formApi
}
