import { useSyncExternalStore } from 'react';
import { FormApi } from '../../FormApi';
import { AddonExtensionHKT, GetFields } from '../../typesHelpers';
import { FormAddon, FormApiAddon, ValidationError, ValidateTrigger } from '../../types';
import { FORM_STATE_ADDON_KEY } from '../addonKeys';
import { useFormInstance } from '../../FormContext';

/**
 * Snapshot of the overall form state returned by `useFormState()`.
 *
 * - `isDirty` — at least one field differs from its initial value.
 * - `dirtyFields` — array of field keys whose current value differs from initial.
 * - `touchedFields` — fields that have been changed at least once since mount / last reset.
 *   A field stays touched even if the value is restored back to its initial value.
 * - `isSubmitting` — `true` while `formApi.submit()` is in progress.
 * - `isValid` — `false` while any field has an active validation error.
 */
export type FormStateSnapshot<State extends Record<string, unknown> = Record<string, unknown>> = {
  isDirty: boolean;
  dirtyFields: GetFields<State>[];
  touchedFields: GetFields<State>[];
  isSubmitting: boolean;
  isValid: boolean;
};

/**
 * Per-field state snapshot returned by `useFieldState(field)`.
 *
 * - `isTouched` — field has been changed at least once; stays `true` until reset.
 * - `isDirty` — current value differs from the initial value.
 * - `isValid` — `false` while the field has an active validation error.
 */
export type FieldStateSnapshot = {
  isTouched: boolean;
  isDirty: boolean;
  isValid: boolean;
};

export class FormStatePlugin implements FormApiAddon {
  private touchedFields = new Set<string>();
  private fieldErrorMap = new Map<string, ValidationError[]>();
  private isSubmitting = false;
  private capturedInitialState: Record<string, unknown>;
  private subscribers = new Set<() => void>();
  private version = 0;
  private snapshot: FormStateSnapshot | null = null;
  private snapshotVersion = -1;
  private fieldSnapshots = new Map<string, { version: number; snapshot: FieldStateSnapshot }>();

  constructor(private formApi: FormApi<Record<string, unknown>>) {
    this.capturedInitialState = { ...formApi.getFieldsValue() };

    const originalSubmit = formApi.submit.bind(formApi);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (formApi as any).submit = async () => {
      this.isSubmitting = true;
      this.notify();
      try {
        return await originalSubmit();
      } finally {
        this.isSubmitting = false;
        this.notify();
      }
    };
  }

  onFieldUpdate(field: string) {
    this.touchedFields.add(field);
    this.fieldErrorMap.delete(field);
    this.notify();
  }

  onValidationError(field: string, errors: ValidationError[]) {
    if (errors.length > 0) {
      this.fieldErrorMap.set(field, errors);
    } else {
      this.fieldErrorMap.delete(field);
    }
    this.notify();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onReset(_state: Record<string, unknown>) {
    this.touchedFields.clear();
    this.fieldErrorMap.clear();
    this.notify();
  }

  onSetInitialState(state: Record<string, unknown>) {
    this.capturedInitialState = { ...state };
    this.touchedFields.clear();
    this.fieldErrorMap.clear();
    this.notify();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onValidateFields(_fields: string[], _trigger?: ValidateTrigger): Promise<ValidationError[]> {
    return Promise.resolve([]);
  }

  subscribe(cb: () => void): () => void {
    this.subscribers.add(cb);
    return () => this.subscribers.delete(cb);
  }

  private notify() {
    this.version++;
    this.snapshot = null;
    this.subscribers.forEach(cb => cb());
  }

  getFieldSnapshot(field: string): FieldStateSnapshot {
    const cached = this.fieldSnapshots.get(field);
    if (cached && cached.version === this.version) return cached.snapshot;
    const current = this.formApi.getFieldsValue() as Record<string, unknown>;
    const next: FieldStateSnapshot = {
      isTouched: this.touchedFields.has(field),
      isDirty: current[field] !== this.capturedInitialState[field],
      isValid: !this.fieldErrorMap.has(field),
    };
    // Reuse same object reference when values are unchanged (prevents useSyncExternalStore re-renders)
    if (
      cached &&
      cached.snapshot.isTouched === next.isTouched &&
      cached.snapshot.isDirty === next.isDirty &&
      cached.snapshot.isValid === next.isValid
    ) {
      this.fieldSnapshots.set(field, { version: this.version, snapshot: cached.snapshot });
      return cached.snapshot;
    }
    this.fieldSnapshots.set(field, { version: this.version, snapshot: next });
    return next;
  }

  getSnapshot(): FormStateSnapshot {
    if (this.snapshotVersion === this.version && this.snapshot) return this.snapshot;
    const current = this.formApi.getFieldsValue() as Record<string, unknown>;
    const dirtyFields = Object.keys(this.capturedInitialState).filter(
      k => current[k] !== this.capturedInitialState[k],
    ) as string[];
    this.snapshot = {
      isDirty: dirtyFields.length > 0,
      dirtyFields,
      touchedFields: [...this.touchedFields],
      isSubmitting: this.isSubmitting,
      isValid: this.fieldErrorMap.size === 0,
    };
    this.snapshotVersion = this.version;
    return this.snapshot;
  }
}

/** The formState-specific properties added to the compound form when `withFormState()` is passed. */
export type FormStateCompoundFormExtension<State extends Record<string, unknown>> = {
  /**
   * Returns a reactive snapshot of the overall form state.
   * Re-renders whenever any field changes, validation runs, or a submit starts/ends.
   *
   * @example
   * ```tsx
   * const Form = createForm({ name: '', email: '' }, withFormState());
   *
   * function Footer() {
   *   const { isDirty, isSubmitting, isValid } = Form.useFormState();
   *   return (
   *     <button disabled={!isDirty || isSubmitting || !isValid}>
   *       {isSubmitting ? 'Saving…' : 'Save'}
   *     </button>
   *   );
   * }
   * ```
   */
  useFormState: () => FormStateSnapshot<State>;
  /**
   * Returns a reactive per-field state snapshot.
   * Only re-renders when the state of *that specific field* changes,
   * so it is more efficient than `useFormState` when you only need one field's metadata.
   *
   * @example
   * ```tsx
   * function NameField() {
   *   const { isTouched, isDirty, isValid } = Form.useFieldState('name');
   *   return (
   *     <div>
   *       <input ... />
   *       {isTouched && !isValid && <span>Please fix this field</span>}
   *       {isDirty && <span> (modified)</span>}
   *     </div>
   *   );
   * }
   * ```
   */
  useFieldState: (field: GetFields<State>) => FieldStateSnapshot;
};

/** HKT that maps a form state type to the formState compound-form extension. */
export interface FormStateExtensionHKT extends AddonExtensionHKT {
  readonly type: FormStateCompoundFormExtension<this['_State']>;
}

export type FormStateAddon = FormAddon<Record<never, never>, FormStateExtensionHKT>;

/**
 * Addon that adds form-level and field-level state metadata to a compound form.
 *
 * Pass to `createForm` or `useForm` to unlock two extra hooks:
 * - `Form.useFormState()` — overall form state (`isDirty`, `dirtyFields`, `touchedFields`, `isSubmitting`, `isValid`)
 * - `Form.useFieldState(field)` — per-field state (`isTouched`, `isDirty`, `isValid`)
 *
 * @example
 * ```tsx
 * const Form = createForm(
 *   { name: '', email: '' },
 *   withFormState(),
 * );
 *
 * function MyForm() {
 *   const { isDirty, isSubmitting } = Form.useFormState();
 *   const nameState = Form.useFieldState('name');
 *   // ...
 * }
 * ```
 */
export function withFormState(): FormStateAddon {
  return {
    _addonType: 'formState' as const,
    _addonState: {} as Record<never, never>,
    _setup(formApi: FormApi<Record<string, unknown>>) {
      formApi.installAddon(FORM_STATE_ADDON_KEY, new FormStatePlugin(formApi));
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _extend(compoundForm: any, formApi: FormApi<any> | null) {
      if (formApi === null) {
        // Context mode: read FormApi from context on each hook call
        compoundForm.useFormState = () => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const form = useFormInstance();
          const plugin = form.getAddon<FormStatePlugin>(FORM_STATE_ADDON_KEY)!;
          // eslint-disable-next-line react-hooks/rules-of-hooks
          return useSyncExternalStore(
            cb => plugin.subscribe(cb),
            () => plugin.getSnapshot(),
          );
        };
        compoundForm.useFieldState = (field: string) => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const form = useFormInstance();
          const plugin = form.getAddon<FormStatePlugin>(FORM_STATE_ADDON_KEY)!;
          // eslint-disable-next-line react-hooks/rules-of-hooks
          return useSyncExternalStore(
            cb => plugin.subscribe(cb),
            () => plugin.getFieldSnapshot(field),
          );
        };
      } else {
        // Global mode: close over the plugin resolved at setup time
        const plugin = formApi.getAddon<FormStatePlugin>(FORM_STATE_ADDON_KEY)!;
        compoundForm.useFormState = () =>
          // eslint-disable-next-line react-hooks/rules-of-hooks
          useSyncExternalStore(
            cb => plugin.subscribe(cb),
            () => plugin.getSnapshot(),
          );
        compoundForm.useFieldState = (field: string) =>
          // eslint-disable-next-line react-hooks/rules-of-hooks
          useSyncExternalStore(
            cb => plugin.subscribe(cb),
            () => plugin.getFieldSnapshot(field),
          );
      }
    },
  };
}
