import { ValidationRule } from './types';

export const checkMin = async <T>(value: T, rule: ValidationRule<T>) => {
  if (!('min' in rule)) {
    return
  }
  if (typeof rule.min !== 'number') {
    return;
  }
  if (typeof value === 'undefined') {
    return Promise.reject(rule.message);
  }
  if (Array.isArray(value) && value.length < rule.min) {
    return Promise.reject(rule.message);
  }
  if (rule.type === 'number' && Number(value) < rule.min) {
    return Promise.reject(rule.message);
  }
  if (rule.type === 'string' && String(value).length < rule.min) {
    return Promise.reject(rule.message);
  }
};

export const checkMax = async <T>(value: T, rule: ValidationRule<T>) => {
  if (!('max' in rule) || typeof rule?.max !== 'number') {
    return
  }
  if (typeof value === 'undefined') {
    return Promise.reject(rule.message);
  }
  if (Array.isArray(value) && value.length > rule.max) {
    return Promise.reject(rule.message);
  }
  if (rule.type === 'number' && Number(value) > rule.max) {
    return Promise.reject(rule.message);
  }
  if (rule.type === 'string' && String(value).length > rule.max) {
    return Promise.reject(rule.message);
  }
};

export const checkRequired = async <T>(value: T, rule: ValidationRule<T>) => {
  if (typeof value === 'undefined') {
    return Promise.reject(rule.message);
  }
  if (typeof value === 'number' && value === 0) {
    return;
  }
  if (Array.isArray(value) && value.length === 0) {
    return Promise.reject(rule.message);
  }
  if (!value && typeof value !== 'boolean') {
    return Promise.reject(rule.message);
  }
};

export const checkPattern = async <T>(value: T, rule: ValidationRule<T>) => {
  if (!('pattern' in rule)) {
    return
  }
  if (typeof value === 'string' && rule.pattern.test(value)) {
    return 
  }
  return Promise.reject(rule.message || 'Invalid format');
};
