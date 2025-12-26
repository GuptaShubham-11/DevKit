import { useProceedProps } from '@/types/small-types/badge';
import { useMemo } from 'react';

export function useProceed({
  currentStep,
  isUploading,
  uploadedFile,
  watchedValues,
}: useProceedProps) {
  const canProceedToNextStep = useMemo(() => {
    switch (currentStep) {
      case 1:
        return (
          Boolean(watchedValues.name) &&
          Boolean(watchedValues.description) &&
          Boolean(uploadedFile) &&
          !isUploading
        );
      case 2:
        return (
          Boolean(watchedValues.category) &&
          Boolean(watchedValues.rarityLevel) &&
          Boolean(watchedValues.criteria?.type)
        );
      case 3:
        return true;
      default:
        return false;
    }
  }, [currentStep, watchedValues, uploadedFile, isUploading]);

  const isFormValid = useMemo(
    () =>
      Boolean(watchedValues.name) &&
      Boolean(watchedValues.description) &&
      Boolean(uploadedFile),
    [watchedValues.name, watchedValues.description, uploadedFile]
  );

  return {
    canProceedToNextStep,
    isFormValid,
  };
}
