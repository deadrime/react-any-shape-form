import { describe, expect, test, vi } from 'vitest';
import * as yup from 'yup';
import { FormApi } from '../src/FormApi';
import { withYupSchema } from '../src/addons/yupSchema';
import { createForm } from '../src/useForm';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email required'),
  age: yup.number().min(18, 'Must be 18+').required(),
});

describe('withYupSchema', () => {
  test('valid state: no errors thrown', async () => {
    const api = new FormApi({ email: 'test@example.com', age: 20 });
    const addon = withYupSchema(schema);
    addon._setup!(api as any);
    api.setFieldVisible('email', true);
    api.setFieldVisible('age', true);
    await expect(api.validateFields()).resolves.toBeUndefined();
  });

  test('invalid state: throws errors on validateFields', async () => {
    const api = new FormApi({ email: 'bad-email', age: 10 });
    const addon = withYupSchema(schema);
    addon._setup!(api as any);
    api.setFieldVisible('email', true);
    api.setFieldVisible('age', true);
    await expect(api.validateFields()).rejects.toBeDefined();
  });

  test('errors include errorText for invalid fields', async () => {
    const api = new FormApi({ email: 'bad', age: 10 });
    const addon = withYupSchema(schema);
    addon._setup!(api as any);
    const errors = await api.getAddonsErrors(['email', 'age']);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.errorText === 'Invalid email')).toBe(true);
    expect(errors.some(e => e.errorText === 'Must be 18+')).toBe(true);
  });

  test('setFieldError is called — errors visible via onFieldError', async () => {
    const api = new FormApi({ email: 'bad', age: 10 });
    const addon = withYupSchema(schema);
    addon._setup!(api as any);

    const onFieldError = vi.fn();
    api.onFieldError('email', onFieldError);

    await api.getAddonsErrors(['email', 'age']);
    expect(onFieldError).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ errorText: 'Invalid email' })]),
      expect.any(Object),
    );
  });

  test('onChange trigger is skipped', async () => {
    const api = new FormApi({ email: 'bad', age: 10 });
    const addon = withYupSchema(schema);
    addon._setup!(api as any);
    const errors = await api.getAddonsErrors(['email', 'age'], 'onChange');
    expect(errors).toEqual([]);
  });

  test('works via createForm', async () => {
    const form = createForm({ email: 'bad', age: 10 }, withYupSchema(schema));
    form.formApi.setFieldVisible('email', true);
    form.formApi.setFieldVisible('age', true);
    await expect(form.formApi.submit()).rejects.toBeDefined();
  });

  test('fields not in visible list are skipped', async () => {
    const api = new FormApi({ email: 'bad', age: 10 });
    const addon = withYupSchema(schema);
    addon._setup!(api as any);
    const errors = await api.getAddonsErrors(['age']);
    expect(errors.every(e => e.errorText !== 'Invalid email')).toBe(true);
  });
});
