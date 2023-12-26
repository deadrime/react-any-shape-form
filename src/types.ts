export type RuleType = 'string' | 'number' | 'regexp' | 'email';

export type Validator<T = unknown> = (value: T) => Promise<void | unknown>;

export type ValidateTrigger = 'onChange' | 'onFinish'

interface BaseRule {
  required?: boolean
  validateTrigger?: ValidateTrigger[]
  message?: string
  type?: RuleType
}

interface MinRule extends BaseRule {
  type: 'string' | 'number'
  min: number
}

interface MaxRule extends BaseRule {
  type: 'string' | 'number'
  max: number
}

interface PatternRule extends BaseRule {
  type: 'regexp'
  pattern: RegExp;
}

interface RequiredRule extends BaseRule {
  required: boolean;
}

interface CustomValidatorRule<T> extends BaseRule {
  validator: Validator<T>
}

export type FormItemRule<T = unknown> = RequiredRule | MinRule | MaxRule | PatternRule | CustomValidatorRule<T>;

export type ValidationStatus = 'notStarted' | 'validating' | 'success' | 'error'
