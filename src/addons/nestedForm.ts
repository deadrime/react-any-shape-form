import { useEffect } from 'react';
import { FormApi } from "../FormApi";
import { FormAddon, FormApiPlugin, ValidationError, ValidateTrigger } from "../types";
import { AddonExtensionHKT, CompoundFormLike, GetFields, NestedForms, ResolvedNestedState } from "../typesHelpers";
import { NESTED_FORMS_PLUGIN_KEY } from "../pluginKeys";

export class ChildFormsPlugin implements FormApiPlugin {
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
}

type NestedExtension<State extends Record<string, unknown>> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useChildForm: <T extends GetFields<State>>(field: T, childForm: FormApi<any>) => void;
};

/** HKT that maps a form state type to the nested-forms compound-form extension. */
export interface NestedExtensionHKT extends AddonExtensionHKT {
  readonly type: NestedExtension<this['_State']>;
}

export type NestedFormsAddon<ExtraState extends Record<string, unknown>> = FormAddon<
  ExtraState,
  NestedExtensionHKT
>;

export function withNestedForms<N extends NestedForms>(
  forms: N,
): NestedFormsAddon<ResolvedNestedState<N>> {
  const addonState = Object.fromEntries(
    Object.entries(forms).map(([key, f]) => [key, f.formApi.getState()]),
  ) as ResolvedNestedState<N>;

  return {
    _addonType: "nested" as const,
    _addonState: addonState,
    _setup(formApi: FormApi<any>) {
      const plugin = new ChildFormsPlugin();
      for (const [key, compoundForm] of Object.entries(forms)) {
        plugin.addChildForm(key, (compoundForm as CompoundFormLike).formApi);
      }
      formApi.installPlugin(NESTED_FORMS_PLUGIN_KEY, plugin);
    },
    _extend(compoundForm: any, formApi: FormApi<any>) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      compoundForm.useChildForm = (field: string, childForm: FormApi<any>) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          return formApi.getPlugin<ChildFormsPlugin>(NESTED_FORMS_PLUGIN_KEY)?.addChildForm(field, childForm);
        }, [field, childForm]);
      };
    },
  };
}
