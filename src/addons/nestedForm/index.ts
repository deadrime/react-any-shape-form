import { useEffect } from 'react';
import { FormApi } from "../../FormApi";
import { FormAddon, FormApiAddon, ValidationError, ValidateTrigger } from "../../types";
import { AddonExtensionHKT, AddonFormPropsHKT, CompoundFormLike, GetFields, NestedForms, ResolvedNestedState } from "../../typesHelpers";
import { NESTED_FORMS_ADDON_KEY } from "../addonKeys";
import { useFormInstance } from "../../FormContext";

export class ChildFormsAddon implements FormApiAddon {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private childForms = new Map<string, FormApi<any>>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addChildForm(field: string, childForm: FormApi<any>): () => void {
    this.childForms.set(field, childForm);
    return () => { this.childForms.delete(field); };
  }

  removeChildForm(field: string) {
    this.childForms.delete(field);
  }

  onGetState(state: Record<string, unknown>): Record<string, unknown> {
    if (this.childForms.size === 0) return state;
    const merged = { ...state };
    for (const [field, child] of this.childForms) {
      merged[field] = child.getState();
    }
    return merged;
  }

  async onValidateFields(_fields: string[], trigger?: ValidateTrigger): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];
    for (const [, child] of this.childForms) {
      try {
        await child.validateFields(undefined, trigger);
      } catch (errs) {
        errors.push(...(errs as ValidationError[]));
      }
    }
    return errors;
  }

  onReset(_state: Record<string, unknown>) {
    for (const [, child] of this.childForms) {
      child.resetFields();
    }
  }
}

type NestedExtension<State extends Record<string, unknown>> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useChildForm: <T extends GetFields<State>>(field: T, childForm: FormApi<any>) => void;
};

/** HKT that maps a form state type to the nested-forms compound-form extension. */
export interface NestedExtensionHKT extends AddonExtensionHKT {
  readonly type: NestedExtension<this['_State']>;
}

/** HKT that declares the `nestedForms` prop as required on <Form> when using context-based createForm. */
export interface NestedFormsFormPropsHKT extends AddonFormPropsHKT {
  readonly type: { nestedForms: NestedForms };
}

export type NestedFormsAddon<ExtraState extends Record<string, unknown>> = FormAddon<
  ExtraState,
  NestedExtensionHKT
>;

export type NestedFormsContextAddon = FormAddon<
  Record<never, never>,
  NestedExtensionHKT,
  NestedFormsFormPropsHKT
>;

/** Context-based overload — no forms argument; nestedForms passed as <Form> prop instead. */
export function withNestedForms(): NestedFormsContextAddon;
/** Global overload — forms provided at declaration time. */
export function withNestedForms<N extends NestedForms>(forms: N): NestedFormsAddon<ResolvedNestedState<N>>;
export function withNestedForms<N extends NestedForms>(
  forms?: N,
): NestedFormsAddon<ResolvedNestedState<N>> | NestedFormsContextAddon {
  if (forms === undefined) {
    // Context mode: no forms at declaration time; they are provided via `nestedForms` prop
    return {
      _addonType: "nested" as const,
      _addonState: {} as Record<never, never>,
      _setup(formApi: FormApi<any>) {
        formApi.installAddon(NESTED_FORMS_ADDON_KEY, new ChildFormsAddon());
      },
      _onContextMount(formApi: FormApi<any>, props: Record<string, unknown>) {
        const nestedForms = props['nestedForms'] as NestedForms | undefined;
        if (!nestedForms) return;
        const plugin = formApi.getAddon<ChildFormsAddon>(NESTED_FORMS_ADDON_KEY);
        if (!plugin) return;
        const cleanups = Object.entries(nestedForms).map(([key, childForm]) =>
          plugin.addChildForm(key, (childForm as CompoundFormLike).formApi),
        );
        return () => cleanups.forEach(fn => fn());
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      _extend(compoundForm: any, formApi: FormApi<any> | null) {
        if (formApi === null) {
          // Context mode
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          compoundForm.useChildForm = (field: string, childForm: FormApi<any>) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const form = useFormInstance();
            // eslint-disable-next-line react-hooks/rules-of-hooks
            useEffect(() => {
              return form.getAddon<ChildFormsAddon>(NESTED_FORMS_ADDON_KEY)?.addChildForm(field, childForm);
            }, [field, childForm]);
          };
        } else {
          // Global mode
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          compoundForm.useChildForm = (field: string, childForm: FormApi<any>) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            useEffect(() => {
              return formApi.getAddon<ChildFormsAddon>(NESTED_FORMS_ADDON_KEY)?.addChildForm(field, childForm);
            }, [field, childForm]);
          };
        }
      },
    };
  }

  // Global mode: forms known at declaration time
  const addonState = Object.fromEntries(
    Object.entries(forms).map(([key, f]) => [key, f.formApi.getState()]),
  ) as ResolvedNestedState<N>;

  return {
    _addonType: "nested" as const,
    _addonState: addonState,
    _setup(formApi: FormApi<any>) {
      const plugin = new ChildFormsAddon();
      for (const [key, compoundForm] of Object.entries(forms)) {
        plugin.addChildForm(key, (compoundForm as CompoundFormLike).formApi);
      }
      formApi.installAddon(NESTED_FORMS_ADDON_KEY, plugin);
    },
    _extend(compoundForm: any, formApi: FormApi<any>) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      compoundForm.useChildForm = (field: string, childForm: FormApi<any>) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          return formApi.getAddon<ChildFormsAddon>(NESTED_FORMS_ADDON_KEY)?.addChildForm(field, childForm);
        }, [field, childForm]);
      };
    },
  };
}
