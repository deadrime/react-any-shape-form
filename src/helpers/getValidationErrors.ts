import { checkRequired, checkMin, checkMax, checkPattern } from "../basicValidation";
import { ValidationRule, ValidateTrigger, ValidationError, Validator } from "../types";

const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;

type PreparedRule<Value> = {
  rule: ValidationRule<Value> & { validateTrigger: ValidateTrigger[] },
  validator: Validator<Value>
}

export const prepareRules = <Value,>(
  rules: (ValidationRule<Value>)[],
  trigger?: ValidateTrigger
) => {
  const result: PreparedRule<Value>[] = [];

  for (const rule of rules) {
    const validateTrigger = rule.validateTrigger || ['onChange', 'onFinish']
    const preparedRule = {
      ...rule,
      validateTrigger,
    } 
    if (trigger && !validateTrigger.includes(trigger)) {
      continue
    }
    if (rule.required) {
      result.push({
        rule: preparedRule,
        validator: checkRequired,
      });
    }
    if ('min' in rule) {
      result.push({
        rule: preparedRule,
        validator: checkMin,
      });
    }
    if ('max' in rule) {
      result.push({
        rule: preparedRule,
        validator: checkMax,
      });
    }
    if ('validator' in rule) {
      result.push({
        rule: preparedRule,
        validator: rule.validator,
      });
    }
    if (rule.type === 'regexp' && 'pattern' in rule) {
      result.push({
        rule: preparedRule,
        validator: checkPattern,
      });
    }
    if (rule.type === 'email') {
      result.push({
        rule: {
          ...preparedRule,
          type: 'regexp',
          pattern: emailRegex,
        },
        validator: checkPattern,
      })
    }
  }

  return result;
}

export const getValidationErrors = async <Value, State extends Record<string, unknown> = Record<string, unknown>>(
  value: Value,
  rules: PreparedRule<Value>[],
  formState: State
) => {
  const results = await Promise.all(
    rules.map(({ validator, rule }) =>
      validator(value, rule, formState)
        .then(() => null, error => ({
          errorText: rule.message || String(error),
          value,
          rule,
        } as ValidationError<Value>))
    ));

  return results.filter(Boolean) as ValidationError<Value>[];
}
