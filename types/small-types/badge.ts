import { CreateBadgeData, UpdateBadgeData } from '@/validation/badge';
import { Badge } from '../shared/badge';
import {
  Control,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from 'react-hook-form';

export type StepNumber = 1 | 2 | 3;

export type BadgeFormType = CreateBadgeData | UpdateBadgeData;

export interface UploadedFile {
  url: string;
  [key: string]: unknown;
}

// BadgeDialog Props
export interface BadgeDialogProps {
  badge?: Badge | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// BasicInformation Props
export type BasicFormFields = Pick<
  BadgeFormType,
  'name' | 'description' | 'badgeImage'
>;

export interface BasicInformationProps<
  T extends FieldValues = BasicFormFields,
> {
  form: {
    control: Control<T>;
  };
  image?: string;
  isUploading: boolean;
  imagePreview: string;
  uploadProgress: number;
  setImagePreview: (preview: string) => void;
  handleFileUpload: (file: UploadedFile | null) => void;
  handleFieldValidation: (fieldName: FieldPath<T>, isValid: boolean) => void;
}

// Configuration Props
export interface ConfigurationProps<T extends BadgeFormType> {
  criteriaCondition: string;
  betweenValues: [number, number];
  form: UseFormReturn<T>;
  setBetweenValues: (values: [number, number]) => void;
}

// Reward Props
export interface RewardProps<T extends BadgeFormType> {
  form: UseFormReturn<T>;
  rarityLevel: string;
  isPrivilegesOpen: boolean;
  specialPrivileges: string[];
  addSpecialPrivilege: () => void;
  setIsPrivilegesOpen: (value: boolean) => void;
  removeSpecialPrivilege: (index: number) => void;
  updateSpecialPrivilege: (index: number, value: string) => void;
}

// Select item props
export type SelectItem = {
  value: string;
  label: string;
  icon: React.ElementType;
}[];

// Keyword Colors
export type ColorBasedOnKeyword = { bg: string; color?: string; text: string };

// SpecialPrivileges Props
export interface UseSpecialPrivilegesProps<T extends BadgeFormType> {
  form: UseFormReturn<T>;
  specialPrivileges: string[];
  setIsPrivilegesOpen: (value: boolean) => void;
}

// Procced Props
export type useProceedProps = {
  currentStep: number;
  isUploading: boolean;
  uploadedFile: UploadedFile | null;
  watchedValues: BadgeFormType;
};

// Footer Props
export type FooterBadgeDialogProps = {
  loading: boolean;
  currentStep: number;
  TOTAL_STEPS: number;
  isFormValid: boolean;
  isUploading: boolean;
  canProceedToNextStep: boolean;
  prevStep: () => void;
  nextStep: () => void;
  handleSubmit: () => void;
  handleClose: () => void;
};

//  Stats Data Props
export type StatData = {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  description: string;
};

// Category Dot Props
export type CategoryDotProps = {
  category: string;
  count: number;
  percentage: number;
  x: number;
  y: number;
  color: string;
};

// Tooltip Props
export type TooltipProps = {
  active?: boolean;
  payload?: {
    [key: string]: any;
  };
};
