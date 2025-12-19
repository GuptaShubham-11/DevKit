import { motion, AnimatePresence } from 'framer-motion';
import { FieldPath } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { LabelInput } from '@/components/LabelInput';
import { Separator } from '@/components/ui/separator';
import CustomButton from '@/components/CustomButton';
import { rarityConfig } from '@/lib/small-utils/badge';
import { BadgeFormType, RewardProps } from '@/types/small-types/badge';

import {
  ChevronDown,
  ChevronUp,
  Coins,
  Trash2,
  TrendingUp,
} from 'lucide-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

export function Reward<T extends BadgeFormType>({
  form,
  rarityLevel,
  isPrivilegesOpen,
  specialPrivileges,
  addSpecialPrivilege,
  setIsPrivilegesOpen,
  removeSpecialPrivilege,
  updateSpecialPrivilege,
}: RewardProps<T>) {
  const rarity = rarityConfig[rarityLevel];

  const parseNumber = (raw: string, fallback = 0) => {
    const parsed = Number.parseInt(raw, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
  };

  return (
    <>
      <div className="mb-4 text-center">
        <h3 className="flex items-center justify-center gap-2 text-xl font-bold text-text-primary md:text-2xl">
          Rewards & Privileges
        </h3>
        <p className="text-sm text-text-muted">
          Define the rewards and privileges for this badge
        </p>
      </div>

      {/* Points & XP */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name={'pointsRequired' as FieldPath<T>}
          render={({ field }) => (
            <FormItem>
              <LabelInput
                label="Points"
                placeholder="30"
                iconLeft={Coins}
                error={form.formState.errors.pointsRequired?.message as string}
                type="number"
                value={field.value?.toString() ?? ''}
                onChange={(e) => field.onChange(parseNumber(e.target.value, 0))}
              />
              {rarity && (
                <FormDescription className="-mt-6 text-xs text-text-muted">
                  <span className="text-accent-warning">Required: </span>
                  {rarity.points.min}-{rarity.points.max} for {rarityLevel}
                </FormDescription>
              )}
              <FormMessage className="text-sm font-medium" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={'rewardData.xpBonus' as FieldPath<T>}
          render={({ field }) => (
            <FormItem>
              <LabelInput
                label="XP"
                placeholder="30"
                iconLeft={TrendingUp}
                // error={form.formState.errors.rewardData?.xpBonus?.message}
                type="number"
                value={field.value?.toString() ?? ''}
                onChange={(e) => field.onChange(parseNumber(e.target.value, 0))}
              />
              {rarity && (
                <FormDescription className="-mt-6 text-xs text-text-muted">
                  <span className="text-accent-warning">Required: </span>
                  {rarity.xp.min}-{rarity.xp.max} XP for {rarityLevel}
                </FormDescription>
              )}
              <FormMessage className="text-sm font-medium" />
            </FormItem>
          )}
        />
      </div>

      <Separator className="my-2 h-[1px] bg-white/10" />

      {/* Special Privileges */}
      <Collapsible open={isPrivilegesOpen} onOpenChange={setIsPrivilegesOpen}>
        <div className="space-y-2 p-2">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="flex items-center gap-2 p-0 text-left text-text-muted transition-colors duration-300 hover:bg-transparent hover:text-text-primary"
              >
                <h3 className="text-lg font-medium text-text-secondary">
                  Special Privileges ({specialPrivileges.length})
                </h3>
                {isPrivilegesOpen ? (
                  <ChevronUp className="size-4 md:size-5" />
                ) : (
                  <ChevronDown className="size-4 md:size-5" />
                )}
              </Button>
            </CollapsibleTrigger>

            <CustomButton
              type="button"
              onClick={addSpecialPrivilege}
              label="Add"
              variant="primary"
              className="max-w-2"
            />
          </div>

          <CollapsibleContent className="space-y-4">
            <AnimatePresence initial={false}>
              {specialPrivileges.map((privilege, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center"
                >
                  <Input
                    placeholder="e.g., early_access"
                    className="bg-surface-secondary border-border-color font-medium text-text-primary rounded-none"
                    value={privilege}
                    onChange={(e) =>
                      updateSpecialPrivilege(index, e.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeSpecialPrivilege(index)}
                    className="min-w-[40px] rounded-none border-border-color bg-accent-error/10 px-2 text-accent-error hover:bg-accent-error/30 hover:text-accent-error/70"
                  >
                    <Trash2 className="size-4 md:size-5" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </CollapsibleContent>
        </div>
      </Collapsible>

      <Separator className="mb-4 h-[1px] bg-white/10" />

      {/* Badge Settings */}
      <div className="space-y-4">
        <FormField
          control={form.control}
          name={'rewardData.profileBadge' as FieldPath<T>}
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-[2px] border border-border-color bg-surface-secondary/30 p-4">
              <div>
                <FormLabel className="text-sm font-semibold text-text-primary">
                  Profile Badge
                </FormLabel>
                <FormDescription className="text-xs text-text-muted md:text-sm">
                  Display prominently on user profiles and leaderboards
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-accent-success/80 data-[state=unchecked]:bg-surface-secondary"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={'isActive' as FieldPath<T>}
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-[2px] border border-border-color bg-surface-secondary/30 p-4">
              <div>
                <FormLabel className="text-sm font-semibold text-text-primary">
                  Active Badge
                </FormLabel>
                <FormDescription className="text-xs text-text-muted md:text-sm">
                  Earn this badge immediately upon meeting criteria
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-accent-success/80 data-[state=unchecked]:bg-surface-secondary"
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
