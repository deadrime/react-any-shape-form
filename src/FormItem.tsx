import React, { CSSProperties, useCallback, useRef, memo } from 'react';
import { useDebounce } from 'react-use';
import { useFormContext } from './FormContext';
import { ValidationRule, ValidationStatus, ValidationError } from './types';
import { useFieldValidation } from './useForm';
import { useFieldData } from './helpers/useFieldData';

type FormItemChildrenProps<V = any> = { value: V, onChange: (value: V) => unknown, validationStatus?: ValidationStatus }

type FormItemChildren<V = any> = (props: FormItemChildrenProps<V>) => React.ReactNode

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
  onChange?: (value: Value) => unknown
  onInvalid?: (error: ValidationError[], value: Value) => void
  id?: string
  renderLabel?: (value: Value, formItemId?: string) => React.ReactElement
  renderError?: (error: ValidationError<Value>) => React.ReactElement
  validationDebounceDelay?: number
}

const FormItem = <Value, FieldName extends string = string, Children extends FormItemChildren = FormItemChildren>(props: FormItemProps<FieldName, Value, Children>) => {
  const {
    children,
    name,
    rules = [],
    label,
    className,
    style,
    onChange,
    onInvalid,
    id: idFromProps,
    renderError,
    renderLabel,
    validationDebounceDelay = 300,
  } = props;
  const { formApi } = useFormContext()
  const { value, setValue, id, CSSPrefix } = useFieldData<Value>(name, rules);
  const { errors, status } = useFieldValidation(formApi, name);
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
  }, validationDebounceDelay, [value, formApi.validateField]);

  const handleChange = useCallback(async (value: Value) => {
    stateRef.current.valueChanged = true;
    setValue(value);
    onChange?.(value);
  }, [setValue, onChange]);

  return (
    <div className={`${className || ''} ${CSSPrefix}__form-item`} style={style}>
      <label htmlFor={formItemId} className={`${CSSPrefix}__form-item__label`}>
        {renderLabel ? renderLabel(value, formItemId) : label}
      </label>
      {children?.({
        value,
        onChange: handleChange,
        validationStatus: status,
      })}
      {errors.map((error, index) =>
        renderError
          ? renderError?.(error as ValidationError<Value>)
          : <div key={index} className={`${CSSPrefix}__form-item__error`}>{error.errorText}</div>
      )}
    </div>
  );
};

FormItem.displayName = 'FormItem';

export default memo(FormItem) as typeof FormItem
