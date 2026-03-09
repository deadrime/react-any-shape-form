import { FormApi } from '../FormApi';
import { AddonExtensionHKT } from '../typesHelpers';
import { FormAddon } from '../types';

/** A no-op HKT that contributes no extension to the compound form. */
interface NoExtensionHKT extends AddonExtensionHKT {
  readonly type: Record<never, never>;
}

/**
 * Helper for creating state-independent custom addons with full TypeScript support.
 *
 * For state-aware addons (where the extension type depends on form state), implement
 * `AddonExtensionHKT` and use `FormAddon` directly:
 *
 * ```ts
 * import { AddonExtensionHKT, FormAddon } from 'react-any-shape-form';
 *
 * interface MyExtHKT extends AddonExtensionHKT {
 *   readonly type: { useFirst: () => this['_State'][keyof this['_State']] };
 * }
 * const withCustomHook = (): FormAddon<{}, MyExtHKT> => ({ ... });
 * ```
 */
export function defineAddon<
  ExtraState extends Record<string, unknown> = Record<never, never>,
  Extension extends Record<string, unknown> = Record<never, never>
>(config: {
  type?: string;
  initialState?: ExtraState;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setup?: (formApi: FormApi<any>) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extend?: (compoundForm: any, formApi: FormApi<any>) => void;
}): FormAddon<ExtraState, Extension extends Record<never, never> ? NoExtensionHKT : FixedExtensionHKT<Extension>> {
  return {
    _addonType: config.type ?? 'custom',
    _addonState: (config.initialState ?? {}) as ExtraState,
    _setup: config.setup,
    _extend: config.extend,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as FormAddon<ExtraState, any>;
}

/** HKT that maps any state to a fixed extension type (state-independent addon). */
interface FixedExtensionHKT<Ext extends Record<string, unknown>> extends AddonExtensionHKT {
  readonly type: Ext;
}
