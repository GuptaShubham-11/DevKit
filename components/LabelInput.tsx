import React, { useState, FocusEvent } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, LucideIcon } from 'lucide-react';
import { Input } from './ui/input';

interface LabelInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  error?: string;
  iconLeft?: LucideIcon | React.ComponentType<{ className?: string }>;
  iconRight?: React.ReactNode;
  id?: string;
}

export const LabelInput: React.FC<LabelInputProps> = ({
  label,
  error,
  iconLeft: IconLeft,
  iconRight: IconRight,
  className,
  onFocus,
  onBlur,
  id,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const inputId = id ?? React.useId();

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const baseClasses =
    'w-full bg-surface-secondary/30 text-text-primary rounded-[2px] border outline-none ' +
    'py-3 transition-all duration-300 placeholder:text-text-muted/20 font-light text-sm tracking-wide';

  const paddingLeft = IconLeft ? 'pl-10' : 'pl-4';
  const paddingRight = IconRight ? 'pr-10' : 'pr-4';

  const borderClasses = error
    ? 'border-accent-error/50 focus:border-accent-error'
    : 'border-white/5';

  const focusClasses = isFocused
    ? 'shadow-[0_0_20px_rgba(99,102,241,0.1)] bg-surface-secondary/80'
    : 'hover:border-white/10 hover:bg-surface-secondary/50';

  return (
    <div className="group/input relative mb-5 font-sans">
      <label
        htmlFor={inputId}
        className="mb-1 ml-0.5 block text-[12px] font-semibold tracking-wider text-text-muted opacity-80"
      >
        {label}
      </label>

      <div className="relative">
        {IconLeft && (
          <div
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
              isFocused
                ? 'text-text-primary'
                : 'text-text-muted group-hover/input:text-text-secondary'
            }`}
          >
            <IconLeft className="size-4" />
          </div>
        )}

        <Input
          id={inputId}
          {...props}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={[
            baseClasses,
            paddingLeft,
            paddingRight,
            borderClasses,
            focusClasses,
            className,
          ]
            .filter(Boolean)
            .join(' ')}
        />

        {IconRight && (
          <div
            className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
              isFocused
                ? 'text-text-secondary'
                : 'text-text-muted group-hover/input:text-text-secondary'
            }`}
          >
            {IconRight}
          </div>
        )}

        {/* Corner Accents on Focus */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isFocused ? 1 : 0 }}
          className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-text-primary"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isFocused ? 1 : 0 }}
          className="pointer-events-none absolute top-0 right-0 h-2 w-2 border-r border-t border-text-primary"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: error ? 1 : 0, y: error ? 0 : -5 }}
        className="absolute right-0 -bottom-5"
      >
        {error && (
          <div className="flex items-center gap-1 text-xs font-medium text-accent-error">
            <AlertCircle className="size-3" />
            <span>{error}</span>
          </div>
        )}
      </motion.div>
    </div>
  );
};
