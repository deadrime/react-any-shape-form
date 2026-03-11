import { describe, expect, test } from 'vitest';
import { z } from 'zod';
import { act, render, renderHook, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { createForm } from '../src/index';
import { withArrayFields } from '../src/addons/array';
import { zodResolver } from '../src/addons/zodSchema/resolver';

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

describe('zodResolver', () => {
  test('valid value returns no errors', async () => {
    const resolver = zodResolver(userSchema);
    const errors = await resolver._validate({ name: 'Alice', email: 'alice@example.com' });
    expect(errors).toEqual([]);
  });

  test('single error returns message', async () => {
    const resolver = zodResolver(z.string().email('Bad email'));
    const errors = await resolver._validate('not-an-email');
    expect(errors).toEqual(['Bad email']);
  });

  test('multiple errors are returned as separate messages', async () => {
    const resolver = zodResolver(userSchema);
    const errors = await resolver._validate({ name: '', email: 'bad' });
    expect(errors).toContain('Name is required');
    expect(errors).toContain('Invalid email');
  });

  test('default validateTrigger is onSubmit', () => {
    const resolver = zodResolver(userSchema);
    expect(resolver.validateTrigger).toEqual(['onSubmit']);
  });

  test('validateTrigger can be overridden', () => {
    const resolver = zodResolver(userSchema, { validateTrigger: ['onChange'] });
    expect(resolver.validateTrigger).toEqual(['onChange']);
  });

  test('empty array value produces no errors', async () => {
    const arraySchema = z.array(z.string());
    const resolver = zodResolver(arraySchema);
    const errors = await resolver._validate([]);
    expect(errors).toEqual([]);
  });

  test('integration: withArrayFields + schema prop + submit rejects with item errors', async () => {
    const MyForm = createForm(
      { users: [{ name: '', email: 'bad' }] as { name: string; email: string }[] },
      withArrayFields(),
    );

    const TestComponent = () => (
      <MyForm>
        <MyForm.ArrayItem name="users" schema={zodResolver(userSchema)}>
          {({ items }) => (
            <div>
              {items.map((item, i) => (
                <div key={i} data-testid={`item-errors-${i}`}>
                  {item.errors.map(e => e.errorText).join(', ')}
                </div>
              ))}
            </div>
          )}
        </MyForm.ArrayItem>
        <button
          data-testid="submit-btn"
          onClick={() => MyForm.formApi.submit().catch(() => {})}
        >
          Submit
        </button>
      </MyForm>
    );

    const { getByTestId } = render(<TestComponent />);

    await userEvent.click(getByTestId('submit-btn'));

    await waitFor(() => {
      const errorText = getByTestId('item-errors-0').textContent;
      expect(errorText).toContain('Name is required');
    });
  });

  test('append throws and does not mutate on invalid value', async () => {
    const MyForm = createForm({ users: [] as { name: string }[] }, withArrayFields());
    const itemSchema = zodResolver(z.object({ name: z.string().min(1, 'Name required') }));

    const { result } = renderHook(
      () => MyForm.useArrayField('users', { schema: itemSchema }),
      { wrapper: ({ children }) => <MyForm>{children}</MyForm> },
    );

    await expect(result.current.append({ name: '' })).rejects.toThrow('Name required');
    expect(MyForm.formApi.getFieldValue('users')).toHaveLength(0);
  });

  test('append resolves and mutates on valid value', async () => {
    const MyForm = createForm({ users: [] as { name: string }[] }, withArrayFields());
    const itemSchema = zodResolver(z.object({ name: z.string().min(1, 'Name required') }));

    const { result } = renderHook(
      () => MyForm.useArrayField('users', { schema: itemSchema }),
      { wrapper: ({ children }) => <MyForm>{children}</MyForm> },
    );

    await act(() => result.current.append({ name: 'Alice' }));
    expect(MyForm.formApi.getFieldValue('users')).toHaveLength(1);
  });

  test('update throws and does not mutate on invalid value', async () => {
    const MyForm = createForm({ users: [{ name: 'Alice' }] as { name: string }[] }, withArrayFields());
    const itemSchema = zodResolver(z.object({ name: z.string().min(1, 'Name required') }));

    const { result } = renderHook(
      () => MyForm.useArrayField('users', { schema: itemSchema }),
      { wrapper: ({ children }) => <MyForm>{children}</MyForm> },
    );

    await expect(result.current.update(0, { name: '' })).rejects.toThrow('Name required');
    expect((MyForm.formApi.getFieldValue('users') as { name: string }[])[0].name).toBe('Alice');
  });

  test('schema and itemRules both fire', async () => {
    const MyForm = createForm(
      { tags: [''] as string[] },
      withArrayFields(),
    );

    const TestComponent = () => (
      <MyForm>
        <MyForm.ArrayItem
          name="tags"
          schema={zodResolver(z.string().min(2, 'Too short'))}
          itemRules={[{ required: true, message: 'Required' }]}
        >
          {({ items }) => (
            <div>
              {items.map((item, i) => (
                <div key={i} data-testid={`item-errors-${i}`}>
                  {item.errors.map(e => e.errorText).join(', ')}
                </div>
              ))}
            </div>
          )}
        </MyForm.ArrayItem>
        <button
          data-testid="submit-btn"
          onClick={() => MyForm.formApi.submit().catch(() => {})}
        >
          Submit
        </button>
      </MyForm>
    );

    const { getByTestId } = render(<TestComponent />);

    await userEvent.click(getByTestId('submit-btn'));

    await waitFor(() => {
      const errorText = getByTestId('item-errors-0').textContent;
      // Both schema error and itemRules error should appear
      expect(errorText).toContain('Too short');
    });
  });
});
