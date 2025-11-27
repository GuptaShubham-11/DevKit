import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Loader from './Loader';

type ButtonVariant =
  | 'main'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'ghost';

type ButtonType = 'button' | 'submit' | 'reset';

interface CustomButtonProps {
  icon?: React.ComponentType<{ className?: string }>;
  label?: string;
  onClick?: () => void;
  variant?: ButtonVariant;
  shortcut?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  type?: ButtonType;
  keyCmd?: string; // e.g. "Control+K"
  svg?: boolean; // controls googleSvg
  shimmer?: boolean;
}

const baseStyles =
  'relative w-full flex items-center justify-center gap-2 px-6 py-2 rounded-[2px] ' +
  'font-medium text-sm tracking-wide transition-all duration-300 disabled:opacity-50 ' +
  'disabled:cursor-not-allowed disabled:shadow-none group overflow-hidden border min-w-[120px]';

const variants: Record<ButtonVariant, string> = {
  main:
    'bg-brand-primary text-white border-brand-primary/50 ' +
    'shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)] ' +
    'hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.6)] ' +
    'hover:bg-brand-primary-600 hover:border-brand-primary-600',
  primary:
    'bg-accent-primary border border-accent-primary hover:bg-accent-primary/80',
  secondary:
    'bg-surface-primary hover:bg-surface-secondary border border-surface-secondary ' +
    'hover:border-white/10 text-text-secondary hover:text-text-primary ' +
    'py-2 transition-all duration-200',
  success:
    'bg-accent-success border border-accent-success hover:bg-accent-success/80',
  danger: 'bg-accent-error border border-accent-error hover:bg-accent-error/80',
  ghost:
    'bg-transparent text-text-muted border-transparent hover:text-text-primary ' +
    'hover:bg-white/5 shadow-none',
};

const googleSvg = (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export default function CustomButton({
  icon: Icon,
  label,
  onClick,
  variant = 'secondary',
  shortcut,
  className,
  disabled = false,
  loading = false,
  type = 'button',
  keyCmd,
  svg = false,
  shimmer = false,
}: CustomButtonProps) {
  useEffect(() => {
    if (!keyCmd || !onClick || loading || disabled) return;
    if (typeof window === 'undefined') return;

    const comboKeys = keyCmd.split('+').map((k) => k.trim());
    const pressedKeys = new Set<string>();

    const mapKeyAlias = (k: string) => {
      if (k.toLowerCase() === 'space') return ' ';
      return k;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      pressedKeys.add(key);

      const allPressed = comboKeys.every((k) =>
        pressedKeys.has(mapKeyAlias(k))
      );

      if (allPressed) {
        event.preventDefault();
        onClick();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      pressedKeys.delete(event.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [keyCmd, onClick, loading, disabled]);

  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      transition={{ duration: 0.2 }}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={[
        baseStyles,
        variants[variant],
        isDisabled ? 'cursor-not-allowed opacity-80' : 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {shimmer && !isDisabled && (
        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent z-0 group-hover:animate-[shimmer_1.5s_infinite]" />
      )}

      {loading ? (
        <Loader />
      ) : (
        <>
          {Icon && <Icon className="size-4" />}
          {svg && googleSvg}
          {label && <span>{label}</span>}

          {shortcut && (
            <div className="group/shortcut relative z-20 flex items-center">
              <span className="select-none rounded bg-surface-secondary/40 px-2 py-1 text-xs opacity-70">
                {shortcut}
              </span>

              {keyCmd && (
                <div
                  className="pointer-events-none invisible absolute bottom-full left-1/2 mb-2 
                  -translate-x-1/2 whitespace-nowrap rounded bg-surface-secondary px-2 py-1 
                  text-xs text-text-primary shadow-md transition-all duration-200 
                  group-hover/shortcut:visible"
                >
                  {keyCmd}
                  <div className="absolute top-full left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-surface-secondary" />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </motion.button>
  );
}
