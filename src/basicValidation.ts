import { FormItemRule } from './types';

export const checkMin = async <T>(value: T, rule: FormItemRule<T>) => {
  if (typeof rule.min !== 'number') {
    return;
  }
  if (rule.type === 'number' && Number(value) < rule.min) {
    return Promise.reject(rule.message);
  }
  if (rule.type === 'string' && String(value).length < rule.min) {
    return Promise.reject(rule.message);
  }
};

export const checkMax = async <T>(value: T, rule: FormItemRule<T>) => {
  if (typeof rule.max !== 'number') {
    return;
  }
  if (rule.type === 'number' && Number(value) > rule.max) {
    return Promise.reject(rule.message);
  }
  if (rule.type === 'string' && String(value).length > rule.max) {
    return Promise.reject(rule.message);
  }
};

export const checkRequired = async <T>(value: T, rule: FormItemRule<T>) => {
  if (typeof value === 'number' && value === 0) {
    return;
  }
  if (typeof value === 'boolean') {
    if (typeof value === 'undefined' || value === null) {
      return Promise.reject(rule.message);
    }
    return;
  }
  if (Array.isArray(value) && value.length === 0) {
    return Promise.reject(rule.message);
  }
  if (!value) {
    return Promise.reject(rule.message);
  }
};

export const checkPattern = async <T>(value: T, rule: FormItemRule<T>) => {
  if (typeof value === 'string' && !rule.pattern?.test(value)) {
    return Promise.reject(rule.message || 'Invalid format');
  }
  return
};
