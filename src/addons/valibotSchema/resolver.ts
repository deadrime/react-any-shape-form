import * as v from 'valibot';
import { ItemSchemaResolver, ValidateTrigger } from '../../types';

export function valibotResolver<T>(
  schema: v.BaseSchema<T, T, v.BaseIssue<unknown>>,
  options?: { validateTrigger?: ValidateTrigger[] },
): ItemSchemaResolver<T> {
  return {
    validateTrigger: options?.validateTrigger ?? ['onFinish'],
    _validate: async (value) => {
      const result = await v.safeParseAsync(schema, value);
      if (result.success) return [];
      return result.issues.map(i => i.message);
    },
  };
}
