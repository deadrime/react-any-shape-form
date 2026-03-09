import { z } from 'zod';
import { ItemSchemaResolver, ValidateTrigger } from '../../types';

export function zodResolver<T>(
  schema: z.ZodType<T>,
  options?: { validateTrigger?: ValidateTrigger[] },
): ItemSchemaResolver<T> {
  return {
    validateTrigger: options?.validateTrigger ?? ['onFinish'],
    _validate: async (value) => {
      const result = await schema.safeParseAsync(value);
      if (result.success) return [];
      return result.error.issues.map(i => i.message);
    },
  };
}
