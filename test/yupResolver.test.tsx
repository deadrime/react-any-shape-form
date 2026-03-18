import { describe, expect, test } from 'vitest';
import * as yup from 'yup';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { createForm } from '../src/index';
import { withArrayFields } from '../src/addons/array';
import { yupResolver } from '../src/addons/yupSchema/resolver';

const userSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required(),
});

describe('yupResolver', () => {
  test('valid value returns no errors', async () => {
    const resolver = yupResolver(userSchema);
    const errors = await resolver._validate({ name: 'Alice', email: 'alice@example.com' });
    expect(errors).toEqual([]);
  });

  test('single error returns message', async () => {
    const resolver = yupResolver(yup.string().email('Bad email'));
    const errors = await resolver._validate('not-an-email');
    expect(errors).toEqual(['Bad email']);
  });

  test('multiple errors are returned as separate messages', async () => {
    const resolver = yupResolver(userSchema);
    const errors = await resolver._validate({ name: '', email: 'bad' });
    expect(errors).toContain('Name is required');
    expect(errors).toContain('Invalid email');
  });

  test('default validateTrigger is onSubmit', () => {
    const resolver = yupResolver(userSchema);
    expect(resolver.validateTrigger).toEqual(['onSubmit']);
  });

  test('validateTrigger can be overridden', () => {
    const resolver = yupResolver(userSchema, { validateTrigger: ['onChange'] });
    expect(resolver.validateTrigger).toEqual(['onChange']);
  });

  test('empty array value produces no errors', async () => {
    const arraySchema = yup.array().of(yup.string());
    const resolver = yupResolver(arraySchema);
    const errors = await resolver._validate([]);
    expect(errors).toEqual([]);
  });

  test('integration: withArrayFields + schema prop + submit rejects with item errors', async () => {
    const MyForm = createForm<{ users: { name: string; email: string }[] }>().withAddons(withArrayFields());

    const TestComponent = () => (
      <MyForm.ArrayItem name="users" schema={yupResolver(userSchema)}>
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
    );

    const { getByTestId } = render(
      <MyForm.Form
        initialState={{ users: [{ name: '', email: 'bad' }] }}
      >
        <TestComponent />
        <MyForm.Submit>
          <button data-testid="submit-btn">Submit</button>
        </MyForm.Submit>
      </MyForm.Form>
    );

    await userEvent.click(getByTestId('submit-btn'));

    await waitFor(() => {
      const errorText = getByTestId('item-errors-0').textContent;
      expect(errorText).toContain('Name is required');
    });
  });

  test('schema and itemRules both fire', async () => {
    const MyForm = createForm<{ tags: string[] }>().withAddons(withArrayFields());

    const TestComponent = () => (
      <MyForm.ArrayItem
        name="tags"
        schema={yupResolver(yup.string().min(2, 'Too short'))}
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
    );

    const { getByTestId } = render(
      <MyForm.Form
        initialState={{ tags: [''] }}
      >
        <TestComponent />
        <MyForm.Submit>
          <button data-testid="submit-btn">Submit</button>
        </MyForm.Submit>
      </MyForm.Form>
    );

    await userEvent.click(getByTestId('submit-btn'));

    await waitFor(() => {
      const errorText = getByTestId('item-errors-0').textContent;
      expect(errorText).toContain('Too short');
    });
  });
});
