export type RuleType = 'string' | 'number' | 'regexp' | 'email';

export type Validator<T = unknown> = (value: T) => Promise<void | unknown>;

export type ValidateTrigger = 'onChange' | 'onFinish'

export type FormItemRule<T = unknown> = {
  required?: boolean,
  validateTrigger?: ValidateTrigger[],
  min?: number,
  max?: number;
  len?: number;
  pattern?: RegExp;
  message?: string;
  type?: RuleType
  validator?: Validator<T>,
}

export type ValidationStatus = 'notStarted' | 'validating' | 'success' | 'error'
