// Item props
export type Item = {
  id: string;
  name: string;
  image?: string;
  fallbackIcon?: string;
  description?: string;
  affectedUsers?: number;
  affectedItems?: number;
  customWarning?: string;
  type?: string;
  isActive?: boolean;
  color?: string;
};

// Button label
export type ConfirmButtonLabels = {
  confirm?: string;
  cancel?: string;
};

export type DangerLevel = 'low' | 'medium' | 'high' | 'critical';

export type ConfirmationType =
  | 'simple'
  | 'type-name'
  | 'type-delete'
  | 'custom';

export type ConfirmVariant = 'default' | 'destructive' | 'warning' | 'success';

// Confirm Popup props
export type ConfirmPopupProps = {
  open: boolean;
  onCancel?: () => void;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<unknown> | void;
  item?: Item;
  loading?: boolean;
  title?: string;
  subtitle?: string;
  dangerLevel?: DangerLevel;
  confirmationType?: ConfirmationType;
  customConfirmText?: string;
  showImpactWarning?: boolean;
  customWarningMessage?: string;
  buttonLabels?: ConfirmButtonLabels;
  variant?: ConfirmVariant;
};
