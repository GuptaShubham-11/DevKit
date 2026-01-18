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

//  Footer Category dialog props
export type FooterCategoryDialogProps = {
  loading: boolean;
  isFormValid: boolean;
  handleClose: (isOpen: boolean) => void;
};

// Color based on keyword
export type ColorBasedOnKeyword = {
  bg: string;
  color?: string;
  text: string;
};

export type ChartProps = {
  data: any[];
  show: 'templates' | 'clicks';
};
