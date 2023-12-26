import Form from "./Form";
import { FormItem } from './FormItem'

export const createTypedForm = <State extends Record<string, unknown> = Record<string, unknown>, FieldName extends Extract<keyof State, string> =  Extract<keyof State, string>, Value = State[FieldName]>() => {
  const TypedFormItem = FormItem<FieldName, Value>;
  const TypedForm = Form<State> as (typeof Form<State> & {
    Item: typeof TypedFormItem,
  });
  TypedForm.Item = TypedFormItem;

  return {
    Form: TypedForm,
    FormItem: TypedFormItem,
  }
}
