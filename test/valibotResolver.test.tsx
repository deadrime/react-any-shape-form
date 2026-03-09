import { describe, expect, test } from 'vitest';
import * as v from 'valibot';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { createForm } from '../src/index';
import { withArrayFields } from '../src/addons/array';
import { valibotResolver } from '../src/addons/valibotSchema/resolver';

const userSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'Name is required')),
  email: v.pipe(v.string(), v.email('Invalid email')),
});

describe('valibotResolver', () => {
  test('valid value returns no errors', async () => {
    const resolver = valibotResolver(userSchema);
    const errors = await resolver._validate({ name: 'Alice', email: 'alice@example.com' });
    expect(errors).toEqual([]);
  });

  test('single error returns message', async () => {
    const resolver = valibotResolver(v.pipe(v.string(), v.email('Bad email')));
    const errors = await resolver._validate('not-an-email');
    expect(errors).toEqual(['Bad email']);
  });

  test('multiple errors are returned as separate messages', async () => {
    const resolver = valibotResolver(userSchema);
    const errors = await resolver._validate({ name: '', email: 'bad' });
    expect(errors).toContain('Name is required');
    expect(errors).toContain('Invalid email');
  });

  test('default validateTrigger is onFinish', () => {
    const resolver = valibotResolver(userSchema);
    expect(resolver.validateTrigger).toEqual(['onFinish']);
  });

  test('validateTrigger can be overridden', () => {
    const resolver = valibotResolver(userSchema, { validateTrigger: ['onChange'] });
    expect(resolver.validateTrigger).toEqual(['onChange']);
  });

  test('empty array value produces no errors', async () => {
    const arraySchema = v.array(v.string());
    const resolver = valibotResolver(arraySchema);
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
        <MyForm.ArrayItem name="users" schema={valibotResolver(userSchema)}>
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

  test('schema and itemRules both fire', async () => {
    const MyForm = createForm(
      { tags: [''] as string[] },
      withArrayFields(),
    );

    const TestComponent = () => (
      <MyForm>
        <MyForm.ArrayItem
          name="tags"
          schema={valibotResolver(v.pipe(v.string(), v.minLength(2, 'Too short')))}
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
      expect(errorText).toContain('Too short');
    });
  });
});
