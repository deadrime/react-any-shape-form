import * as yup from 'yup';
import { ItemSchemaResolver, ValidateTrigger } from '../../types';

export function yupResolver<T>(
  schema: yup.Schema<T>,
  options?: { validateTrigger?: ValidateTrigger[] },
): ItemSchemaResolver<T> {
  return {
    validateTrigger: options?.validateTrigger ?? ['onSubmit'],
    _validate: async (value) => {
      try {
        await schema.validate(value, { abortEarly: false });
        return [];
      } catch (err) {
        if (err instanceof yup.ValidationError) {
          return err.inner.length > 0
            ? err.inner.map(e => e.message)
            : [err.message];
        }
        throw err;
      }
    },
  };
}
