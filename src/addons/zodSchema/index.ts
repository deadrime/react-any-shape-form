import { z } from 'zod';
import { defineAddon } from '../defineAddon';
import { FormAddon, FormApiAddon, ValidationError, ValidateTrigger } from '../../types';

const ZOD_ADDON_KEY = Symbol('zodSchema');

class ZodSchemaAddon implements FormApiAddon {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private formApi: any, private schema: z.ZodType) {}

  async onValidateFields(fields: string[], trigger?: ValidateTrigger): Promise<ValidationError[]> {
    if (trigger === 'onChange') return [];

    const state = this.formApi.getState();
    const result = await this.schema.safeParseAsync(state);
    if (result.success) return [];

    const errors: ValidationError[] = [];
    for (const issue of result.error.issues) {
      const field = String(issue.path[0] ?? '');
      if (!field || !fields.includes(field)) continue;
      const error: ValidationError = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rule: { validateTrigger: ['onFinish'] } as any,
        value: state[field],
        errorText: issue.message,
      };
      errors.push(error);
      this.formApi.setFieldError?.(field, [error]);
    }
    return errors;
  }
}

export const withZodSchema = <T extends z.ZodType>(schema: T): FormAddon =>
  defineAddon({
    setup(formApi) {
      formApi.installAddon(ZOD_ADDON_KEY, new ZodSchemaAddon(formApi, schema));
    },
  });
