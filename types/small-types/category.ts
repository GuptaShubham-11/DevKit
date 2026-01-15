import { CreateCategory, UpdateCategory } from '@/validation/category';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { Category } from '../shared/category';

export type CategoryFormType = CreateCategory | UpdateCategory;

// Category dialog props
export type CategoryDialogProps = {
  category?: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// Form Category props
export interface FormCategoryProps<T extends FieldValues = CategoryFormType> {
  form: UseFormReturn<T>;
}
