import React, { CSSProperties, useCallback, useImperativeHandle, useMemo, useRef, useState, useEffect } from 'react';
import { useDebounce } from 'react-use';
import { FormContextState, useFormContext } from './FormContext';
import { FormItemRule, ValidationStatus, ValidateTrigger } from './types';
import omit from './helpers/omit';
import { getValidationErrors } from './helpers/getValidationErrors';

export type FormItemApi = {
  validate: (trigger?: ValidateTrigger) => Promise<void>;
  reset: () => void;
  setError: (error: string) => void
}

export type RenderFormItemChildren<FieldName extends string = string, Value = unknown> =
  (props: Pick<FormItemProps<FieldName, Value>, 'value' | 'onChange'> & { validationStatus: ValidationStatus }) => React.ReactNode;

export type FormItemProps<
  FieldName extends string = string,
  Value = unknown,
> = {
  value?: Value
  children: React.ReactElement | RenderFormItemChildren<FieldName, Value>
  label?: React.ReactNode
  name: FieldName
  rules?: FormItemRule<Value>[]
  className?: string
  style?: CSSProperties
  hasFeedback?: boolean
  getValueFromEvent?: (event: unknown) => Value
  onChange?: (value: Value, event: unknown) => unknown
  onInvalid?: (error: string, value: Value, rule: FormItemRule<Value>) => void
  id?: string
  renderLabel?: (value: Value, formItemId?: string) => React.ReactElement
  renderError?: (error: string, value: Value) => React.ReactElement
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
    hasFeedback,
    getValueFromEvent = defaultGetValueFromEvent<Value>,
    onChange,
    onInvalid,
    id: idFromProps,
    renderError,
    renderLabel,
  } = props;

  const { value, setValue, ref, id, CSSPrefix } = useField<Value>(name);
  const formItemId = idFromProps || id;
  const [errorByRuleKey, setErrorByRuleKey] = useState<Record<string, string>>({});
  const stateRef = useRef<{ valueChanged: boolean }>({ valueChanged: false });
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('notStarted');

  const rulesWithKey = useMemo(() => rules.map((rule, index) => ({
    ...rule,
    key: String(index),
    validateTrigger: rule.validateTrigger || ['onChange', 'onFinish'],
  })), [rules]);

  const runValidators = useCallback(async (value: Value, trigger?: ValidateTrigger) => {
    if (!rulesWithKey.length) {
      return;
    }

    const errors = await getValidationErrors(value, rulesWithKey, trigger);

    errors.forEach(error => {
      onInvalid?.(error.errorText, error.value, error.rule);
    })

    const errorsByRuleKey = errors.reduce((acc, curr) => {
      acc[curr.rule.key] = curr.errorText;
      return acc;
    }, {} as Record<string, string>)

    setErrorByRuleKey(errorsByRuleKey);

    if (errors.length > 0) {
      return Promise.reject('reject');
    }
  }, [onInvalid, rulesWithKey]);

  const validate = useCallback(async (trigger?: ValidateTrigger) => {
    setValidationStatus('validating');
    try {
      await runValidators(value, trigger);
      setValidationStatus('success');
    } catch (error) {
      setValidationStatus('error');
      return Promise.reject();
    }
  }, [runValidators, value]);

  useDebounce(() => {
    if (!stateRef?.current.valueChanged) {
      return;
    }
    validate('onChange');
  }, 300, [validate]);

  const setError = useCallback((error: string) => {
    setErrorByRuleKey(obj => ({
      ...obj,
      customError: error,
    }));
  }, []);

  const reset = useCallback(() => {
    stateRef.current.valueChanged = false;
    setValidationStatus('notStarted');
    setErrorByRuleKey({});
  }, []);

  useImperativeHandle(ref, () => ({
    validate,
    reset,
    setError,
  }), [reset, setError, validate]);

  const handleChange = useCallback(async (event: unknown) => {
    stateRef.current.valueChanged = true;

    // Reset custom error
    if (errorByRuleKey['customError']) {
      setErrorByRuleKey(obj => omit(obj, 'customError'));
    }
    setValue(getValueFromEvent(event));
    onChange?.(getValueFromEvent(event), event);
  }, [errorByRuleKey, setValue, getValueFromEvent, onChange]);

  return (
    <div className={`${className} ${CSSPrefix}__form-item`} style={style}>
      <label htmlFor={formItemId} className={`${CSSPrefix}__form-item__label`}>
        {renderLabel ? renderLabel(value, formItemId) : label}
      </label>
      {typeof children === 'function'
        ? children({
          value,
          onChange: handleChange,
          validationStatus,
        })
        : React.cloneElement(children, {
          value,
          onChange: (value: unknown) => {
            handleChange(value);
            children.props?.onChange?.(value);
          },
          validationStatus,
          hasFeedback,
          id: formItemId,
        })
      }
      {Object.values(errorByRuleKey).map((error) =>
        renderError
          ? renderError?.(error, value)
          : <div className={`${CSSPrefix}__form-item__error`}>{error}</div>
      )}
    </div>
  );
};

const useField = <T,>(field: string) => {
  const { updateFieldValue, fieldsValue, initField, removeField, formId, CSSPrefix } = useFormContext();
  const ref = useRef<FormItemApi>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    initField(field, ref);

    return () => {
      removeField(field);
    };
  }, [ref, field, initField, removeField]);

  const value = typeof fieldsValue[field] !== 'undefined' ? fieldsValue[field] : '';

  return {
    ref,
    value: value as T,
    setValue: updateFieldValue(field),
    id: formId ? `${formId}:${field}` : undefined,
    CSSPrefix,
  };
};

FormItem.displayName = 'FormItem';
