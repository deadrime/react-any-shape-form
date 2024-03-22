import React, { useCallback } from "react"
import { FormItem, FormItemProps } from "./FormItem"

type FormArrayAPI<T extends unknown[]> = {
  fields: T,
  append: (value: T[number]) => void,
  remove: (index: number) => void,
  update: (index: number, value: T[number]) => void,
  // prepend,
  // remove,
  // swap,
  // move,
  // insert
}

export type FormArrayItemProps<FieldName extends string = string, Value extends unknown[] = unknown[]> = Omit<FormItemProps<FieldName, Value>, 'children'> & {
  children: (props: FormArrayAPI<Value>) => React.ReactElement
}

const FormArrayChildren = <Value extends unknown[]>({ value: fieldValue, onChange, children }: FormArrayItemProps<string, Value>) => {
  const append = useCallback((value: Value[number]) => {
    onChange?.(fields => fields.concat(value) as Value)
  }, [onChange])

  const remove = useCallback((index: number) => {
    onChange?.(fields => fields.toSpliced(index, 1) as Value);
  }, [onChange])

  const update = useCallback((index: number, value: Value[number]) => {
    onChange?.(fields => fields.with(index, value) as Value);
  }, [onChange])

  return children({
    fields: fieldValue as Value,
    update,
    append,
    remove
  })
}

export const FormArrayItem = <FieldName extends string = string, Value extends unknown[] = unknown[]>({ children, ...props }: FormArrayItemProps<FieldName, Value>) => {
  return <FormItem {...props}>
    <FormArrayChildren {...props}>
      {children}
    </FormArrayChildren>
  </FormItem>
}
