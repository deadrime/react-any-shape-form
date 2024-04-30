import React, { CSSProperties, useCallback, useRef, useLayoutEffect } from 'react';
import { useDebounce } from 'react-use';
import { FormContextState, useFormContext } from './FormContext';
import { FormItemRule, ValidationStatus, FieldUpdate, ValidationError } from './types';
import { useField, useFieldError } from './useForm';

export type RenderFormItemChildren<Value = unknown> =
  (props: { value: Value, onChange: (value: Value, event?: unknown) => unknown, validationStatus: ValidationStatus }) => React.ReactNode;

export type FormItemProps<
  FieldName extends string = string,
  Value = unknown,
> = {
  children: React.ReactElement | RenderFormItemChildren<Value>
  label?: React.ReactNode
  name: FieldName
  rules?: FormItemRule<Value>[]
  className?: string
  style?: CSSProperties
  hasFeedback?: boolean
  getValueFromEvent?: (event: unknown) => Value
  onChange?: (value: Value, event?: unknown) => unknown
  onInvalid?: (error: ValidationError[], value: Value) => void
  id?: string
  renderLabel?: (value: Value, formItemId?: string) => React.ReactElement
  renderError?: (error: ValidationError<Value>) => React.ReactElement
  context?: React.Context<FormContextState>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultGetValueFromEvent = <T,>(e: any) => {
  if (typeof e === 'object' && typeof e?.target?.value !== 'undefined') {
    return e?.target?.value as T;
  }
  return e as T
}

export const FormItem = <Value, FieldName extends string = string>(props: FormItemProps<FieldName, Value>) => {
  const {
    children,
    name,
    rules = [],
    label,
    className,
    style,
    hasFeedback = false,
    getValueFromEvent = defaultGetValueFromEvent<Value>,
    onChange,
    onInvalid,
    id: idFromProps,
    renderError,
    renderLabel,
  } = props;
  const { formApi } = useFormContext()
  const { value, setValue, id, CSSPrefix } = useFieldData<Value>(name, rules);
  const validationErrors = useFieldError(formApi, name);
  const formItemId = idFromProps || id;
  const stateRef = useRef<{ valueChanged: boolean }>({ valueChanged: false });

  useDebounce(() => {
    if (!stateRef?.current.valueChanged) {
      return;
    }
    formApi.getFieldError(name, 'onChange').then((validationErrors) => {
      if (validationErrors.length > 0) {
        onInvalid?.(validationErrors, value)
      }
    })
  }, 300, [value, formApi.validateField]);

  const handleChange = useCallback(async (event: unknown) => {
    stateRef.current.valueChanged = true;
    setValue(getValueFromEvent(event));
    onChange?.(getValueFromEvent(event), event);
  }, [setValue, getValueFromEvent, onChange]);

  return (
    <div className={`${className} ${CSSPrefix}__form-item`} style={style}>
      <label htmlFor={formItemId} className={`${CSSPrefix}__form-item__label`}>
        {renderLabel ? renderLabel(value, formItemId) : label}
      </label>
      {typeof children === 'function'
        ? children({
          value,
          onChange: handleChange,
          validationStatus: 'notStarted',
        })
        : React.cloneElement(children, {
          value,
          onChange: (value: unknown) => {
            handleChange(value);
            children.props?.onChange?.(value);
          },
          id: formItemId,
          ...hasFeedback && {
            validationStatus: '',
          }
        })
      }
      {validationErrors.map((error, index) =>
        renderError
          ? renderError?.(error as ValidationError<Value>)
          : <div key={index} className={`${CSSPrefix}__form-item__error`}>{error.errorText}</div>
      )}
    </div>
  );
};

const useFieldData = <T,>(field: string, rules: FormItemRule<T>[]) => {
  const { formApi, formId, CSSPrefix } = useFormContext()
  const [value, setValue] = useField(formApi, field);

  useLayoutEffect(() => {
    formApi.setFieldRules(field, rules);

    // Init with undefined
    if (!(field in formApi.getState())) {
      formApi.setFieldValue(field, undefined);
    }
    // reset maybe?
  }, [field, formApi, rules])

  return {
    value: value as T,
    setValue: setValue as (value: FieldUpdate<T>) => void,
    id: formId ? `${formId}:${field}` : undefined,
    CSSPrefix,
  };
};

FormItem.displayName = 'FormItem';
