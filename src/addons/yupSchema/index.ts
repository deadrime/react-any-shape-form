import * as yup from 'yup';
import { defineAddon } from '../defineAddon';
import { FormAddon, FormApiAddon, ValidationError, ValidateTrigger } from '../../types';

const YUP_ADDON_KEY = Symbol('yupSchema');

class YupSchemaAddon implements FormApiAddon {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private formApi: any, private schema: yup.Schema) {}

  async onValidateFields(fields: string[], trigger?: ValidateTrigger): Promise<ValidationError[]> {
    if (trigger === 'onChange') return [];

    const state = this.formApi.getState();
    try {
      await this.schema.validate(state, { abortEarly: false });
      return [];
    } catch (err) {
      if (!(err instanceof yup.ValidationError)) return [];

      const errors: ValidationError[] = [];
      for (const inner of err.inner) {
        const field = inner.path?.split('.')[0] ?? '';
        if (!field || !fields.includes(field)) continue;
        const error: ValidationError = {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          rule: { validateTrigger: ['onFinish'] } as any,
          value: state[field],
          errorText: inner.message,
        };
        errors.push(error);
        this.formApi.setFieldError?.(field, [error]);
      }
      return errors;
    }
  }
}

export const withYupSchema = (schema: yup.Schema): FormAddon =>
  defineAddon({
    setup(formApi) {
      formApi.installAddon(YUP_ADDON_KEY, new YupSchemaAddon(formApi, schema));
    },
  });
