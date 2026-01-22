import { Category } from '@/types/shared/category';
import { AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmPopup } from '@/components/ConfirmPopup';
import { UpdateCategoryDialog } from './UpdateCategoryDialog';
import { useState, useEffect, useRef, useCallback } from 'react';
import { RowSkeleton } from './RowSkeleton';
import { CategoryRow } from './CategoryRow';
import { Archive } from 'lucide-react';

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  useCategories,
  useCategoryPagination,
  useDeleteCategory,
  useDeleteLoading,
  useFetchLoading,
  useLoadMoreCategories,
  useLoadMoreLoading,
} from '@/store/category';

const SCROLL_THRESHOLD = 150;

export const CategoryTable = () => {
  const categories = useCategories();
  const deleteCategory = useDeleteCategory();
  const loadMoreCategories = useLoadMoreCategories();
  const deleteLoading = useDeleteLoading();
  const loadMoreLoading = useLoadMoreLoading();
  const fetchLoading = useFetchLoading();
  const pagination = useCategoryPagination();

  const tableRef = useRef<HTMLDivElement>(null);
  const [isDeleteConfirmPopupOpen, setIsDeleteConfirmPopupOpen] =
    useState(false);
  const [isUpdateCategoryDialogOpen, setIsUpdateCategoryDialogOpen] =
    useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});

  const toggleChildren = useCallback((categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  }, []);

  // Infinite scroll
  const handleScroll = useCallback(() => {
    const element = tableRef.current;
    if (!element) return;

    const { scrollTop, scrollHeight, clientHeight } = element;
    if (
      scrollTop + clientHeight >= scrollHeight - SCROLL_THRESHOLD &&
      !loadMoreLoading &&
      !fetchLoading &&
      pagination?.hasMore
    ) {
      loadMoreCategories();
    }
  }, [loadMoreLoading, fetchLoading, pagination?.hasMore, loadMoreCategories]);

  useEffect(() => {
    const element = tableRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const handleUpdate = (category: Category) => {
    setSelectedCategory(category);
    setIsUpdateCategoryDialogOpen(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteConfirmPopupOpen(true);
  };

  if (!fetchLoading && categories.length === 0) {
    return (
      <Card className="border-border-color bg-surface-primary h-80 w-full">
        <CardContent className="flex h-full items-center justify-center p-8">
          <div className="text-center">
            <Archive size={56} className="mx-auto text-text-muted/40" />
            <h3 className="mt-4 text-lg font-semibold text-text-primary">
              No categories found
            </h3>
            <p className="text-sm text-text-muted">
              Start by creating your first category to organize your content.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <section>
      <Card className="border-border-color bg-surface-primary shadow-md pt-0 pb-0 overflow-hidden">
        <CardContent className="p-0">
          <div ref={tableRef} className="max-h-[600px] overflow-auto relative">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent ">
                  <TableHead className="sticky top-0 left-0 z-30 bg-surface-primary px-4 py-3 text-center font-semibold text-text-muted border-r border-border-color rounded-2xl">
                    #
                  </TableHead>
                  <TableHead className="sticky top-0 z-20 bg-surface-primary px-4 py-3 font-semibold text-text-muted border-r border-border-color">
                    Category
                  </TableHead>
                  <TableHead className="sticky top-0 z-20 bg-surface-primary px-4 py-3 text-center font-semibold text-text-muted border-r border-border-color">
                    Templates
                  </TableHead>
                  <TableHead className="sticky top-0 z-20 bg-surface-primary px-4 py-3 text-center font-semibold text-text-muted border-r border-border-color">
                    Clicks
                  </TableHead>
                  <TableHead className="sticky top-0 z-20 bg-surface-primary px-4 py-3 text-center font-semibold text-text-muted border-r border-border-color">
                    Order
                  </TableHead>
                  <TableHead className="sticky top-0 z-20 bg-surface-primary px-4 py-3 text-center font-semibold text-text-muted border-r border-border-color">
                    Created
                  </TableHead>
                  <TableHead className="sticky top-0 z-20 bg-surface-primary px-4 py-3 text-center font-semibold text-text-muted border-r border-border-color">
                    Updated
                  </TableHead>
                  <TableHead className="sticky top-0 z-20 bg-surface-primary px-4 py-3 text-center font-semibold text-text-muted rounded-2xl">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                <AnimatePresence mode="popLayout">
                  {fetchLoading && categories.length === 0 ? (
                    <RowSkeleton />
                  ) : (
                    categories.map((category, index) => (
                      <CategoryRow
                        key={category._id}
                        category={category}
                        index={index}
                        expandedCategories={expandedCategories}
                        toggleChildren={toggleChildren}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                      />
                    ))
                  )}
                  {loadMoreLoading && <RowSkeleton />}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <UpdateCategoryDialog
        open={isUpdateCategoryDialogOpen}
        onOpenChange={setIsUpdateCategoryDialogOpen}
        category={selectedCategory}
      />

      <ConfirmPopup
        open={isDeleteConfirmPopupOpen}
        onOpenChange={setIsDeleteConfirmPopupOpen}
        title="Delete category"
        subtitle="This action cannot be undone"
        confirmationType="type-name"
        buttonLabels={{ confirm: 'Delete', cancel: 'Cancel' }}
        item={{
          id: selectedCategory?._id || Date.now().toString(),
          name: selectedCategory?.name || 'No name',
          affectedItems: selectedCategory?.templateCount || 0,
          description: selectedCategory?.description || 'No description',
          fallbackIcon: selectedCategory?.icon,
          isActive: selectedCategory?.isActive,
          type: 'category',
          color: selectedCategory?.color,
        }}
        dangerLevel="high"
        variant="destructive"
        showImpactWarning
        onConfirm={() => deleteCategory(selectedCategory?._id ?? '')}
        loading={deleteLoading}
      />
    </section>
  );
};
