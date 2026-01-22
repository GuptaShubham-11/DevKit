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

// Chart props
export type ChartProps = {
  data: any[];
  show: 'templates' | 'clicks';
};

// Category table row props
export type CategoryRowProps = {
  category: Category;
  index: number;
  expandedCategories: Record<string, boolean>;
  toggleChildren: (id: string) => void;
  onUpdate: (category: Category) => void;
  onDelete: (category: Category) => void;
};

// Toggle Button Props
export type ToggleButtonProps = {
  isExpanded: boolean;
  onToggle: () => void;
};

// Action menu props
export type ActionMenuProps = {
  category: Category;
  onUpdate: (category: Category) => void;
  onDelete: (category: Category) => void;
};

// Category Preview Prop
export type CategoryPreviewProps = {
  category: Category;
};

// Data cell props
export type DataCellProps = {
  value: string | number;
  muted?: boolean;
  className?: string;
};

// Child row props
export type ChildRowProps = {
  category: Category;
  childIndex: number;
  expandedCategories: Record<string, boolean>;
  toggleChildren: (id: string) => void;
  onUpdate: (category: Category) => void;
  onDelete: (category: Category) => void;
};
