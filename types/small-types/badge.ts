import { CreateBadgeData, UpdateBadgeData } from '@/validation/badge';
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
