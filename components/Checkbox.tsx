import React, { ReactNode, ChangeEvent } from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'type' | 'onChange'
  > {
  label: string | ReactNode;
  error?: string;
  checked?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  error,
  checked,
  onChange,
  id,
  ...props
}) => {
  const inputId = id ?? React.useId();

  return (
    <label
      htmlFor={inputId}
      className="group relative flex cursor-pointer select-none items-center gap-3"
    >
      <div className="mt-0.5 flex h-4 w-4 items-center justify-center relative">
        <input
          id={inputId}
          type="checkbox"
          className="peer h-4 w-4 cursor-pointer appearance-none rounded-[2px] border border-white/10 bg-surface-secondary/50 transition-all duration-200 hover:border-accent-primary/50 checked:border-accent-primary checked:bg-accent-primary outline-none focus:ring-1 focus:ring-accent-primary/20"
          checked={checked}
          onChange={onChange}
          {...props}
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 peer-checked:opacity-100">
          <Check className="h-3 w-3 stroke-[3] text-white" />
        </div>
      </div>

      <div className="flex-1">
        <span className="text-xs leading-relaxed text-text-secondary transition-colors duration-200 group-hover:text-text-primary">
          {label}
        </span>
        {error && <p className="mt-1 text-xs text-accent-error">{error}</p>}
      </div>
    </label>
  );
};
