import { FormApi } from "./FormApi";
import { FormAddon } from "./types";

// ---------------------------------------------------------------------------
// HKT (Higher-Kinded Type) simulation
// Allows addons to declare state-parameterized extension types.
// ---------------------------------------------------------------------------

/** Base interface for addon extension HKTs. Override `type` using `this['_State']` to access the form state. */
export interface AddonExtensionHKT {
  readonly _State: Record<string, unknown>;
  readonly type: Record<string, unknown>;
}

/** Apply an HKT to a concrete state type, producing the extension object type. */
export type ApplyAddonExtension<F extends AddonExtensionHKT, State> =
  (F & { readonly _State: State })['type'];

export type FormApiGenericTypes<T> =
  T extends FormApi<infer S, infer F>
    ? { formApi: T; state: S; field: F }
    : never;

export type ArrayOnly<T> = T extends unknown[] ? T : never;

export type ArrayOnlyObj<T extends Record<string, unknown>> = {
  [P in keyof T as T[P] extends unknown[] ? P : never]: T[P];
};

export type GetFields<T extends Record<string, unknown>> = Extract<
  keyof T,
  string
>;

export type PickBy<Obj extends Record<string, unknown>, Predicate> = {
  [Property in keyof Obj as Obj[Property] extends Predicate
    ? Property
    : never]: Obj[Property];
};

export type ArrayOnlyFields<Obj extends Record<string, unknown>> = GetFields<
  PickBy<Obj, unknown[]>
>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CompoundFormLike = { formApi: FormApi<any> };

export type ExtractFormState<T> = T extends { formApi: FormApi<infer S> }
  ? S
  : never;

type HasFormApi<T> = T extends { formApi: infer F }
  ? F extends FormApi<infer S>
    ? S
    : never
  : never;

export type ResolveState<T extends Record<string, unknown>> = Prettify<{
  [K in keyof T]: HasFormApi<T[K]> extends never ? T[K] : HasFormApi<T[K]>;
}>;

export type NestedForms = Record<string, CompoundFormLike>;

export type ResolvedNestedState<N extends NestedForms> = {
  [K in keyof N]: ExtractFormState<N[K]>;
};

export type ArrayElementType<T> = T extends Array<infer U> ? U : never;

export type Prettify<T> = {
  [K in keyof T]: T[K];
  // eslint-disable-next-line @typescript-eslint/ban-types
} & {};

// Addon type utilities

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExtractAddonState<A> = A extends FormAddon<infer E, any> ? E : Record<never, never>;

/** Merges the ExtraState of all addons in the tuple into a single object type. */
export type MergeAddonStates<Addons extends readonly unknown[]> =
  Addons extends readonly [infer Head, ...infer Tail]
    ? ExtractAddonState<Head> & MergeAddonStates<Tail>
    : Record<never, never>;

type ExtractAddonExtension<Addon, State extends Record<string, unknown>> =
  Addon extends { readonly _extensionHKT?: infer H }
    ? H extends AddonExtensionHKT
      ? ApplyAddonExtension<H, State>
      : Record<never, never>
    : Record<never, never>;

/** Merges the compound-form extension contributed by each addon in the tuple. */
export type MergeAddonExtensions<
  State extends Record<string, unknown>,
  Addons extends readonly unknown[]
> =
  Addons extends readonly [infer Head, ...infer Tail extends readonly unknown[]]
    ? ExtractAddonExtension<Head, State> & MergeAddonExtensions<State, Tail>
    : Record<never, never>;
