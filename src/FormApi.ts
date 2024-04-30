import { getValidationErrors } from "./helpers/getValidationErrors";
import { FieldError, FieldOnChangeCb, FieldOnErrorCb, FieldOnSubmitCb, FieldUpdate, FieldsUpdateCb, FormItemRule, ValidateTrigger, ValidationError } from "./types";

export class FormApi<State extends Record<string, unknown>, Field extends Extract<keyof State, string> = Extract<keyof State, string>> {
  private state: State
  private readonly initialState: State;
  private fieldErrors: Partial<Record<Field, FieldError<State[Field]>[]>>
  private validationRulesByField: Partial<Record<Field, FormItemRule<State[Field]>[]>>
  private subscribers: Map<Field, FieldOnChangeCb<State[Field]>[]>;
  private errorSubscribers: Map<Field, FieldOnErrorCb<State[Field], State>[]>;
  private submitSubscribers: Set<FieldOnSubmitCb<State>>;

  constructor(state: State) {
    this.state = state;
    this.initialState = structuredClone(state);
    this.fieldErrors = {};
    this.validationRulesByField = {};
    this.subscribers = new Map();
    this.errorSubscribers = new Map();
    this.submitSubscribers = new Set();
  }

  getState() {
    return this.state
  }

  onFieldChange<F extends Field>(field: F, cb: FieldOnChangeCb<State[F]>) {
    const currentSubscribers = this.subscribers.get(field) || [];
    this.subscribers.set(field, currentSubscribers.concat(cb as FieldOnChangeCb<State[Field]>));

    return () => {
      this.subscribers.set(field, this.subscribers.get(field)?.filter(i => i !== cb) || []);
    }
  }

  private triggerFieldUpdate<F extends Field, V extends State[F]>(field: F, value: V) {
    this.subscribers.get(field)?.forEach(cb => cb(value));
  }

  private triggerFieldError(field: Field, validationErrors: ValidationError<State[Field]>[]) {
    this.fieldErrors[field] = validationErrors;
    this.errorSubscribers.get(field)?.forEach(cb => cb(validationErrors, this.state))
  }

  onFieldError<F extends Field>(field: F, cb: FieldOnErrorCb<State[F], State>) {
    const currentSubscribers = this.errorSubscribers.get(field) || [];
    this.errorSubscribers.set(field, currentSubscribers.concat(cb as unknown as FieldOnErrorCb<State[Field], State>))

    return () => {
      this.errorSubscribers.set(field, this.errorSubscribers.get(field)?.filter(i => i !== cb as unknown as FieldOnErrorCb<State[Field], State>) || []);
    }
  }

  setFieldsValue(update: Partial<State>) {
    this.state = {
      ...this.state,
      ...update,
    }
    for (const field in update) {
      this.triggerFieldUpdate(field as Field, update[field] as State[Field])
    }
  }

  setFieldValue<F extends Field>(field: F, value: FieldUpdate<State[F]>) {
    if (typeof value === 'function') {
      this.state[field] = (value as FieldsUpdateCb<State[typeof field]>)(this.state[field]);
    } else {
      this.state[field as Field] = value
    }
    this.triggerFieldUpdate(field, this.state[field])
  }

  getFieldValue<F extends Field>(field: F) {
    return this.state[field];
  }

  getFieldsValue(fields?: Field[]) {
    return fields ? fields.reduce((acc, curr) => {
      acc[curr] = this.state[curr]
      return acc;
    }, {} as Record<Field, State[Field]>) : this.state;
  }

  resetFields() {
    this.setFieldsValue(this.initialState);
  }

  setFieldRules<F extends Field>(field: F, validationRules: FormItemRule<State[F]>[]) {
    if (!validationRules) {
      return
    }
    this.validationRulesByField[field] = validationRules as FormItemRule<State[Field]>[];
  }

  addFieldRules<F extends Field>(field: F, validationRules: FormItemRule<State[F]>[]) {
    if (!validationRules) {
      return
    }
    const rules = this.validationRulesByField[field] || [];
    this.validationRulesByField[field] = rules.concat(...validationRules as FormItemRule<State[Field]>[]);
  }

  async getFieldError<F extends Field>(field: F, trigger?: ValidateTrigger) {
    const rules = this.validationRulesByField[field];

    if (!rules) {
      return []
    }

    const rulesWithKey = rules.map((rule, index) => ({
      ...rule,
      key: String(index),
      validateTrigger: rule.validateTrigger || ['onChange', 'onFinish'],
    }))

    const validationErrors = await getValidationErrors(this.state[field], rulesWithKey, trigger);

    this.triggerFieldError(field, validationErrors);
    // TODO: Fow to fix this type?
    return validationErrors as unknown as ValidationError<State[F]>[]
  }

  async getFieldsError(fields: Field[] = Object.keys(this.state) as Field[], trigger?: ValidateTrigger) {
    const errors = (await Promise.all(fields.map(field => this.getFieldError(field, trigger)))).flat()
    return errors
  }

  async validateField(field: Field, trigger?: ValidateTrigger) {
    const errors = await this.getFieldError(field, trigger);
    if (errors.length > 0) {
      return Promise.reject('reject');
    }
    return Promise.resolve()
  }

  async validateFields(fieldNames?: Field[], trigger?: ValidateTrigger) {
    const errors = await this.getFieldsError(fieldNames, trigger);
    if (errors.length > 0) {
      return Promise.reject('reject');
    }
    return Promise.resolve()
  }

  onSubmit(cb: FieldOnSubmitCb<State>) {
    this.submitSubscribers.add(cb);

    return () => {
      this.submitSubscribers.delete(cb);
    }
  }

  async submit() {
    await this.validateFields();
    this.submitSubscribers.forEach(cb => cb(this.state))
    return this.state
  }
}
