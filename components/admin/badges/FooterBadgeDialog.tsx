import { FooterBadgeDialogProps } from '@/types/small-types/badge';
import CustomButton from '@/components/CustomButton';
import { ArrowRight } from 'lucide-react';

export function FooterBadgeDialog({
  currentStep,
  TOTAL_STEPS,
  canProceedToNextStep,
  isUploading,
  loading,
  isFormValid,
  prevStep,
  nextStep,
  handleSubmit,
  handleClose,
}: FooterBadgeDialogProps) {
  return (
    <div className="flex items-center justify-between gap-2 mt-4">
      <CustomButton
        type="button"
        variant="secondary"
        onClick={currentStep === 1 ? handleClose : prevStep}
        label={currentStep === 1 ? 'Cancel' : 'Back'}
        disabled={loading || isUploading}
        className="flex-1"
      />

      {currentStep < TOTAL_STEPS ? (
        <CustomButton
          type="button"
          variant="primary"
          onClick={nextStep}
          label="Next"
          icon={ArrowRight}
          disabled={!canProceedToNextStep || isUploading}
        />
      ) : (
        <CustomButton
          type="button"
          variant="primary"
          onClick={handleSubmit}
          label="Submit"
          disabled={loading || !isFormValid || isUploading}
          loading={loading}
          shimmer
        />
      )}
    </div>
  );
}
