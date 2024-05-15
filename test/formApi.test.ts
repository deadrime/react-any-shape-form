import { beforeEach, describe, expect, expectTypeOf, test, vi } from "vitest";
import { FormApi } from "../src/FormApi";
import { ValidationRule } from "../src";

describe('test FormApi', () => {
  const defaultState = {
    strField: '',
    numField: 0,
    boolField: false,
    strArray: [] as string[],
    numArray: [] as number[],
  }

  let api: FormApi<typeof defaultState>;

  beforeEach(() => {
    api = new FormApi(defaultState);
    vi.resetAllMocks();
    api.resetFields();
  })

  test('get state return initial state', () => {
    expect(api.getState()).toEqual(defaultState);
  })

  test('setInitialState', () => {
    api.setInitialState({
      boolField: true,
      numArray: [3,2,1],
      numField: 1,
      strArray: ['3','2','1'],
      strField: 'heh'
    });
    expect(api.getState()).toEqual({
      boolField: true,
      numArray: [3,2,1],
      numField: 1,
      strArray: ['3','2','1'],
      strField: 'heh'
    })
  })

  test('types', () => {
    type FieldType = "strField" | "numField" | "boolField" | "strArray" | "numArray";
    expectTypeOf(api.getState()).toEqualTypeOf<typeof defaultState>()
    expectTypeOf(api.getFieldValue).parameter(0).toEqualTypeOf<FieldType>()
    expectTypeOf(api.setFieldValue).parameter(0).toEqualTypeOf<FieldType>()
  })

  test('setFieldValue/getFieldValue', () => {
    api.setFieldValue('strField', 'test');
    expect(api.getFieldValue('strField')).eq('test')
  })

  test('setFieldValue/getFieldValue', () => {
    api.setFieldValue('strField', 'test');
    expect(api.getFieldValue('strField')).eq('test')
  })

  test('setFieldsValue/getFieldsValue', () => {
    api.setFieldsValue({
      strField: 'test2',
      numField: 123,
      numArray: [1, 2, 3]
    });

    expect(api.getFieldsValue(['strField', 'numField', 'numArray'])).toEqual({
      strField: 'test2',
      numField: 123,
      numArray: [1, 2, 3]
    })

    expect(api.getFieldsValue()).toEqual({
      strField: 'test2',
      numField: 123,
      numArray: [1, 2, 3],
      boolField: false,
      strArray: [],
    })
  })

  test('onFieldChange', () => {
    const onFieldChange = vi.fn();
    api.onFieldChange('strField', onFieldChange);
    api.setFieldValue('strField', 'test1');
    api.setFieldValue('strField', 'test2');
    expect(onFieldChange).toBeCalledWith('test1');
    expect(onFieldChange).toBeCalledWith('test2');
    expect(onFieldChange).toBeCalledTimes(2);
    expect(api.getFieldValue('strField')).eq('test2');
  })

  test('onSubmit without validation rules', async () => {
    const onSubmit = vi.fn();
    api.onSubmit(onSubmit);
    api.setFieldsValue({
      strField: 'test',
      numField: 123,
      numArray: [1, 2, 3]
    });
    await api.submit();
    expect(onSubmit).toBeCalledWith({
      strField: 'test',
      numField: 123,
      boolField: false,
      strArray: [],
      numArray: [ 1, 2, 3 ]
    })
  })

  test('onFieldError', async () => {
    const rule: ValidationRule = {
      required: true,
      message: 'StrRequired',
      validateTrigger: ['onFinish']
    }
    api.setFieldRules('strField', [rule])
    api.setFieldsValue({
      strField: '',
    });
    const onFieldError = vi.fn();
    api.onFieldError('strField', onFieldError);
    const errors = await api.getFieldsError(['strField']);
    expect(errors).toEqual([
      {
        rule,
        value: '',
        errorText: 'StrRequired',
      }
    ])
    expect(onFieldError).toBeCalledWith(
      [
        {
          rule,
          value: '',
          errorText: 'StrRequired',
        }
      ],
      api.getState()
    )
  })

  describe('validation', async () => {
    describe('required', async () => {
      test('string', async () => {
        api.setFieldRules('strField', [{
          required: true,
          message: 'StrRequired'
        }])
        expect(api.validateField('strField')).rejects.toHaveProperty('[0].errorText', 'StrRequired')
        api.setFieldValue('strField', 'heh');
        expect(api.validateField('strField')).resolves.empty
      })
      test('number', async () => {
        api.setFieldRules('numField', [{
          required: true,
          message: 'numRequired'
        }])
        api.setFieldValue('numField', undefined as any);
        expect(api.validateField('numField')).rejects.toHaveProperty('[0].errorText', 'numRequired')
        api.setFieldValue('numField', 0);
        expect(api.validateField('strField')).resolves.empty
      })
      test('boolean', async () => {
        api.setFieldRules('boolField', [{
          required: true,
          message: 'boolRequired'
        }])
        api.setFieldValue('boolField', undefined as any);
        expect(api.validateField('boolField')).rejects.toHaveProperty('[0].errorText', 'boolRequired')
        api.setFieldValue('boolField', false);
        expect(api.validateField('strField')).resolves.empty
      })
      test('array', async () => {
        api.setFieldRules('numArray', [{
          required: true,
          message: 'numArrayRequired'
        }])
        api.setFieldValue('numArray', []);
        expect(api.validateField('numArray')).rejects.toHaveProperty('[0].errorText', 'numArrayRequired')
        api.setFieldValue('numArray', [1,2,3]);
        expect(api.validateField('strField')).resolves.empty
      })
    })
    describe('min/max', async () => {
      describe('type = string, min = 4, max = 8', async () => {
        beforeEach(() => {
          api.setFieldRules('strField', [{
            min: 4,
            max: 8,
            type: 'string',
            message: 'minMaxError'
          }])
        })

        test('error if value = undefined', async () => {
          api.setFieldValue('strField', undefined as any);
          expect(api.validateField('strField')).rejects.toHaveProperty('[0].errorText', 'minMaxError')
        })

        test('error if value = \'\'', async () => {
          expect(api.validateField('strField')).rejects.toHaveProperty('[0].errorText', 'minMaxError')
        })

        test('error if length = 3', async () => {
          api.setFieldValue('strField', '123');
          expect(api.validateField('strField')).rejects.toHaveProperty('[0].errorText', 'minMaxError')
        })
        
        test('no error if length = 4', async () => {
          api.setFieldValue('strField', '1234');
          expect(api.validateField('strField')).resolves.empty
        })

        test('no error if length = 8', async () => {
          api.setFieldValue('strField', '12345678');
          expect(api.validateField('strField')).resolves.empty
        })

        test('error if length = 9', async () => {
          api.setFieldValue('strField', '123456789');
          expect(api.validateField('strField')).rejects.toHaveProperty('[0].errorText', 'minMaxError')
        })
      })
      describe('type = number, min = 4, max = 8', async () => {
        beforeEach(() => {
          api.setFieldRules('numField', [{
            min: 4,
            max: 8,
            type: 'number',
            message: 'minMaxError'
          }])
        })

        test('error if value = undefined', async () => {
          api.setFieldValue('numField', undefined as any);
          expect(api.validateField('numField')).rejects.toHaveProperty('[0].errorText', 'minMaxError')
        })

        test('error if value = 0', async () => {
          api.setFieldValue('numField', 0);
          expect(api.validateField('numField')).rejects.toHaveProperty('[0].errorText', 'minMaxError')
        })

        test('error if value = 1', async () => {
          api.setFieldValue('numField', 1);
          expect(api.validateField('numField')).rejects.toHaveProperty('[0].errorText', 'minMaxError')
        })

        test('no error if value = 4', async () => {
          api.setFieldValue('numField', 4);
          expect(api.validateField('numField')).resolves.empty
        })

        test('no error if value = 8', async () => {
          api.setFieldValue('numField', 8);
          expect(api.validateField('numField')).resolves.empty
        })

        test('error if value = 9', async () => {
          api.setFieldValue('numField', 9);
          expect(api.validateField('numField')).rejects.toHaveProperty('[0].errorText', 'minMaxError')
        })
      })

      describe('type = array, min = 4', async () => {
        beforeEach(() => {
          api.setFieldRules('numArray', [{
            min: 4,
            max: 8,
            type: 'array',
            message: 'minMaxError'
          }])
        })

        test('error if field value = undefined', async () => {
          api.setFieldValue('numArray', undefined as any);
          expect(api.validateField('numArray')).rejects.toHaveProperty('[0].errorText', 'minMaxError')
        })

        test('error if field value = []', async () => {
          api.setFieldValue('numArray', []);
          expect(api.validateField('numArray')).rejects.toHaveProperty('[0].errorText', 'minMaxError')
        })

        test('error if field value = [1,2,3]', async () => {
          api.setFieldValue('numArray', [1, 2, 3]);
          expect(api.validateField('numArray')).rejects.toHaveProperty('[0].errorText', 'minMaxError')
        })

        test('no error if field value = [1,2,3,4]', async () => {
          api.setFieldValue('numArray', [1,2,3,4]);
          expect(api.validateField('numArray')).resolves.empty
        })

        test('no error if field value = [1,2,3,4,5,6,7,8]', async () => {
          api.setFieldValue('numArray', [1,2,3,4,5,6,7,8]);
          expect(api.validateField('numArray')).resolves.empty
        })

        test('error if field value = [1,2,3,4,5,6,7,8,9]', async () => {
          api.setFieldValue('numArray', [1,2,3,4,5,6,7,8,9]);
          expect(api.validateField('numArray')).rejects.toHaveProperty('[0].errorText', 'minMaxError')
        })
      })
    })

    describe('email', async () => {
      beforeEach(() => {
        api.setFieldRules('strField', [{
          type: 'email',
          message: 'emailInvalidError'
        }])
      })

      test('error if value = undefined', async () => {
        api.setFieldValue('strField', undefined as any);
        expect(api.validateField('strField')).rejects.toHaveProperty('[0].errorText', 'emailInvalidError')
      })

      test('error if value = \'\'', async () => {
        expect(api.validateField('strField')).rejects.toHaveProperty('[0].errorText', 'emailInvalidError')
      })

      test('error if "abcd"', async () => {
        api.setFieldValue('strField', 'abcd');
        expect(api.validateField('strField')).rejects.toHaveProperty('[0].errorText', 'emailInvalidError')
      })

      test('error if "abcd@"', async () => {
        api.setFieldValue('strField', 'abcd@');
        expect(api.validateField('strField')).rejects.toHaveProperty('[0].errorText', 'emailInvalidError')
      })

      test('error if "abcd@."', async () => {
        api.setFieldValue('strField', 'abcd@.');
        expect(api.validateField('strField')).rejects.toHaveProperty('[0].errorText', 'emailInvalidError')
      })

      test('error if "abcd@a"', async () => {
        api.setFieldValue('strField', 'abcd@a');
        expect(api.validateField('strField')).rejects.toHaveProperty('[0].errorText', 'emailInvalidError')
      })

      test('error if "a@abc.com"', async () => {
        api.setFieldValue('strField', 'abcd@a');
        expect(api.validateField('strField')).rejects.toHaveProperty('[0].errorText', 'emailInvalidError')
      })

      test('error if "abcd@hostname"', async () => {
        api.setFieldValue('strField', 'abcd@hostname');
        expect(api.validateField('strField')).rejects.toHaveProperty('[0].errorText', 'emailInvalidError')
      })

      test('no error if "abcd@hostname.com"', async () => {
        api.setFieldValue('strField', 'abcd@hostname.com');
        expect(api.validateField('strField')).resolves.empty;
      })
    })

    describe('regexp', async () => {
      beforeEach(() => {
        api.setFieldRules('strField', [{
          type: 'regexp',
          pattern: /[a-z]+/g,
          message: 'patternError'
        }])
      })

      test('error if value "123"', async () => {
        api.setFieldValue('strField', '123');
        expect(api.validateField('strField')).rejects.toHaveProperty('[0].errorText', 'patternError')
      })

      test('no error if value "abcd"', async () => {
        api.setFieldValue('strField', 'abcd');
        expect(api.validateField('strField')).resolves.empty
      })
    })
  })
})
