import Form from "./Form";
import { FormItem, FormItemProps } from './FormItem'

export const createTypedForm = <State extends Record<string, unknown>>() => {
  return {
    Form: Form<State>,
    FormItem: FormItem as (<FieldName extends Extract<keyof State, string>, Value extends State[FieldName]>(props: FormItemProps<FieldName, Value>) => React.ReactElement)
  }
}
