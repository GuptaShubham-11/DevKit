import Loader from '@/components/Loader';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { LabelInput } from '@/components/LabelInput';
import { CustomDropdown } from '@/components/CustomDropdown';
import { useCategories, useFetchLoading, useSetQuery } from '@/store/category';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import {
  ArrowDownNarrowWide,
  Image,
  Link2,
  ListOrdered,
  Paintbrush,
  Pencil,
  Text,
} from 'lucide-react';

import { FieldPath, FieldValues, useWatch } from 'react-hook-form';
import {
  FormCategoryProps,
  CategoryFormType,
} from '@/types/small-types/category';

export const FormCategory = <T extends FieldValues = CategoryFormType>({
  form,
}: FormCategoryProps<T>) => {
  const categories = useCategories();
  const setQuery = useSetQuery();
  const loading = useFetchLoading();
  const color = useWatch({
    control: form.control,
    name: 'color' as FieldPath<T>,
  });

  const categoryOptions = categories.map((category) => ({
    value: category._id,
    label: category.name,
    icon: category.icon,
    color: category.color,
  }));

  categoryOptions.unshift({
    value: 'none',
    label: 'None',
    icon: 'OctagonX',
    color: '#a6a6a6',
  });

  return (
    <>
      {/* Name & Sort Order */}
      <div className="flex items-center justify-center gap-2">
        <FormField
          control={form.control}
          name={'name' as FieldPath<T>}
          render={({ field, fieldState }) => (
            <FormItem>
              <LabelInput
                label="Name"
                placeholder="e.g., Web Development"
                iconLeft={Pencil}
                error={fieldState.error?.message}
                {...field}
              />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={'sortOrder' as FieldPath<T>}
          render={({ field, fieldState }) => (
            <FormItem>
              <LabelInput
                label="Sort Order"
                placeholder="1"
                iconLeft={ListOrdered}
                error={fieldState.error?.message}
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormItem>
          )}
        />
      </div>

      {/* Description */}
      <FormField
        control={form.control}
        name={'description' as FieldPath<T>}
        render={({ field, fieldState }) => (
          <FormItem>
            <LabelInput
              label="Description"
              placeholder="Easy to understand and useful"
              iconLeft={Text}
              error={fieldState.error?.message}
              {...field}
            />
          </FormItem>
        )}
      />

      {/* Parent Category */}
      <FormField
        control={form.control}
        name={'parentId' as FieldPath<T>}
        render={({ field, fieldState }) => (
          <FormItem className="flex items-end justify-center gap-2">
            <CustomDropdown
              field={field}
              error={fieldState.error}
              options={categoryOptions}
              label="Parent Category"
              placeholder="Select parent category"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  disabled={loading}
                  variant="ghost"
                  className="bg-surface-secondary hover:bg-hover-overlay rounded-[2px] px-2 hover:text-text-secondary cursor-pointer"
                  onClick={() =>
                    setQuery({
                      limit: 50,
                      treeStructure: 'false',
                    })
                  }
                >
                  {loading ? <Loader /> : <ArrowDownNarrowWide size={18} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-surface-secondary/90 mb-1 px-2 py-1 ring-1 ring-white/20 rounded z-50">
                <p className="text-xs">Load All Categories</p>
              </TooltipContent>
            </Tooltip>
          </FormItem>
        )}
      />

      {/* Icon */}
      <FormField
        control={form.control}
        name={'icon' as FieldPath<T>}
        render={({ field, fieldState }) => (
          <FormItem className="mt-2">
            <LabelInput
              label="Icon"
              iconLeft={Image}
              error={fieldState.error?.message}
              {...field}
            />
          </FormItem>
        )}
      />

      {/* Active Status */}
      <FormField
        control={form.control}
        name={'isActive' as FieldPath<T>}
        render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-[2px] border border-border-color bg-surface-secondary/30 p-4">
            <div>
              <FormLabel className="text-sm font-semibold text-text-primary">
                Active Category
              </FormLabel>
              <FormDescription className="text-xs text-text-muted md:text-sm">
                Enable or disable this category for users
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

      {/* Slug & Color */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <FormField
          control={form.control}
          name={'slug' as FieldPath<T>}
          render={({ field, fieldState }) => (
            <FormItem>
              <LabelInput
                label="Slug"
                placeholder="e.g., web-development"
                iconLeft={Link2}
                error={fieldState.error?.message}
                {...field}
              />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={'color' as FieldPath<T>}
          render={({ field, fieldState }) => (
            <FormItem className="flex items-center gap-2">
              <LabelInput
                label="Color"
                placeholder="#ffffff"
                color={color}
                iconLeft={Paintbrush}
                error={fieldState.error?.message}
                {...field}
              />
              {color && (
                <div
                  className="size-8 shrink-0 rounded border border-border-color"
                  style={{ backgroundColor: color }}
                />
              )}
            </FormItem>
          )}
        />
      </div>
    </>
  );
};
