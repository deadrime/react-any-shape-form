import React, { useCallback } from 'react';
import { useFormInstance } from './FormContext';

type SubmitRenderProp = (props: { submit: () => Promise<unknown> }) => React.ReactElement;

export const FormSubmit = ({ children }: {
  children: React.ReactElement | SubmitRenderProp;
}) => {
  const formApi = useFormInstance();
  const submit = useCallback(() => formApi.submit(), [formApi]);

  if (typeof children === 'function') {
    return children({ submit });
  }
  // cloneElement mode: suppress unhandled rejection since the button can't chain .catch()
  return React.cloneElement(children, { onClick: () => submit().catch(() => {}) });
};
