import { Reward } from './Reward';
import { Configuration } from './Configuration';
import { BasicInformation } from './BasicInformation';

import { BadgeCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { useState, useCallback } from 'react';
import { steps } from '@/lib/small-utils/badge';
import { Separator } from '@/components/ui/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { FooterBadgeDialog } from './FooterBadgeDialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StepIndicator } from '@/components/StepIndicator';

import { useProceed } from '@/hooks/badge/useProceed';
import { useSteps } from '@/hooks/step-indicator/useSteps';
import { useSpecialPrivileges } from '@/hooks/badge/useSpecialPrivileges';

import { useCreateBadge, useCreateLoading } from '@/store/badge';

import { CreateBadgeData, createBadgeSchema } from '@/validation/badge';

import {
  BadgeDialogProps,
  StepNumber,
  UploadedFile,
} from '@/types/small-types/badge';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const INITIAL_BETWEEN_VALUES: [number, number] = [1, 10];
const TOTAL_STEPS = 3;

export default function CreateBadgeDialog({
  open,
  onOpenChange,
}: BadgeDialogProps) {
  const loading = useCreateLoading();
  const createBadge = useCreateBadge();

  const [currentStep, setCurrentStep] = useState<StepNumber | number>(2);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [betweenValues, setBetweenValues] = useState<[number, number]>(
    INITIAL_BETWEEN_VALUES
  );
  const [isPrivilegesOpen, setIsPrivilegesOpen] = useState<boolean>(false);

  const form = useForm<CreateBadgeData>({
    resolver: zodResolver(createBadgeSchema),
    defaultValues: {
      name: '',
      description: '',
      badgeImage: '',
      category: 'creator',
      rarityLevel: 'common',
      criteria: {
        type: 'templatesCreated',
        condition: 'gte',
        value: 1,
        timeframe: 'allTime',
      },
      pointsRequired: 50,
      rewardData: {
        xpBonus: 25,
        profileBadge: false,
        specialPrivileges: [],
      },
      isActive: true,
    },
    mode: 'onChange',
  });

  const watchedValues = form.watch();
  const rarityLevel = watchedValues.rarityLevel || 'common';
  const criteriaCondition = watchedValues.criteria?.condition || 'gte';
  const specialPrivileges = watchedValues.rewardData?.specialPrivileges || [];

  // Callbacks
  const handleFileUpload = useCallback((fileData: UploadedFile | null) => {
    if (!fileData) {
      setUploadedFile(null);
      return;
    }

    setUploadedFile(fileData);
    setIsUploading(true);

    let progress = 0;
    const interval = window.setInterval(() => {
      progress += 10;
      setUploadProgress(progress);

      if (progress >= 100) {
        window.clearInterval(interval);
        setIsUploading(false);
        setUploadProgress(0);
      }
    }, 100);

    return () => window.clearInterval(interval);
  }, []);

  const {
    addSpecialPrivilege,
    removeSpecialPrivilege,
    updateSpecialPrivilege,
  } = useSpecialPrivileges<CreateBadgeData>({
    form,
    specialPrivileges,
    setIsPrivilegesOpen,
  });

  const { nextStep, prevStep, handleStepClick } = useSteps({
    TOTAL_STEPS,
    currentStep,
    setCurrentStep,
  });

  const handleClose = useCallback(() => {
    // Reset all state
    form.reset();
    setCurrentStep(1);
    setUploadedFile(null);
    setImagePreview('');
    setUploadProgress(0);
    setIsUploading(false);
    setBetweenValues(INITIAL_BETWEEN_VALUES);
    setIsPrivilegesOpen(false);
    onOpenChange(false);
  }, [form, onOpenChange]);

  const handleSubmit = useCallback(
    async (data: CreateBadgeData) => {
      try {
        const payload = {
          ...data,
          criteria: {
            ...data.criteria,
            value:
              data.criteria.condition === 'between'
                ? (betweenValues as any)
                : data.criteria.value,
          },
          badgeImage: uploadedFile?.url || data.badgeImage,
        };

        await createBadge(payload);
        handleClose();
      } catch {
        // Error handling is done in the store action
      }
    },
    [uploadedFile, betweenValues, createBadge, handleClose]
  );

  // Validation logic
  const { isFormValid, canProceedToNextStep } = useProceed({
    currentStep,
    isUploading,
    uploadedFile,
    watchedValues,
  });

  const isBackdropVisible = open;

  return (
    <>
      {isBackdropVisible && (
        <div
          onClick={handleClose}
          className="fixed inset-0 z-50 bg-white/5 backdrop-blur-sm"
          aria-hidden="true"
        />
      )}

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-h-[90vh] max-w-2xl rounded-[4px] border-border-color bg-surface-primary p-2 font-sans">
          <DialogHeader>
            <div className="flex items-center gap-2 px-4 py-2">
              <div className="rounded bg-accent-primary/10 p-2">
                <BadgeCheck className="size-6 text-accent-primary" />
              </div>
              <div>
                <DialogTitle className="text-left leading-tight tracking-wide text-text-primary">
                  Add Badge
                </DialogTitle>
                <DialogDescription className="text-sm text-text-muted">
                  Create badges for users
                </DialogDescription>
              </div>
            </div>
            <Separator className="bg-border-color" />
          </DialogHeader>

          <ScrollArea className="max-h-[70vh]">
            <StepIndicator
              steps={steps}
              totalSteps={TOTAL_STEPS}
              showDescriptions
              variant="linear"
              currentStep={currentStep}
              allowClickNavigation
              onStepClick={handleStepClick}
            />

            <Form {...form}>
              <motion.form
                key={currentStep}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-1 p-4 pt-2"
              >
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <BasicInformation<CreateBadgeData>
                      key="step-1-basic"
                      form={form}
                      imagePreview={imagePreview}
                      setImagePreview={setImagePreview}
                      handleFieldValidation={() => {
                        // No longer needed with form validation
                      }}
                      handleFileUpload={handleFileUpload}
                      uploadProgress={uploadProgress}
                      isUploading={isUploading}
                    />
                  )}

                  {currentStep === 2 && (
                    <Configuration<CreateBadgeData>
                      key="step-2-config"
                      form={form}
                      betweenValues={betweenValues}
                      setBetweenValues={setBetweenValues}
                      criteriaCondition={criteriaCondition}
                    />
                  )}

                  {currentStep === 3 && (
                    <Reward<CreateBadgeData>
                      key="step-3-reward"
                      form={form}
                      rarityLevel={rarityLevel}
                      isPrivilegesOpen={isPrivilegesOpen}
                      specialPrivileges={specialPrivileges}
                      addSpecialPrivilege={addSpecialPrivilege}
                      setIsPrivilegesOpen={setIsPrivilegesOpen}
                      removeSpecialPrivilege={removeSpecialPrivilege}
                      updateSpecialPrivilege={updateSpecialPrivilege}
                    />
                  )}
                </AnimatePresence>

                <FooterBadgeDialog
                  currentStep={currentStep}
                  TOTAL_STEPS={TOTAL_STEPS}
                  canProceedToNextStep={canProceedToNextStep}
                  isUploading={isUploading}
                  loading={loading}
                  isFormValid={isFormValid}
                  prevStep={prevStep}
                  nextStep={nextStep}
                  handleSubmit={form.handleSubmit(handleSubmit)}
                  handleClose={handleClose}
                />
              </motion.form>
            </Form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
