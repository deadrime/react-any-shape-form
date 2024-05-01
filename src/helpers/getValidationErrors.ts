import { checkRequired, checkMin, checkMax, checkPattern } from "../basicValidation";
import { ValidationRule, ValidateTrigger, ValidationError, Validator } from "../types";
import { filterOnlyRejectedPromises } from "./promises";

// I know it's bad, use <input type="email">
const emailRegex =
  /* eslint-disable-next-line no-useless-escape */
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const getValidationErrors = async <Value,>(
  value: Value,
  rules: (ValidationRule<Value> & { validateTrigger: ValidateTrigger[] })[],
  trigger?: ValidateTrigger
) => {
  const result = [] as {
    rule: typeof rules[number],
    validator: Validator<Value>
  }[];

  for (const rule of rules) {
    if (trigger && !rule.validateTrigger.includes(trigger)) {
      continue
    }
    if (rule.required) {
      result.push({
        rule,
        validator: checkRequired,
      });
    }
    if ('min' in rule) {
      result.push({
        rule,
        validator: checkMin,
      });
    }
    if ('max' in rule) {
      result.push({
        rule,
        validator: checkMax,
      });
    }
    if ('validator' in rule) {
      result.push({
        rule,
        validator: rule.validator,
      });
    }
    if (rule.type === 'regexp' && 'pattern' in rule) {
      result.push({
        rule,
        validator: checkPattern,
      });
    }
    if (rule.type === 'email') {
      result.push({
        rule: {
          ...rule,
          type: 'regexp',
          pattern: emailRegex,
        },
        validator: checkPattern,
      })
    }
  }

  const settledPromises = await Promise.allSettled(
    result.map(({ validator, rule }) =>
      validator(value, rule)
        .catch(error => {
          const errorText = rule.message || String(error);
          return Promise.reject<ValidationError>({
            errorText,
            value,
            rule,
          })
        })
    ));

  return filterOnlyRejectedPromises<ValidationError<Value>>(settledPromises).map(i => i.reason);
}
