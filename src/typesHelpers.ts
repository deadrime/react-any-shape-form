import { FormApi } from "./FormApi";
import { FormAddon } from "./types";

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

type ExtractAddonState<A> = A extends FormAddon<infer E> ? E : Record<never, never>;

/** Merges the ExtraState of all addons in the tuple into a single object type. */
export type MergeAddonStates<Addons extends readonly unknown[]> =
  Addons extends readonly [infer Head, ...infer Tail]
    ? ExtractAddonState<Head> & MergeAddonStates<Tail>
    : Record<never, never>;

/** Returns `true` if any addon in the tuple has `_addonType === 'array'`. */
export type HasArrayAddon<Addons extends readonly unknown[]> =
  Addons extends readonly [infer Head, ...infer Tail]
    ? Head extends { readonly _addonType: 'array' }
      ? true
      : HasArrayAddon<Tail>
    : false;

/** Returns `true` if any addon in the tuple has `_addonType === 'nested'`. */
export type HasNestedAddon<Addons extends readonly unknown[]> =
  Addons extends readonly [infer Head, ...infer Tail]
    ? Head extends { readonly _addonType: 'nested' }
      ? true
      : HasNestedAddon<Tail>
    : false;
