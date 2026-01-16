import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Form } from '@/components/ui/form';
import { FormCategory } from './FormCategory';
import { ChartColumnStacked } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { FooterCategoryDialog } from './FooterCategoryDialog';
import { CategoryDialogProps } from '@/types/small-types/category';

import { createCategorySchema, CreateCategory } from '@/validation/category';

import {
  useCreateCategory,
  useCreateLoading,
  useGenerateSlug,
} from '@/store/category';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const CreateCategoryDialog: React.FC<CategoryDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const createCategory = useCreateCategory();
  const generateSlug = useGenerateSlug();
  const loading = useCreateLoading();

  const form = useForm<CreateCategory>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: '',
      description: '',
      slug: '',
      parentId: null,
      icon: 'CircleQuestionMark',
      sortOrder: 0,
      isActive: true,
      color: '',
      featuredTemplates: [],
      clickCount: 0,
      metadata: {},
      templateCount: 0,
    },
  });

  const name = form.watch('name');

  const handleSubmit = async (data: CreateCategory) => {
    try {
      const payload = {
        ...data,
        parentId:
          data.parentId === 'none' || !data.parentId ? null : data.parentId,
      };

      const newCategory = await createCategory(payload);

      if (newCategory) {
        form.reset();
        onOpenChange(false);
      }
    } catch {
      // Store handles errors + toasts
    }
  };

  // Auto-generate slug from name
  useEffect(() => {
    if (name?.trim()) {
      const slug = generateSlug(name);
      form.setValue('slug', slug, { shouldValidate: true });
    } else {
      form.setValue('slug', '', { shouldValidate: true });
    }
  }, [name, form, generateSlug]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl rounded-[4px] border-border-color bg-surface-primary p-2 font-sans">
        <DialogHeader>
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="rounded bg-accent-primary/10 p-2">
              <ChartColumnStacked className="size-6 text-accent-primary" />
            </div>
            <div>
              <DialogTitle className="text-left leading-tight tracking-wide text-text-primary">
                Add Category
              </DialogTitle>
              <DialogDescription className="text-sm text-text-muted">
                Create categories for templates
              </DialogDescription>
            </div>
          </div>
          <Separator className="bg-border-color" />
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <Form {...form}>
            <motion.form
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              onSubmit={form.handleSubmit(handleSubmit)}
              className="p-4 pt-2"
            >
              <FormCategory form={form} />

              <FooterCategoryDialog
                handleClose={onOpenChange}
                isFormValid={form.formState.isValid}
                loading={loading}
              />
            </motion.form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
