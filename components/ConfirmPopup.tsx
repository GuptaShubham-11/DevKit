import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, HelpCircle, Info } from 'lucide-react';

import Icon from './Icon';
import CustomButton from './CustomButton';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { ConfirmPopupProps } from '@/types/small-types/confirmPopup';

import {
  expectedConfirmText,
  impactWarningMessage,
  variantStyles,
  shouldShowImpactWarning,
} from '@/lib/small-utils/confirmPopup';

export const ConfirmPopup = ({
  open,
  onOpenChange,
  onConfirm,
  item,
  loading = false,

  title = 'Delete Item',
  subtitle = 'This action cannot be undone',
  dangerLevel = 'medium',
  confirmationType = 'type-name',
  customConfirmText,

  showImpactWarning = true,
  customWarningMessage,
  buttonLabels = { confirm: 'Delete', cancel: 'Cancel' },

  variant = 'destructive',
}: ConfirmPopupProps) => {
  const [confirmText, setConfirmText] = useState('');

  const resetState = () => {
    setConfirmText('');
  };

  const handleClose = () => {
    if (loading) return;
    resetState();
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    try {
      await onConfirm();
      resetState();
      onOpenChange(false);
    } catch {
      // Store or caller handles errors/toasts
    }
  };

  const expectedConfirmedText = expectedConfirmText(
    item,
    confirmationType,
    customConfirmText
  );

  const isConfirmValid =
    confirmationType === 'simple' || confirmText === expectedConfirmedText;

  const styles = variantStyles(variant);
  const VariantIcon = styles.icon;

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={handleClose}>
          <DialogContent
            role="alertdialog"
            aria-describedby="confirm-modal-description"
            aria-label={title}
            className={cn(
              'max-w-sm overflow-hidden rounded-xl border border-border-color bg-surface-primary p-0 font-sans shadow-xl'
            )}
          >
            {/* Header */}
            <div
              className={cn('relative bg-gradient-to-br p-4', styles.headerBg)}
            >
              <div className="flex items-center gap-2">
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.4, type: 'spring' }}
                  className={cn(
                    'flex size-10 items-center justify-center rounded',
                    styles.iconBg
                  )}
                >
                  <VariantIcon className={cn('size-6', styles.iconColor)} />
                </motion.div>

                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-lg font-bold leading-tight tracking-wide text-text-secondary">
                    {title}
                  </DialogTitle>
                  <p className="text-sm text-text-muted">{subtitle}</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="space-y-4 p-6 pt-0">
              {/* Item preview */}
              {item && (
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <div className="relative">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="size-10 rounded-lg object-cover lg:size-12"
                      />
                    ) : (
                      <div
                        className="flex size-10 items-center justify-center rounded-lg lg:size-12"
                        style={{
                          backgroundColor: `${item.color ?? '#4b5563'}33`,
                        }}
                      >
                        {item.fallbackIcon ? (
                          <Icon
                            name={item.fallbackIcon}
                            style={{ color: item.color }}
                            className="size-5 md:size-7"
                          />
                        ) : (
                          <HelpCircle className="h-6 w-6 text-white lg:h-7 lg:w-7" />
                        )}
                      </div>
                    )}

                    {item.isActive === false && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-bg-secondary text-text-muted">
                        <span className="text-xs font-medium text-white">
                          Inactive
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-text-primary">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-sm leading-tight text-text-muted">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Impact warning */}
              {shouldShowImpactWarning(
                showImpactWarning,
                item,
                customWarningMessage
              ) && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={cn(
                    'rounded border px-4 py-1',
                    dangerLevel === 'critical'
                      ? 'border-red-500/30 bg-red-500/10'
                      : dangerLevel === 'high'
                        ? 'border-orange-500/30 bg-orange-500/10'
                        : 'border-amber-500/30 bg-amber-500/10'
                  )}
                >
                  <div
                    className={cn(
                      'flex items-center gap-2',
                      dangerLevel === 'critical'
                        ? 'text-red-600'
                        : dangerLevel === 'high'
                          ? 'text-orange-600'
                          : 'text-amber-600'
                    )}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {impactWarningMessage(item, customWarningMessage)}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Custom item warning */}
              {item?.customWarning && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="rounded border border-blue-500/30 bg-blue-500/10 px-4 py-1"
                >
                  <div className="flex items-center gap-2 text-blue-600">
                    <Info className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {item.customWarning}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Confirmation input */}
              {confirmationType !== 'simple' && (
                <div className="space-y-2">
                  <p className="text-sm text-text-muted">
                    {confirmationType === 'type-name' && item ? (
                      <>
                        Type{' '}
                        <span className="font-semibold text-text-primary">
                          {`Delete ${item.name}`}
                        </span>{' '}
                        to confirm:
                      </>
                    ) : confirmationType === 'type-delete' ? (
                      <>
                        Type{' '}
                        <span className="font-semibold text-text-primary">
                          DELETE
                        </span>{' '}
                        to confirm:
                      </>
                    ) : confirmationType === 'custom' ? (
                      <>
                        Type{' '}
                        <span className="font-semibold text-text-primary">
                          {`"${expectedConfirmedText}"`}
                        </span>{' '}
                        to confirm:
                      </>
                    ) : null}
                  </p>

                  <Input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder={
                      confirmationType === 'type-delete'
                        ? 'DELETE'
                        : 'Type here...'
                    }
                    className={cn(
                      'rounded border-border-color bg-surface-secondary/70 text-text-primary',
                      confirmText &&
                        !isConfirmValid &&
                        'border-red-500 ring-1 ring-red-500/20',
                      isConfirmValid &&
                        'border-green-500 ring-1 ring-green-500/20'
                    )}
                    disabled={loading}
                  />

                  {confirmText && !isConfirmValid && (
                    <p className="text-sm capitalize text-red-500">
                      {confirmationType === 'type-name' && item
                        ? `Must type "Delete ${item.name}" exactly`
                        : confirmationType === 'type-delete'
                          ? 'Must type "DELETE" exactly'
                          : `Must type "${expectedConfirmedText}" exactly`}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <CustomButton
                  onClick={handleClose}
                  variant="secondary"
                  label={buttonLabels?.cancel || 'Cancel'}
                  className="w-full flex-1"
                  disabled={loading}
                />
                <CustomButton
                  onClick={handleConfirm}
                  disabled={loading || !isConfirmValid}
                  loading={loading}
                  variant={
                    variant === 'destructive'
                      ? 'danger'
                      : variant === 'default'
                        ? 'primary'
                        : 'success'
                  }
                  label={buttonLabels?.confirm || 'Confirm'}
                  className={cn(
                    'w-full',
                    variant === 'warning' &&
                      'border-accent-warning bg-accent-warning hover:bg-accent-warning/80'
                  )}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};
