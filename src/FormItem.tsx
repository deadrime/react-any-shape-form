import React, { CSSProperties, useCallback, useImperativeHandle, useMemo, useRef, useState, useEffect } from 'react';
import { useDebounce } from 'react-use';
import { checkPattern, checkMax, checkMin, checkRequired } from './basicValidation';
import { useFormContext } from './FormContext';
import { FormItemRule, Validator, ValidationStatus, ValidateTrigger } from './types';
import classNames from 'classnames';
import omit from './helpers/omit';
import getAllSettledResults from './helpers/getAllSettledResults';

// I know it's bad, use <input type="email">
const emailRegex =
  /* eslint-disable-next-line no-useless-escape */
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

type ValidationError = {
  ruleKey: string | number;
  errorText: string;
}

type FormItemChildrenProps<T = unknown> = {
  value: T,
  onChange: (value: T) => void
  validationStatus?: ValidationStatus
  hasFeedback?: boolean
  id?: string
}

export type FormItemApi = {
  validate: (trigger?: ValidateTrigger) => Promise<void>;
  reset: () => void;
  setError: (error: string) => void
}

export type FormItemProps = {
  children: React.ReactElement
  label?: React.ReactNode
  name: string
  rules?: FormItemRule[]
  className?: string,
  style?: CSSProperties,
  hasFeedback?: boolean
  getValueFromEvent?: (event: unknown) => unknown
  onInvalid?: (error: string, value: unknown, rule: FormItemRule) => void
  id?: string
  renderLabel?: (value: unknown, formItemId?: string) => React.ReactElement,
  renderError?: (error: string, value: unknown) => React.ReactElement
}

export const FormItem: React.FC<FormItemProps> = ((
  {
    children,
    name,
    rules = [],
    label,
    className,
    style,
    hasFeedback,
    getValueFromEvent = (value) => value,
    onInvalid,
    id: idFromProps,
    renderError,
    renderLabel,
  }) => {
  const { value, setValue, ref, id, CSSPrefix } = useField(name);
  const formItemId = idFromProps || id;
  const [errorByRuleKey, setErrorByRuleKey] = useState<Record<string, string>>({});
  const stateRef = useRef<{ valueChanged: boolean }>({ valueChanged: false });
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('notStarted');

  const rulesWithKey = useMemo(() => rules.map((rule, index) => ({
    ...rule,
    key: index,
    validateTrigger: rule.validateTrigger || ['onChange', 'onFinish'],
  })), [rules]);

  const executeValidator = useCallback(
    async (
      value: unknown,
      validator: Validator,
      rule: FormItemRule & { key: number }
    ) => {
      try {
        await validator(value, rule);
        return Promise.resolve(rule.key);
      } catch (error) {
        const errorText = rule.message || String(error);
        onInvalid?.(rule.message || String(error), value, rule);
        return Promise.reject({
          ruleKey: rule.key,
          errorText,
        }) as Promise<ValidationError>;
      }
    }, [onInvalid]);

  const runValidators = useCallback(async (value: unknown, trigger?: ValidateTrigger) => {
    if (!rulesWithKey.length) {
      return;
    }
    const promises = [];

    for (const rule of rulesWithKey) {
      if (trigger && !rule.validateTrigger.includes(trigger)) {
        // Just to reset error
        promises.push(Promise.resolve(rule.key));
        continue;
      }
      if (rule.required) {
        promises.push(executeValidator(value, checkRequired, rule));
      }
      if (rule.min) {
        promises.push(executeValidator(value, checkMin, rule));
      }
      if (rule.max) {
        promises.push(executeValidator(value, checkMax, rule));
      }
      if (rule.validator) {
        promises.push(executeValidator(value, rule.validator, rule)) ;
      }
      if (rule.pattern) {
        promises.push(executeValidator(value, checkPattern, rule));
      }
      if (rule.type === 'email') {
        promises.push(executeValidator(value, checkPattern, {
          ...rule,
          pattern: emailRegex,
        }));
      }
    }

    const settledPromises = await Promise.allSettled(promises);
    const noErrors = settledPromises.every(promise => promise.status === 'fulfilled');

    setErrorByRuleKey(obj => {
      const {
        rejected,
        fulfilled,
      } = getAllSettledResults<number, ValidationError>(settledPromises);

      for (const fieldKey of fulfilled) {
        delete obj[fieldKey]
      }
      for (const error of rejected) {
        obj[error.ruleKey] = error.errorText
      }

      return obj;
    });

    if (!noErrors) {
      return Promise.reject('reject');
    }
  }, [executeValidator, rulesWithKey]);

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
    // TODO: For another triggers we need to add some logic here
    setValue(getValueFromEvent(event));
  }, [getValueFromEvent, errorByRuleKey, setValue]);

  return (
    <div className={classNames(className, `${CSSPrefix}__form-item`)} style={style}>
      <label htmlFor={formItemId} className={`${CSSPrefix}__form-item__label`}>{renderLabel ? renderLabel(value, formItemId) : label}</label>
      {React.cloneElement(children as React.ReactElement<FormItemChildrenProps>, {
        value,
        onChange: (value: unknown) => {
          handleChange(value);
          children.props?.onChange?.(value);
        },
        validationStatus,
        hasFeedback,
        id: formItemId,
      })}
      {Object.values(errorByRuleKey).map((error) => 
        renderError 
          ? renderError?.(error, value)
          : <div className={`${CSSPrefix}__form-item__error`}>{error}</div>
      )}
    </div>
  );
});

const useField = (field: string) => {
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
    value,
    setValue: updateFieldValue(field),
    id: formId ? `${formId}:${field}` : undefined,
    CSSPrefix,
  };
};

FormItem.displayName = 'FormItem';