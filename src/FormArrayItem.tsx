import React, { useCallback } from "react"
import { FormItem, FormItemProps } from "./FormItem"
import { FieldUpdate, FieldUpdateCb, ValidationRule } from "./types"
import { useField } from "./useForm"
import { FormApi } from "./FormApi"
import { ArrayOnlyFields, FormApiGenericTypes } from "./typesHelpers"
import { useFormInstance } from "./FormContext"
import { useInitField } from "./helpers/useFieldData"

type FormArrayAPI<T extends unknown[]> = {
  fields: T,
  append: (value: T[number]) => void,
  remove: (index: number) => void,
  update: (index: number, value: T[number] | FieldUpdateCb<T[number]>) => void,
  move: (from: number, to: number) => void,
  prepend: (value: T[number]) => void,
}

export const useArrayField = <
  Form extends FormApi<any>,
  Types extends FormApiGenericTypes<Form> = FormApiGenericTypes<Form>,
  State extends Types['state'] = Types['state'],
  Field extends ArrayOnlyFields<State> = ArrayOnlyFields<State>,
>(form: Form, field: Field, rules?: ValidationRule<State[Field]>[]) => {
  const [value, setValue] = useField(form, field);
  useInitField(form, field, rules);

  const append = useCallback((value: State[Field][number]) => {
    setValue?.(fields => fields.concat(value))
  }, [setValue])

  const prepend = useCallback((value: State[Field][number]) => {
    setValue?.(fields => [value].concat(fields))
  }, [setValue])

  const remove = useCallback((index: number) => {
    setValue?.(fields => fields.toSpliced(index, 1) as State[Field]);
  }, [setValue])

  const update = useCallback((index: number, value: State[Field][number] | FieldUpdateCb<State[Field][number]>) => {
    setValue?.(fields => fields.with(index, typeof value === 'function' ? (value as FieldUpdateCb<State[Field][number]>)(fields[index]) : value) as State[Field]);
  }, [setValue])

  const move = useCallback((from: number, to: number) => {
    setValue?.(fields => {
      fields.splice(to, 0, fields.splice(from, 1)[0]);
      return fields
    });
  }, [setValue])

  return {
    fields: value,
    append,
    prepend,
    remove,
    move,
    update
  }
}

export type FormArrayItemProps<FieldName extends string = string, Value extends unknown[] = unknown[]> = Omit<FormItemProps<FieldName, Value>, 'children' | 'onChange'> & {
  children: (props: FormArrayAPI<Value>) => React.ReactElement
  value?: Value
  onChange?: (value: FieldUpdate<Value>, event?: unknown) => unknown
}

export const FormArrayItem = <FieldName extends string = string, Value extends unknown[] = unknown[]>({ children, ...props }: FormArrayItemProps<FieldName, Value>) => {
  const form = useFormInstance();
  const formArray = useArrayField(form, props.name);

  return <FormItem {...props}>
    {() => children(formArray)}
  </FormItem>
}
