import Form from './Form.tsx';
import { FormItem, FormItemProps } from './FormItem';
export * from './Form';
export * from './FormItem';
export * from './types.ts';

type InternalFormType = typeof Form;

type CompoundedFormComponent = InternalFormType & {
  Item: React.FC<FormItemProps>
}

const CompoundedForm = Form as unknown as CompoundedFormComponent;

CompoundedForm.Item = FormItem

export default CompoundedForm

export {
  CompoundedForm as Form
}
