import { ConfirmPopupProps } from '@/types/small-types/confirmPopup';
import { AlertTriangle, CheckCheck, Info, Trash2 } from 'lucide-react';

export const expectedConfirmText = (
  item: ConfirmPopupProps['item'],
  confirmationType: ConfirmPopupProps['confirmationType'],
  customConfirmText: ConfirmPopupProps['customConfirmText']
) => {
  switch (confirmationType) {
    case 'type-name':
      return `Delete ${item?.name}`;
    case 'type-delete':
      return 'DELETE';
    case 'custom':
      return customConfirmText || '';
    case 'simple':
    default:
      return '';
  }
};

export const variantStyles = (variant: ConfirmPopupProps['variant']) => {
  const baseStyles = {
    success: {
      headerBg: 'from-green-500/10 via-green-600/5 to-transparent',
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-500',
      icon: CheckCheck,
    },
    destructive: {
      headerBg: 'from-red-500/10 via-red-600/5 to-transparent',
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-500',
      icon: Trash2,
    },
    warning: {
      headerBg: 'from-amber-500/10 via-amber-600/5 to-transparent',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
      icon: AlertTriangle,
    },
    default: {
      headerBg: 'from-blue-500/10 via-blue-600/5 to-transparent',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      icon: Info,
    },
  };

  return baseStyles[variant ? variant : 'default'] || baseStyles.destructive;
};

export const shouldShowImpactWarning = (
  showImpactWarning: ConfirmPopupProps['showImpactWarning'],
  item: ConfirmPopupProps['item'],
  customWarningMessage?: ConfirmPopupProps['customWarningMessage']
) => {
  if (!showImpactWarning) return false;
  if (customWarningMessage) return true;
  if (item?.affectedItems) return true;
  if (item?.affectedUsers) return true;
  return false;
};

export const impactWarningMessage = (
  item: ConfirmPopupProps['item'],
  customWarningMessage: ConfirmPopupProps['customWarningMessage']
) => {
  if (customWarningMessage) return customWarningMessage;

  const { affectedUsers, affectedItems } = item || {
    affectedUsers: 0,
    affectedItems: 0,
  };

  if (affectedUsers && affectedItems) {
    return `Will affect ${affectedUsers} users and ${affectedItems} items`;
  } else if (affectedUsers) {
    return `Will affect ${affectedUsers} users`;
  } else if (affectedItems) {
    return `Will affect ${affectedItems} items`;
  }

  return 'This action will have cascading effects';
};
