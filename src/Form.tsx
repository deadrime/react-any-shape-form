import React, { useMemo, useEffect, memo } from "react";

import { FormContext } from "./FormContext";
import { FormApi } from "./FormApi";
import { useIsomorphicLayoutEffect } from "./helpers/useIsomorphicLayoutEffect";

type FormBasedOnInitialState<
  InitialState extends Record<string, unknown>,
  Form extends FormApi<any>,
> = Form extends undefined
  ? FormApi<
      InitialState extends undefined ? Record<string, undefined> : InitialState
    >
  : Form;

export type FormProps<
  InitialState extends Record<string, unknown>,
  F extends FormApi<any>,
  Form extends FormBasedOnInitialState<InitialState, F> =
    FormBasedOnInitialState<InitialState, F>,
  State = ReturnType<Form["getState"]>,
> = {
  form?: Form;
  initialState?: State;
  children: React.ReactNode;
  onFinish?: (state: State) => void;
  onFieldChange?: (field: keyof State, value: State[keyof State]) => void;
  id?: string;
};

export const Form = <
  InitialState extends Record<string, unknown>,
  F extends FormApi<any>,
  Form extends FormBasedOnInitialState<InitialState, F>,
>(
  props: FormProps<InitialState, F, Form>,
) => {
  const { children, onFinish, onFieldChange, initialState, id } = props;

  const formApi = useMemo<Form>(
    () =>
      (props?.form
        ? props.form
        : new FormApi(props.initialState || {})) as Form,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.form],
  );

  useIsomorphicLayoutEffect(() => {
    if (initialState) {
      formApi.setInitialState(initialState);
    }
  }, []);

  useEffect(() => {
    if (!onFinish) {
      return;
    }
    return formApi.onSubmit(onFinish);
  }, [formApi, onFinish]);

  return (
    <FormContext.Provider
      value={{
        formApi,
        formId: id,
        onFieldChange,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export default memo(Form) as typeof Form;
