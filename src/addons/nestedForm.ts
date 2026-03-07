import { FormApi } from "@/FormApi";
import { FormAddon } from "../types";
import { CompoundFormLike, NestedForms, ResolvedNestedState } from "../typesHelpers";

export type NestedFormsAddon<ExtraState extends Record<string, unknown>> =
  FormAddon<ExtraState> & {
    readonly _addonType: "nested";
  };

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
      for (const [key, compoundForm] of Object.entries(forms)) {
        formApi.addChildForm(key, (compoundForm as CompoundFormLike).formApi);
      }
    },
  };
}
