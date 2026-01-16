import { FooterCategoryDialogProps } from '@/types/small-types/category';
import CustomButton from '@/components/CustomButton';

export function FooterCategoryDialog({
  loading,
  isFormValid,
  handleClose,
}: FooterCategoryDialogProps) {
  return (
    <div className="flex items-center justify-between gap-2 mt-4">
      <CustomButton
        type="button"
        variant="secondary"
        onClick={() => handleClose(false)}
        label={'Cancel'}
        disabled={loading}
        className="flex-1"
      />

      <CustomButton
        type="submit"
        variant="primary"
        label="Submit"
        disabled={loading || !isFormValid}
        loading={loading}
        shimmer
      />
    </div>
  );
}
