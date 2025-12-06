import { UseFormReturn, FieldPath } from 'react-hook-form';
import { CreateBadgeData } from '@/validation/badge';
import { Separator } from '@/components/ui/separator';
import { CustomDropdown } from '@/components/CustomDropdown';
import { FormField, FormItem, FormLabel } from '@/components/ui/form';
import { LabelInput } from '@/components/LabelInput';
import {
  categoryOptions,
  conditionOptions,
  criteriaTypeOptions,
  getCategoryColor,
  getConditionColor,
  getCriteriaColor,
  getRarityColor,
  getTimeframeColor,
  rarityOptions,
  timeframeOptions,
} from '@/lib/smallUtils';

export interface ConfigurationProps {
  criteriaCondition: string;
  betweenValues: [number, number];
  form: UseFormReturn<CreateBadgeData>;
  setBetweenValues: (values: [number, number]) => void;
}

export const Configuration: React.FC<ConfigurationProps> = ({
  form,
  betweenValues,
  setBetweenValues,
  criteriaCondition,
}) => {
  const handleBetweenChange = (index: 0 | 1, raw: string) => {
    const parsed = Number.parseInt(raw, 10);
    const safeValue = Number.isNaN(parsed) ? 1 : parsed;

    setBetweenValues(
      index === 0
        ? [safeValue, betweenValues[1]]
        : [betweenValues[0], safeValue]
    );
  };

  return (
    <>
      {/* Category & Rarity */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name={'category' as FieldPath<CreateBadgeData>}
          render={({ field }) => (
            <CustomDropdown
              field={field}
              options={categoryOptions}
              label="Category"
              placeholder="Select category"
              iconPosition="left"
              getIconColor={getCategoryColor}
            />
          )}
        />

        <FormField
          control={form.control}
          name={'rarityLevel' as FieldPath<CreateBadgeData>}
          render={({ field }) => (
            <CustomDropdown
              field={field}
              options={rarityOptions}
              label="Rarity Level"
              placeholder="Select rarity"
              iconPosition="left"
              getIconColor={getRarityColor}
            />
          )}
        />
      </div>

      <Separator className="my-4 bg-border-color" />

      {/* Earning Criteria */}
      <div className="space-y-2">
        <div className="text-center">
          <h3 className="flex items-center justify-center gap-2 text-xl font-bold text-text-primary md:text-2xl">
            Earning Criteria
          </h3>
          <p className="text-sm text-text-muted">
            Define how users can earn this badge
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name={'criteria.type' as FieldPath<CreateBadgeData>}
            render={({ field }) => (
              <CustomDropdown
                field={field}
                options={criteriaTypeOptions}
                label="What to Track"
                placeholder="Select criteria"
                iconPosition="left"
                getIconColor={getCriteriaColor}
              />
            )}
          />

          <FormField
            control={form.control}
            name={'criteria.condition' as FieldPath<CreateBadgeData>}
            render={({ field }) => (
              <CustomDropdown
                field={field}
                options={conditionOptions}
                label="Condition"
                placeholder="Select condition"
                iconPosition="left"
                getIconColor={getConditionColor}
              />
            )}
          />
        </div>

        {criteriaCondition === 'between' ? (
          // Range mode
          <div className="space-y-2">
            <FormLabel className="mb-1 ml-0.5 block text-[12px] font-semibold tracking-wider text-text-muted opacity-80">
              Value Range
            </FormLabel>
            <div className="flex flex-col items-center gap-2 md:flex-row">
              <LabelInput
                label=""
                type="number"
                placeholder="Min"
                value={betweenValues[0].toString()}
                onChange={(e) => handleBetweenChange(0, e.target.value)}
              />
              <span className="px-2 text-sm font-medium text-text-secondary">
                To
              </span>
              <LabelInput
                label=""
                type="number"
                placeholder="Max"
                value={betweenValues[1].toString()}
                onChange={(e) => handleBetweenChange(1, e.target.value)}
              />
            </div>
          </div>
        ) : (
          // Single value + timeframe
          <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name={'criteria.timeframe' as FieldPath<CreateBadgeData>}
              render={({ field }) => (
                <CustomDropdown
                  field={field}
                  options={timeframeOptions}
                  label="Timeframe"
                  placeholder="Select timeframe"
                  iconPosition="left"
                  getIconColor={getTimeframeColor}
                />
              )}
            />

            <FormField
              control={form.control}
              name={'criteria.value' as FieldPath<CreateBadgeData>}
              render={({ field }) => (
                <FormItem>
                  <LabelInput
                    label="Target Value"
                    type="number"
                    error={form.formState.errors.criteria?.value?.message}
                    value={field.value?.toString() ?? ''}
                    onChange={(e) => {
                      const parsed = Number.parseInt(e.target.value, 10);
                      const safeValue = Number.isNaN(parsed) ? 1 : parsed;
                      field.onChange(safeValue);
                    }}
                  />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
    </>
  );
};
