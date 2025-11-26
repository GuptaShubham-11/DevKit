import React, {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  KeyboardEvent,
  ClipboardEvent,
  FocusEvent,
} from 'react';
import { motion } from 'framer-motion';
import { Input } from '../ui/input';

interface InputOtpProps {
  length?: number;
  onComplete?: (otp: string) => void;
  error?: boolean;
}

export const InputOtp: React.FC<InputOtpProps> = ({
  length = 6,
  onComplete,
  error,
}) => {
  const [otp, setOtp] = useState<string[]>(() =>
    Array.from({ length }, () => '')
  );
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const focusInput = (index: number) => {
    const target = inputRefs.current[index];
    if (target) {
      target.focus();
      setActiveIndex(index);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;

    // Only digits allowed
    if (value && !/^\d+$/.test(value)) return;

    const nextOtp = [...otp];

    // Keep only last digit typed
    nextOtp[index] = value.slice(-1);
    setOtp(nextOtp);

    const combined = nextOtp.join('');

    if (combined.length === length && !nextOtp.includes('') && onComplete) {
      onComplete(combined);
    }

    // Move to next input if user typed something
    if (value && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    const key = e.key;

    if (key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        focusInput(index - 1);
      } else {
        // Clear current input
        const nextOtp = [...otp];
        nextOtp[index] = '';
        setOtp(nextOtp);
      }
      return;
    }

    if (key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1);
      return;
    }

    if (key === 'ArrowRight' && index < length - 1) {
      focusInput(index + 1);
      return;
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const pasted = e.clipboardData.getData('text/plain').slice(0, length);

    if (!/^\d+$/.test(pasted)) return;

    const nextOtp = Array.from({ length }, (_, i) => pasted[i] ?? '');
    setOtp(nextOtp);

    const lastIndex = Math.min(pasted.length - 1, length - 1);
    if (lastIndex >= 0) {
      focusInput(lastIndex);
    }

    const combined = nextOtp.join('');
    if (!nextOtp.includes('') && combined.length === length && onComplete) {
      onComplete(combined);
    }
  };

  const handleFocus = (_e: FocusEvent<HTMLInputElement>, index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="flex w-full justify-center gap-2 my-6 sm:gap-3">
      {otp.map((value, index) => (
        <motion.div
          key={index}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className="relative"
        >
          <Input
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={value}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            onFocus={(e) => handleFocus(e, index)}
            className={`
              h-12 w-10 rounded-[4px] border bg-surface-secondary/30
              text-center text-xl font-bold outline-none transition-all duration-300
              caret-accent-primary sm:h-14 sm:w-12
              ${
                error
                  ? 'border-accent-error text-accent-error'
                  : activeIndex === index
                    ? 'border-border-color text-white shadow-[0_0_15px_-3px_rgba(99,102,241,0.4)]'
                    : 'border-white/10 text-text-primary hover:border-white/10 hover:bg-surface-secondary/50'
              }
            `}
          />

          {activeIndex === index && !error && (
            <motion.div
              layoutId="otp-active"
              className="absolute -bottom-2 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full bg-accent-primary"
            />
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: activeIndex === index ? 1 : 0 }}
            className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-text-primary"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: activeIndex === index ? 1 : 0 }}
            className="pointer-events-none absolute top-0 right-0 h-2 w-2 border-r border-t border-text-primary"
          />
        </motion.div>
      ))}
    </div>
  );
};
