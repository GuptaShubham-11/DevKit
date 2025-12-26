import { useCallback } from 'react';
import { StepType } from '@/types/small-types/stepIndicator';

export function useSteps({
  TOTAL_STEPS,
  currentStep,
  setCurrentStep,
}: StepType) {
  const nextStep = useCallback(() => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleStepClick = useCallback((stepId: number) => {
    setCurrentStep(stepId);
  }, []);

  return {
    nextStep,
    prevStep,
    handleStepClick,
  };
}
