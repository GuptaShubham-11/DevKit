import React from 'react';
import { Loader2 } from 'lucide-react';

export type LoaderProps = {
  label?: string;
  variant?: 'spinner';
  size?: number;
  className?: string;
  fullscreen?: boolean;
  autoProgress?: boolean;
};

const join = (...v: Array<string | false | undefined>) =>
  v.filter(Boolean).join(' ');

export default function Loader({
  label = 'Loading…',
  variant = 'spinner',
  size = 20,
  className,
  fullscreen = false,
}: LoaderProps) {
  const content = (
    <div
      role="status"
      aria-live="polite"
      className={join(
        'flex items-center gap-2 text-text-secondary',
        fullscreen ? 'p-6' : 'p-0',
        className
      )}
    >
      {variant === 'spinner' && <Spinner size={size} />}
      <span>{label}</span>
    </div>
  );

  if (!fullscreen) return content;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm">
      <div className="rounded-2xl border border-white/5 bg-[var(--surface-primary)]/90 shadow-xl">
        {content}
      </div>
    </div>
  );
}

function Spinner({ size = 20 }: { size?: number }) {
  return (
    <Loader2
      aria-hidden
      className="animate-spin text-text-primary"
      size={size}
      strokeWidth={2.5}
    />
  );
}
