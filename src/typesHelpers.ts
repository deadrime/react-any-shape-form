import { FormApi } from "./FormApi";

export type FormApiGenericTypes<T> = T extends FormApi<infer S, infer F>
  ? { formApi: T, state: S, field: F } :  never

export type ArrayOnly<T> = T extends Array<any> ? T : never

export type ArrayOnlyObj<T extends Record<string, unknown>> = {
  [P in keyof T as T[P] extends Array<any> ? P : never]: T[P]
}

export type ArrayOnlyFields<
Obj extends Record<string, unknown>,
ArrayOnly extends ArrayOnlyObj<Obj> = ArrayOnlyObj<Obj>,
Field extends Extract<keyof ArrayOnly, string> = Extract<keyof ArrayOnly, string>
> = Field
