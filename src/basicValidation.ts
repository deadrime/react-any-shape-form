import { FormItemRule } from './types';

export const checkMin = async (value: unknown, rule: FormItemRule) => {
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

export const checkMax = async (value: unknown, rule: FormItemRule) => {
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

export const checkRequired = async (value: unknown, rule: FormItemRule) => {
  if (typeof value === 'number' && value === 0) {
    return;
  }
  if (typeof value === 'boolean') { //?
    return;
  }
  if (Array.isArray(value) && value.length === 0) {
    return Promise.reject(rule.message);
  }
  if (!value) {
    return Promise.reject(rule.message);
  }
};

export const checkPattern = async (value: unknown, rule: FormItemRule) => {
  if (typeof value === 'string' && !rule.pattern?.test(value)) {
    return Promise.reject(rule.message || 'Invalid format');
  }
  return
};
