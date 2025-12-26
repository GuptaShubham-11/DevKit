import { Reward } from './Reward';
import { Configuration } from './Configuration';
import { BasicInformation } from './BasicInformation';

import { useForm } from 'react-hook-form';
import { BadgeCheck } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { steps } from '@/lib/small-utils/badge';
import { Separator } from '@/components/ui/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { FooterBadgeDialog } from './FooterBadgeDialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useCallback, useEffect } from 'react';
import { StepIndicator } from '@/components/StepIndicator';

import { useProceed } from '@/hooks/badge/useProceed';
import { useSteps } from '@/hooks/step-indicator/useSteps';
import { useSpecialPrivileges } from '@/hooks/badge/useSpecialPrivileges';

import { useUpdateBadge, useUpdateLoading } from '@/store/badge';
import { UpdateBadgeData, updateBadgeSchema } from '@/validation/badge';

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

export default function UpdateBadgeDialog({
  open,
  badge,
  onOpenChange,
}: BadgeDialogProps) {
  const loading = useUpdateLoading();
  const updateBadge = useUpdateBadge();

  const [currentStep, setCurrentStep] = useState<StepNumber | number>(1);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [betweenValues, setBetweenValues] = useState<[number, number]>(
    INITIAL_BETWEEN_VALUES
  );
  const [isPrivilegesOpen, setIsPrivilegesOpen] = useState(false);

  const form = useForm<UpdateBadgeData>({
    resolver: zodResolver(updateBadgeSchema),
    defaultValues: {
      // filled in by useEffect when badge changes
    } as UpdateBadgeData,
    mode: 'onChange',
  });

  useEffect(() => {
    if (!badge) return;

    form.reset({
      name: badge.name,
      description: badge.description,
      badgeImage: badge.badgeImage,
      category: badge.category,
      rarityLevel: badge.rarityLevel,
      criteria: {
        type: badge?.criteria?.type,
        condition: badge.criteria?.condition,
        value: badge.criteria?.value,
        timeframe: badge.criteria?.timeframe,
      },
      pointsRequired: badge.pointsRequired,
      rewardData: {
        xpBonus: badge.rewardData?.xpBonus,
        profileBadge: badge.rewardData?.profileBadge,
        specialPrivileges: badge.rewardData?.specialPrivileges ?? [],
      },
      isActive: badge.isActive,
    });

    // If this badge uses a "between" condition and has an array value,
    // initialise the betweenValues state accordingly
    if (
      badge.criteria?.condition === 'between' &&
      Array.isArray(badge.criteria?.value) &&
      badge.criteria.value.length === 2
    ) {
      setBetweenValues([
        Number(badge.criteria.value[0]) || INITIAL_BETWEEN_VALUES[0],
        Number(badge.criteria.value[1]) || INITIAL_BETWEEN_VALUES[1],
      ]);
    }

    setImagePreview(badge.badgeImage ?? '');
  }, [badge, form]);

  const watchedValues = form.watch();
  const rarityLevel = watchedValues.rarityLevel || 'common';
  const criteriaCondition = watchedValues.criteria?.condition || 'gte';
  const specialPrivileges = watchedValues.rewardData?.specialPrivileges || [];

  const handleFileUpload = useCallback((fileData: UploadedFile | null) => {
    if (!fileData) {
      setUploadedFile(null);
      setImagePreview('');
      return;
    }

    setUploadedFile(fileData);
    setImagePreview(fileData.url);
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
  } = useSpecialPrivileges<UpdateBadgeData>({
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
    form.reset();
    setCurrentStep(2);
    setUploadedFile(null);
    setImagePreview('');
    setUploadProgress(0);
    setIsUploading(false);
    setBetweenValues(INITIAL_BETWEEN_VALUES);
    setIsPrivilegesOpen(false);
    onOpenChange(false);
  }, [form, onOpenChange]);

  const handleSubmit = useCallback(
    async (data: UpdateBadgeData) => {
      if (!badge) return;

      try {
        const payload: UpdateBadgeData = {
          ...data,
          criteria: {
            ...data.criteria,
            value:
              data.criteria?.condition === 'between'
                ? (betweenValues as number[])
                : data.criteria?.value,
          } as any,
          badgeImage: uploadedFile?.url || data.badgeImage,
        };

        await updateBadge(badge._id, payload);
        handleClose();
      } catch {
        // Error handling is done in the store action
      }
    },
    [badge, uploadedFile, betweenValues, updateBadge, handleClose]
  );

  // Validation logic
  const { isFormValid, canProceedToNextStep } = useProceed({
    currentStep,
    isUploading,
    uploadedFile: badge?.badgeImage ? { url: badge.badgeImage } : uploadedFile,
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
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="rounded bg-accent-primary/10 p-2">
                <BadgeCheck className="size-6 text-accent-primary" />
              </div>
              <div>
                <DialogTitle className="text-left leading-tight tracking-wide text-text-primary">
                  Update Badge
                </DialogTitle>
                <DialogDescription className="text-sm text-text-muted">
                  Update badge configuration
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
                    <BasicInformation
                      key="step-1-basic"
                      form={form}
                      imagePreview={imagePreview}
                      setImagePreview={setImagePreview}
                      handleFieldValidation={() => { }}
                      image={badge?.badgeImage}
                      handleFileUpload={handleFileUpload}
                      uploadProgress={uploadProgress}
                      isUploading={isUploading}
                    />
                  )}

                  {currentStep === 2 && (
                    <Configuration
                      key="step-2-config"
                      form={form as any}
                      betweenValues={betweenValues}
                      setBetweenValues={setBetweenValues}
                      criteriaCondition={criteriaCondition}
                    />
                  )}

                  {currentStep === 3 && (
                    <Reward<UpdateBadgeData>
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
