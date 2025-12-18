import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { FieldError } from 'react-hook-form';
import type { SelectItem as DropdownOption } from '@/types/small-types/badge';

import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CustomDropdownProps {
  field: {
    name: string;
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
  };
  error?: FieldError;
  options: DropdownOption;
  label?: string;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  getIconColor?: (value: string) => {
    bg?: string;
    text?: string;
    color?: string;
  };
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  field,
  error,
  options,
  label = 'Select an option',
  placeholder = 'Select an option',
  className = '',
  triggerClassName = '',
  contentClassName = '',
  getIconColor,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const iconColor = (value: string): string =>
    getIconColor?.(value)?.text ?? '';

  return (
    <FormItem className={`w-full ${className}`}>
      {label && (
        <FormLabel className="ml-0.5 block select-none text-[12px] font-semibold tracking-wider text-text-muted opacity-80">
          {label}
        </FormLabel>
      )}

      <Select
        onValueChange={field.onChange}
        value={field.value ?? ''}
        onOpenChange={setIsOpen}
      >
        <FormControl>
          <motion.div whileTap={{ scale: 0.97 }} className="shadow-sm">
            <SelectTrigger
              className={`
                relative flex w-full items-center justify-between gap-2 rounded
                border border-border-color bg-surface-secondary/30
                py-4 px-4 text-text-primary transition-colors duration-300
                hover:border-white/10 hover:bg-surface-secondary/50
                focus:shadow-[0_0_20px_rgba(99,102,241,0.1)]
                ${triggerClassName}
              `}
            >
              {/* Corner accents */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isOpen ? 1 : 0 }}
                className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-text-primary"
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isOpen ? 1 : 0 }}
                className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-text-primary"
              />

              <span className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                <SelectValue placeholder={placeholder} className="truncate" />
              </span>

              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <ChevronDown size={18} className="text-text-muted" />
              </motion.div>
            </SelectTrigger>
          </motion.div>
        </FormControl>

        <SelectContent
          className={`
            mt-1 max-h-56 overflow-auto rounded border border-border-color
            bg-surface-primary p-1 text-text-muted shadow-lg
            scrollbar-thin scrollbar-track-surface-secondary scrollbar-thumb-border-color
            ${contentClassName}
          `}
        >
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="
                  mb-1 flex cursor-pointer select-none items-center rounded
                  py-1.5 px-2 font-sans text-text-secondary
                  last:mb-0
                  transition-colors
                  focus:bg-hover-overlay focus:text-text-primary
                "
              >
                <div className="flex min-w-0 w-full items-center gap-3">
                  {option.icon && (
                    <span className="flex-shrink-0">
                      <option.icon
                        size={18}
                        className={iconColor(option.value)}
                      />
                    </span>
                  )}
                  <span className="flex-1 truncate">{option.label}</span>
                </div>
              </SelectItem>
            ))}
          </motion.div>
        </SelectContent>
      </Select>

      <FormMessage className="mt-1 text-xs text-accent-error">
        {error?.message}
      </FormMessage>
    </FormItem>
  );
};
