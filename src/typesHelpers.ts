import { FormApi } from "./FormApi";

export type FormApiGenericTypes<T> = T extends FormApi<infer S, infer F>
  ? { formApi: T, state: S, field: F } :  never

export type ArrayOnly<T> = T extends Array<any> ? T : never
