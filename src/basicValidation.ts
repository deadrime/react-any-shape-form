import { ValidationRule } from './types';

const checkBound = (key: 'min' | 'max', cmp: (a: number, b: number) => boolean) =>
  async <T>(value: T, rule: ValidationRule<T>, _formState: Record<string, unknown>) => {
    if (!(key in rule)) return;
    const bound = (rule as unknown as Record<string, unknown>)[key];
    if (typeof bound !== 'number') return;
    if (typeof value === 'undefined') throw rule.message;
    if (Array.isArray(value) && cmp(value.length, bound)) throw rule.message;
    if (rule.type === 'number' && cmp(Number(value), bound)) throw rule.message;
    if (rule.type === 'string' && cmp(String(value).length, bound)) throw rule.message;
  };

export const checkMin = checkBound('min', (a, b) => a < b);
export const checkMax = checkBound('max', (a, b) => a > b);

export const checkRequired = async <T>(value: T, rule: ValidationRule<T>, _formState: Record<string, unknown>) => {
  if (typeof value === 'undefined') {
    throw rule.message;
  }
  if (typeof value === 'number' && value === 0) {
    return;
  }
  if (Array.isArray(value) && value.length === 0) {
    throw rule.message;
  }
  if (!value && typeof value !== 'boolean') {
    throw rule.message;
  }
};

export const checkPattern = async <T>(value: T, rule: ValidationRule<T>, _formState: Record<string, unknown>) => {
  if (!('pattern' in rule)) {
    return
  }
  if (typeof value === 'string' && rule.pattern.test(value)) {
    return
  }
  throw rule.message || 'Invalid format';
};
