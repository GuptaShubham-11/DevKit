import { motion } from 'framer-motion';
import { ChevronRight, SquareCheckBig } from 'lucide-react';
import Icon from './Icon';

type StepStatus = 'completed' | 'current' | 'pending' | 'error' | 'optional';
type StepVariant = 'linear' | 'compact' | 'breadcrumb';

export interface Step {
  id: number;
  icon?: string;
  title: string;
  description?: string;
  status?: StepStatus;
}

interface StepIndicatorProps {
  steps: Step[];
  totalSteps: number;
  currentStep: number;
  showDescriptions?: boolean;
  allowClickNavigation?: boolean;
  onStepClick?: (stepId: number) => void;
  variant?: StepVariant;
}

const STEP_ICON_SIZE = 'size-4';
const CHEVRON_SIZE = 'size-4';

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  totalSteps,
  currentStep,
  onStepClick,
  variant = 'linear',
  showDescriptions = true,
  allowClickNavigation = false,
}) => {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
  const currentStepData = steps[currentStep - 1];

  const stepStatus = (stepId: number, currentStep: number): StepStatus => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'pending';
  };

  const statusStyles = (
    status: StepStatus
  ): { bg: string; border: string; text: string; icon?: string } => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-accent-success',
          border: 'border-accent-success',
          text: 'text-text-primary',
          icon: 'Check',
        };
      case 'current':
        return {
          bg: 'bg-border-color',
          border: 'border-accent-success',
          text: 'text-text-primary',
        };
      case 'pending':
        return {
          bg: 'bg-border-color',
          border: 'border-border-color',
          text: 'text-text-secondary',
        };
      case 'error':
        return {
          bg: 'bg-error',
          border: 'border-error',
          text: 'text-error',
          icon: 'AlertCircle',
        };
      case 'optional':
        return {
          bg: 'bg-border-color',
          border: 'border-border-color',
          text: 'text-text-primary',
        };
      default:
        return {
          bg: 'bg-border-color',
          border: 'border-border-color',
          text: 'text-text-primary',
        };
    }
  };
  const Stepper = () => (
    <div className="hidden w-full flex-col sm:flex">
      <div className="mb-4 flex items-center justify-between">
        {steps.map((step, index) => {
          const status = stepStatus(step.id, currentStep);
          const style = statusStyles(status);
          const isClickable = allowClickNavigation && status !== 'pending';
          const isLast = index === steps.length - 1;

          return (
            <div
              key={step.id}
              className="relative flex w-full flex-col items-center"
            >
              {/* Step Button */}
              <motion.button
                onClick={() => isClickable && onStepClick?.(step.id)}
                disabled={!isClickable}
                type="button"
                aria-label={`Step ${step.id}: ${step.title}`}
                aria-current={status === 'current' ? 'step' : undefined}
                className={`
                  size-8 rounded-full border-2 flex items-center justify-center
                  text-sm md:text-base transition-all
                  ${style.bg} ${style.border} ${style.text}
                  ${isClickable ? 'cursor-pointer' : 'cursor-default'}
                `}
              >
                {status === 'completed' && style.icon && (
                  <motion.div
                    initial={false}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 180 }}
                  >
                    <Icon name={style.icon} className={STEP_ICON_SIZE} />
                  </motion.div>
                )}

                {status === 'error' && style.icon && (
                  <motion.div
                    animate={{ rotate: [0, -5, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Icon name={style.icon} className={STEP_ICON_SIZE} />
                  </motion.div>
                )}

                {status !== 'completed' && status !== 'error' && (
                  <span className="font-semibold">{step.id}</span>
                )}
              </motion.button>

              {/* Connector Line */}
              {!isLast && (
                <div className="absolute top-1/4 left-[calc(50%+20px)] w-[calc(100%-40px)] h-1 bg-surface-secondary rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      currentStep > step.id
                        ? 'bg-accent-success'
                        : 'bg-surface-secondary'
                    }`}
                    initial={false}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}

              {/* Step Label */}
              <div className="mt-3 max-w-32 text-center">
                <div
                  className={`text-sm font-semibold ${
                    currentStep === step.id
                      ? 'text-text-primary'
                      : 'text-text-muted'
                  }`}
                >
                  {step.title}
                </div>
                {showDescriptions && step.description && (
                  <div className="hidden text-xs text-text-muted lg:block">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  //  Mobile progress bar with step counter
  const MobileCompact = () => (
    <div className="w-full space-y-2 sm:hidden">
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-secondary">
          Step {currentStep} of {totalSteps}
        </span>
        {currentStepData && (
          <span className="text-xs text-text-primary font-medium">
            {currentStepData.title}
          </span>
        )}
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-border-color/40">
        <motion.div
          className="h-full bg-accent-success rounded-full"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>
    </div>
  );

  //  Breadcrumb style navigation
  const Breadcrumb = () => (
    <nav
      className="flex flex-wrap items-center gap-2 mb-4"
      aria-label="Step navigation"
    >
      {steps.map((step, index) => {
        const status = stepStatus(step.id, currentStep);
        const isClickable = allowClickNavigation && status !== 'pending';
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="flex items-center gap-1">
            <motion.button
              onClick={() => isClickable && onStepClick?.(step.id)}
              disabled={!isClickable}
              type="button"
              aria-current={status === 'current' ? 'step' : undefined}
              className={`
                flex items-center gap-1 rounded px-2 py-1 text-sm
                transition-colors duration-200
                ${
                  status === 'current'
                    ? 'bg-hover-overlay text-text-muted'
                    : status === 'completed'
                      ? 'text-accent-success'
                      : 'text-text-muted'
                }
                ${isClickable ? 'hover:bg-accent-success/10 cursor-pointer' : ''}
              `}
            >
              {status === 'completed' && (
                <SquareCheckBig className={CHEVRON_SIZE} />
              )}
              <span>{step.title}</span>
            </motion.button>

            {!isLast && (
              <ChevronRight className={`${CHEVRON_SIZE} text-text-muted`} />
            )}
          </div>
        );
      })}
    </nav>
  );

  if (variant === 'breadcrumb') return <Breadcrumb />;
  if (variant === 'compact') return <MobileCompact />;

  return (
    <div className="w-full px-4">
      <Stepper />
      <MobileCompact />
    </div>
  );
};
