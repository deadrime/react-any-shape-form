import React, { CSSProperties, useCallback, useRef } from 'react';
import { useDebounce } from 'react-use';
import { useFormContext } from './FormContext';
import { ValidationRule, ValidationStatus, ValidationError } from './types';
import { useFieldError } from './useForm';
import { useFieldData } from './helpers/useFieldData';

type FormItemChildrenProps<V = any> = { value: V, onChange: (value: V) => unknown, validationStatus?: ValidationStatus }

type FormItemChildren<V = any> = React.FC<FormItemChildrenProps<V>> | React.ReactElement<FormItemChildrenProps<V>>

export type FormItemProps<
  FieldName extends string = string,
  Value = unknown,
  Children extends FormItemChildren<Value> = FormItemChildren<Value>
> = {
  children: Children
  label?: React.ReactNode
  name: FieldName
  rules?: ValidationRule<Value>[]
  className?: string
  style?: CSSProperties
  hasFeedback?: boolean
  normalize?: (value: Value) => any,
  getValueFromEvent?: (...args: any[]) => Value
  onChange?: (value: Value, event?: unknown) => unknown
  onInvalid?: (error: ValidationError[], value: Value) => void
  id?: string
  renderLabel?: (value: Value, formItemId?: string) => React.ReactElement
  renderError?: (error: ValidationError<Value>) => React.ReactElement
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultGetValueFromEvent = <T,>(e: any) => {
  if (typeof e === 'object' && typeof e?.target?.value !== 'undefined') {
    return e?.target?.value as T;
  }
  return e as T
}

export const FormItem = <Value, FieldName extends string = string, Children extends FormItemChildren = FormItemChildren>(props: FormItemProps<FieldName, Value, Children>) => {
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
    normalize,
  } = props;
  const { formApi } = useFormContext()
  const { value, setValue, id, CSSPrefix } = useFieldData<Value>(name, rules);
  const normalizedValue = normalize ? normalize(value) : value;
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

  const handleChange = useCallback(async (...args: any[]) => {
    stateRef.current.valueChanged = true;
    setValue(getValueFromEvent(...args));
    onChange?.(getValueFromEvent(...args), ...args);
  }, [setValue, getValueFromEvent, onChange]);

  return (
    <div className={`${className || ''} ${CSSPrefix}__form-item`} style={style}>
      <label htmlFor={formItemId} className={`${CSSPrefix}__form-item__label`}>
        {renderLabel ? renderLabel(value, formItemId) : label}
      </label>
      {typeof children === 'function'
        ? children({
          value: normalizedValue,
          onChange: handleChange,
          validationStatus: 'notStarted',
        })
        : React.cloneElement(children, {
          value: normalizedValue,
          onChange: (value: unknown) => {
            handleChange(value);
            children.props?.onChange?.(normalizedValue);
          },
          ...hasFeedback && {
            validationStatus: 'notStarted',
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

FormItem.displayName = 'FormItem';
