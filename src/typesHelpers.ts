import { FormApi } from "./FormApi";

export type FormApiGenericTypes<T> = T extends FormApi<infer S, infer F>
  ? { formApi: T, state: S, field: F } :  never

export type ArrayOnly<T> = T extends Array<any> ? T : never

export type ArrayOnlyObj<T extends Record<string, unknown>> = {
  [P in keyof T as T[P] extends Array<any> ? P : never]: T[P]
}

export type GetFields<T extends Record<string, unknown>> = Extract<keyof T, string>

export type PickBy<Obj extends Record<string, unknown>, Predicate> = {
  [Property in keyof Obj as Obj[Property] extends Predicate ? Property : never]: Obj[Property]
}

export type ArrayOnlyFields<
Obj extends Record<string, unknown>,
> = GetFields<PickBy<Obj, unknown[]>>
