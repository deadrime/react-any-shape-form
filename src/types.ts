export type FieldsUpdateCb<T> = (oldState: T) => T;

export type FieldError<Value> = ValidationError<Value>

export type FieldOnChangeCb<T> = (value: T) => void

export type FieldOnValidationStatusChangeCb<T> = (validationStatus: ValidationStatus, validationErrors?: ValidationError<T>[]) => void

export type FieldOnErrorCb<T, S> = (validationErrors: ValidationError<T>[], state: S) => void

export type FieldOnSubmitCb<S> = (state: S) => void

export type RuleType = 'string' | 'number' | 'regexp' | 'email' | 'array'

export type Validator<T = unknown, S = Record<string, unknown>> = (value: T, rule: ValidationRule<T>, formState: S) => Promise<string | void | Error>;

export type ValidateTrigger = 'onChange' | 'onSubmit'

export interface ItemSchemaResolver<T = unknown> {
  /** @internal */
  _validate: (value: T) => Promise<string[]>;
  validateTrigger?: ValidateTrigger[];
}

interface BaseRule {
  required?: boolean
  validateTrigger?: ValidateTrigger[]
  message?: string
  type?: RuleType
}

interface MinRule extends BaseRule {
  type: 'string' | 'number' | 'array'
  min: number
}

interface MaxRule extends BaseRule {
  type: 'string' | 'number' | 'array'
  max: number
}

interface PatternRule extends BaseRule {
  type: 'regexp'
  pattern: RegExp;
}

interface EmailRule extends BaseRule {
  type: 'email'
}

interface RequiredRule extends BaseRule {
  required: boolean;
}

interface CustomValidatorRule<T> extends BaseRule {
  validator: Validator<T>
}

export type ValidationRule<T = unknown> = 
RequiredRule |
MinRule |
MaxRule |
PatternRule |
EmailRule | 
CustomValidatorRule<T>;

export type ValidationStatus = 'notStarted' | 'validating' | 'success' | 'error'

export type ValidationError<Value = unknown> = {
  rule: ValidationRule<Value>,
  value: Value,
  errorText: string;
}

export type ArrayItemError<T = unknown> = {
  index: number;
  errors: ValidationError<T>[];
}

export type FieldUpdateCb<T> = (oldState: T) => Partial<T>;

export type FieldUpdate<T> = FieldUpdateCb<T> | T

// Moved from FormArrayItem.tsx — used by both FormArrayItem and the addon type system
export type ArrayItemProps<T> = {
  value: T;
  index: number;
  onChange: (value: T) => void;
  errors: ValidationError<T>[];
  validationStatus: ValidationStatus;
};

export type FormArrayAPI<T extends unknown[]> = {
  value: T;
  items: ArrayItemProps<T[number]>[];
  append: (value: T[number]) => Promise<void>;
  prepend: (value: T[number]) => Promise<void>;
  insert: (index: number, value: T[number]) => Promise<void>;
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
  update: (index: number, value: T[number] | FieldUpdateCb<T[number]>) => Promise<void>;
  itemErrors: ArrayItemError<T[number]>[];
  errors: ValidationError<T>[];
  validationStatus: ValidationStatus | undefined;
};

// Addon system — lifecycle hooks for extending FormApi behavior
export type FormApiAddon = {
  onFieldUpdate?(field: string, value: unknown): void;
  onGetState?(state: Record<string, unknown>): Record<string, unknown>;
  onValidateFields?(fields: string[], trigger?: ValidateTrigger): Promise<ValidationError[]>;
  onReset?(state: Record<string, unknown>): void;
  onFieldVisible?(field: string, visible: boolean): void;
  onSubmit?(state: Record<string, unknown>): void;
  onValidationError?(field: string, errors: ValidationError[]): void;
  onSetInitialState?(state: Record<string, unknown>): void;
};

// Interface for the array items addon (used by FormArrayItem without importing the concrete class)
export type IArrayAddon = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setArrayItemRules(field: string, rules: ValidationRule<any>[]): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onArrayItemError(field: string, cb: (errors: ArrayItemError<any>[]) => void): () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getArrayItemErrors(field: string): ArrayItemError<any>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validateArrayItems(field: string, trigger?: ValidateTrigger): Promise<ArrayItemError<any>[]>;
};

// Addon system — each addon carries _addonState for type inference and optional lifecycle hooks
// The phantom `_extensionHKT?` field carries a higher-kinded type so TypeScript can derive
// the state-parameterized compound-form extension via `ApplyAddonExtension<H, State>`.
export type FormAddon<
  ExtraState extends Record<string, unknown> = Record<never, never>,
  // The second generic is an HKT describing the compound-form extension.
  // Import AddonExtensionHKT from typesHelpers to declare state-aware extensions.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ExtHKT = any,
  // The third generic is an HKT describing additional required props for <Form>.
  // Used with AddonFormPropsHKT from typesHelpers to enforce props like `nestedForms`.
  FormPropsHKT = never,
> = {
  readonly _addonType: string;
  readonly _addonState: ExtraState;
  /** Phantom field — never set at runtime, used only for TypeScript inference. */
  readonly _extensionHKT?: ExtHKT;
  /** Phantom field — never set at runtime, used only for TypeScript inference. */
  readonly _formPropsHKT?: FormPropsHKT;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _setup?(formApi: any): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _extend?(compoundForm: any, formApi: any): void;
  /** Called once on mount inside <Form> when using the context-based createForm API. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _onContextMount?(formApi: any, props: Record<string, unknown>): (() => void) | void;
};
