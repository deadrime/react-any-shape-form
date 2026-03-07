import { getValidationErrors, prepareRules } from "./helpers/getValidationErrors";
import { FieldError, FieldOnChangeCb, FieldOnErrorCb, FieldOnSubmitCb, FieldUpdate, FieldsUpdateCb, ValidationRule, ValidateTrigger, ValidationError, FieldOnValidationStatusChangeCb, ValidationStatus, FormApiPlugin } from "./types";
import { GetFields } from "./typesHelpers";

export class FormApi<State extends Record<string, unknown>, Field extends GetFields<State> = GetFields<State>> {
  private state: State
  private initialState: State;
  private fieldErrors: Partial<Record<Field, FieldError<State[Field]>[]>>
  private validationStatusByField: Partial<Record<Field, ValidationStatus>>
  private validationRulesByField: Partial<Record<Field, ValidationRule<State[Field]>[]>>
  private subscribers: Map<Field, FieldOnChangeCb<State[Field]>[]>;
  private errorSubscribers: Map<Field, FieldOnErrorCb<State[Field], State>[]>;
  private submitSubscribers: Set<FieldOnSubmitCb<State>>;
  private validationSubscribers: Map<Field, FieldOnValidationStatusChangeCb<State[Field]>[]>;
  private visibleFields: Set<Field>
  private readonly _plugins = new Map<symbol, FormApiPlugin>();

  constructor(state: State) {
    this.state = state;
    this.initialState = structuredClone(state);
    this.fieldErrors = {};
    this.validationStatusByField = {};
    this.validationRulesByField = {};
    this.subscribers = new Map();
    this.errorSubscribers = new Map();
    this.submitSubscribers = new Set();
    this.validationSubscribers = new Map();
    this.visibleFields = new Set();
  }

  installPlugin(key: symbol, plugin: FormApiPlugin): void {
    this._plugins.set(key, plugin);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getPlugin<P = any>(key: symbol): P | undefined {
    return this._plugins.get(key) as P | undefined;
  }

  setFieldVisible<F extends Field>(field: F, visible: boolean) {
    if (visible) {
      this.visibleFields.add(field);
    } else {
      this.visibleFields.delete(field);
    }
  }

  getState(): State {
    let state = { ...this.state } as Record<string, unknown>;
    for (const plugin of this._plugins.values()) {
      state = plugin.onGetState?.(state) ?? state;
    }
    return state as State;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private addSubscriber(map: Map<Field, any[]>, field: Field, cb: unknown) {
    const subs = map.get(field) || [];
    map.set(field, subs.concat(cb));
    return () => { map.set(field, map.get(field)?.filter(i => i !== cb) || []); };
  }

  onFieldChange<F extends Field>(field: F, cb: FieldOnChangeCb<State[F]>) {
    return this.addSubscriber(this.subscribers, field, cb);
  }

  private triggerFieldUpdate<F extends Field, V extends State[F]>(field: F, value: V) {
    this.subscribers.get(field)?.forEach(cb => cb(value));

    // reset errors
    if (this.fieldErrors[field]) {
      delete this.fieldErrors[field];
      this.errorSubscribers.get(field)?.forEach(cb => cb([], this.state));
    }
    // reset validation
    if (this.getFieldValidationStatus(field) !== 'notStarted') {
      this.validationStatusByField[field] = 'notStarted';
      this.validationSubscribers.get(field)?.forEach(cb => cb('notStarted'));
    }
    // notify plugins
    for (const plugin of this._plugins.values()) {
      plugin.onFieldUpdate?.(field, value);
    }
  }

  private triggerFieldError(field: Field, validationErrors: ValidationError<State[Field]>[]) {
    this.fieldErrors[field] = validationErrors;
    this.validationStatusByField[field] = 'error';
    this.errorSubscribers.get(field)?.forEach(cb => cb(validationErrors, this.state))
  }

  private triggerFieldValidation<F extends Field>(field: F, status: ValidationStatus, errors?: ValidationError<State[Field]>[]) {
    this.validationSubscribers.get(field)?.forEach(cb => cb(status, errors))
    if (errors) {
      this.triggerFieldError(field, errors);
    }
  }

  onFieldError<F extends Field>(field: F, cb: FieldOnErrorCb<State[F], State>) {
    return this.addSubscriber(this.errorSubscribers, field, cb);
  }

  onFieldValidationStatusChange<F extends Field>(field: F, cb: FieldOnValidationStatusChangeCb<State[F]>) {
    return this.addSubscriber(this.validationSubscribers, field, cb);
  }

  getFieldValidationStatus<F extends Field>(field: F) {
    return (this.validationStatusByField[field] || 'notStarted') as ValidationStatus
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

  setFieldRules<F extends Field>(field: F, validationRules: ValidationRule<State[F]>[]) {
    if (!validationRules) {
      return
    }
    this.validationRulesByField[field] = validationRules as ValidationRule<State[Field]>[];
  }

  addFieldRules<F extends Field>(field: F, validationRules: ValidationRule<State[F]>[]) {
    if (!validationRules) {
      return
    }
    const rules = this.validationRulesByField[field] || [];
    this.validationRulesByField[field] = rules.concat(validationRules as ValidationRule<State[Field]>[]);
  }

  async getFieldError<F extends Field>(field: F, trigger?: ValidateTrigger) {
    const rules = this.validationRulesByField[field];

    if (!rules) {
      return []
    }

    const preparedRules = prepareRules(rules, trigger);

    if (preparedRules.length === 0) {
      return []
    }

    this.triggerFieldValidation(field, 'validating');

    const validationErrors = await getValidationErrors(this.state[field], preparedRules, this.state);

    if (validationErrors.length > 0) {
      this.triggerFieldValidation(field, 'error', validationErrors as unknown as ValidationError<State[Field]>[]);
    } else {
      this.triggerFieldValidation(field, 'success');
    }

    // TODO: Fow to fix this type?
    return validationErrors as unknown as ValidationError<State[F]>[]
  }

  async getFieldsError(fields: Field[] = Object.keys(this.state) as Field[], trigger?: ValidateTrigger) {
    const errors = (await Promise.all(fields.map(field => this.getFieldError(field, trigger)))).flat()
    return errors
  }

  async validateField(field: Field, trigger?: ValidateTrigger) {
    const errors = await this.getFieldError(field, trigger);
    if (errors.length > 0) throw errors;
  }

  async validateFields(fieldNames?: Field[], trigger?: ValidateTrigger) {
    const fields = (fieldNames || [...this.visibleFields.values()]) as string[];
    const errors = await this.getFieldsError(fields as Field[], trigger);

    const pluginErrors: ValidationError[] = [];
    for (const plugin of this._plugins.values()) {
      const errs = await plugin.onValidateFields?.(fields, trigger) ?? [];
      pluginErrors.push(...errs);
    }

    if ([...errors, ...pluginErrors].length > 0) {
      throw [...errors, ...pluginErrors];
    }
  }

  onSubmit(cb: FieldOnSubmitCb<State>) {
    this.submitSubscribers.add(cb);

    return () => {
      this.submitSubscribers.delete(cb);
    }
  }

  setInitialState(state: State) {
    this.initialState = structuredClone(state);
    this.setFieldsValue(state);
  }

  async submit() {
    await this.validateFields();
    const state = this.getState();
    this.submitSubscribers.forEach(cb => cb(state))
    return state
  }
}
