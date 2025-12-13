import { useEffect } from 'react';
import { NotepadText, Pencil } from 'lucide-react';
import { FieldPath, FieldValues } from 'react-hook-form';
import { LabelInput } from '@/components/LabelInput';
import { UploadArea } from '@/components/UploadArea';

import {
  BasicFormFields,
  BasicInformationProps,
} from '@/types/small-types/badge';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

export const BasicInformation = <T extends FieldValues = BasicFormFields>({
  form,
  image,
  isUploading,
  imagePreview,
  uploadProgress,
  setImagePreview,
  handleFileUpload,
  handleFieldValidation,
}: BasicInformationProps<T>) => {
  useEffect(() => {
    if (image && !imagePreview) {
      setImagePreview(image);
    }
  }, [image, imagePreview, setImagePreview]);

  return (
    <>
      <div className="text-center">
        <h3 className="flex items-center justify-center gap-2 text-xl font-bold text-text-primary md:text-2xl">
          Basic Information
        </h3>
        <p className="text-sm text-text-muted">
          Define the basic details of this badge
        </p>
      </div>

      {/* Name */}
      <FormField
        control={form.control}
        name={'name' as FieldPath<T>}
        render={({ field, fieldState }) => (
          <FormItem>
            <LabelInput
              label="Name"
              placeholder="e.g., Template Master"
              iconLeft={Pencil}
              error={fieldState.error?.message}
              {...field}
              onChange={(e) => {
                field.onChange(e);
                handleFieldValidation(
                  'name' as FieldPath<T>,
                  e.target.value.trim().length > 0
                );
              }}
            />
          </FormItem>
        )}
      />

      {/* Description */}
      <FormField
        control={form.control}
        name={'description' as FieldPath<T>}
        render={({ field, fieldState }) => (
          <FormItem>
            <LabelInput
              label="Description"
              placeholder="Describe what this badge represents"
              iconLeft={NotepadText}
              error={fieldState.error?.message}
              {...field}
              onChange={(e) => {
                field.onChange(e);
                handleFieldValidation(
                  'description' as FieldPath<T>,
                  e.target.value.trim().length >= 10
                );
              }}
            />
          </FormItem>
        )}
      />

      {/* Badge Image */}
      <FormField
        control={form.control}
        name={'badgeImage' as FieldPath<T>}
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="ml-0.5 block text-[12px] font-semibold tracking-wider text-text-muted opacity-80">
              Image
            </FormLabel>
            <FormControl>
              <UploadArea
                isUploading={isUploading}
                imagePreview={imagePreview}
                uploadProgress={uploadProgress}
                setImagePreview={setImagePreview}
                onFileUpload={(res) => {
                  const url = (res as { url?: string } | null)?.url ?? '';
                  field.onChange(url);
                  handleFileUpload(res);
                  handleFieldValidation(
                    'badgeImage' as FieldPath<T>,
                    Boolean(url)
                  );
                }}
              />
            </FormControl>
            {fieldState.error && (
              <FormMessage className="text-sm font-medium text-accent-error" />
            )}
          </FormItem>
        )}
      />
    </>
  );
};
