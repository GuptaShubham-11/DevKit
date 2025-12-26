import { Dispatch, SetStateAction } from 'react';

// Step type
export type StepType = {
  TOTAL_STEPS: number;
  currentStep: number;
  setCurrentStep: Dispatch<SetStateAction<number>>;
};
