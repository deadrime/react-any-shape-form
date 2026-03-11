import * as v from 'valibot';
import { defineAddon } from '../defineAddon';
import { FormAddon, FormApiAddon, ValidationError, ValidateTrigger } from '../../types';

const VALIBOT_ADDON_KEY = Symbol('valibotSchema');

class ValibotSchemaAddon implements FormApiAddon {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private formApi: any, private schema: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>) {}

  async onValidateFields(fields: string[], trigger?: ValidateTrigger): Promise<ValidationError[]> {
    if (trigger === 'onChange') return [];

    const state = this.formApi.getState();
    const result = v.safeParse(this.schema, state);
    if (result.success) return [];

    const errors: ValidationError[] = [];
    for (const issue of result.issues) {
      const field = String(issue.path?.[0]?.key ?? '');
      if (!field || !fields.includes(field)) continue;
      const error: ValidationError = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rule: { validateTrigger: ['onSubmit'] } as any,
        value: state[field],
        errorText: issue.message,
      };
      errors.push(error);
      this.formApi.setFieldError?.(field, [error]);
    }
    return errors;
  }
}

export const withValibotSchema = (schema: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>): FormAddon =>
  defineAddon({
    setup(formApi) {
      formApi.installAddon(VALIBOT_ADDON_KEY, new ValibotSchemaAddon(formApi, schema));
    },
  });
