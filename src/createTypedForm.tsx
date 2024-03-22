import { FormArrayItem, FormArrayItemProps } from "./FormArrayItem";
import Form from "./Form";
import { FormItem, FormItemProps } from './FormItem'

export const createTypedForm = <State extends Record<string, unknown>>() => {
  return {
    Form: Form<State>,
    FormItem: FormItem as (<FieldName extends Extract<keyof State, string>, Value extends State[FieldName]>(props: FormItemProps<FieldName, Value>) => React.ReactElement),
    FormArrayItem: FormArrayItem as (
      <FieldName extends Extract<keyof State, string>, Value extends State[FieldName]>
        (props: FormArrayItemProps<FieldName, Value extends unknown[] ? Value : never>) => ReturnType<typeof FormArrayItem<FieldName extends unknown[] ? FieldName[number] : never, Value extends unknown[] ? Value : never>>),
  }
}
