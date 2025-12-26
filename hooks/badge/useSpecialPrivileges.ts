import {
  BadgeFormType,
  UseSpecialPrivilegesProps,
} from '@/types/small-types/badge';
import { FieldPath } from 'react-hook-form';
import { useCallback } from 'react';

export function useSpecialPrivileges<T extends BadgeFormType>({
  form,
  specialPrivileges,
  setIsPrivilegesOpen,
}: UseSpecialPrivilegesProps<T>) {
  const addSpecialPrivilege = useCallback(() => {
    const updated = [...specialPrivileges, ''];
    form.setValue(
      'rewardData.specialPrivileges' as FieldPath<T>,
      updated as any
    );
    setIsPrivilegesOpen(true);
  }, [specialPrivileges, form, setIsPrivilegesOpen]);

  const removeSpecialPrivilege = useCallback(
    (index: number) => {
      const updated = specialPrivileges.filter((_, i) => i !== index);
      form.setValue(
        'rewardData.specialPrivileges' as FieldPath<T>,
        updated as any
      );
    },
    [specialPrivileges, form]
  );

  const updateSpecialPrivilege = useCallback(
    (index: number, value: string) => {
      const updated = [...specialPrivileges];
      updated[index] = value;
      form.setValue(
        'rewardData.specialPrivileges' as FieldPath<T>,
        updated as any
      );
    },
    [specialPrivileges, form]
  );

  return {
    addSpecialPrivilege,
    removeSpecialPrivilege,
    updateSpecialPrivilege,
  };
}
