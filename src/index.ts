import Form from './Form.tsx';
import { FormItem, FormItemProps } from './FormItem.tsx';
export * from './Form.tsx';
export * from './FormItem.tsx';
export * from './types.ts';
export * from './FormArrayItem.tsx';
export * from './useForm.tsx';

export { useFormContext, useFormInstance, createFormContext } from './FormContext.ts';

type InternalFormType = typeof Form;

type CompoundedFormComponent = InternalFormType & {
  Item: React.FC<FormItemProps>
}

const CompoundedForm = Form as CompoundedFormComponent;

CompoundedForm.Item = FormItem

export default CompoundedForm

export {
  CompoundedForm as Form
}
