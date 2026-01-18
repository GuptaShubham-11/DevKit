import axios from 'axios';
import { toast } from 'sonner';
import { create } from 'zustand';
import { CategoryState } from '@/types/small-types/store/category';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { ErrorState, Loading } from '@/types/small-types/store/common';
import {
  createInitialErrors,
  createInitialLoading,
  getAxiosErrorMessage,
} from '@/lib/small-utils/store/common';
import {
  buildCategoryMap,
  buildQueryParams,
  DEFAULT_QUERY,
} from '@/lib/small-utils/store/category';

const useCategoryStore = create<CategoryState>()(
  devtools(
    subscribeWithSelector((set, get) => {
      const setLoading = <K extends keyof Loading>(key: K, value: boolean) => {
        set((state) => ({
          loading: {
            ...state.loading,
            [key]: value,
          },
        }));
      };

      const setError = <K extends keyof ErrorState>(
        key: K,
        value: string | null
      ) => {
        set((state) => ({
          errors: {
            ...state.errors,
            [key]: value,
          },
        }));
      };

      return {
        categories: [],
        categoryMap: new Map(),
        stats: null,
        charts: null,
        pagination: null,
        loading: createInitialLoading(),
        errors: createInitialErrors(),
        query: DEFAULT_QUERY,

        actions: {
          fetchCategories: async (queryUpdates = {}) => {
            const newQuery = { ...get().query, ...queryUpdates, offset: 0 };
            setLoading('fetching', true);
            setError('fetch', null);

            try {
              const queryString = buildQueryParams(newQuery);
              const response = await axios.get(
                `/api/categories?${queryString}`
              );
              console.log(response);

              const { categories, pagination, stats, charts } = response.data;

              set((state) => ({
                categories,
                categoryMap: buildCategoryMap(categories),
                pagination,
                stats: stats ?? state.stats,
                charts,
              }));
            } catch (error) {
              const errorMessage = getAxiosErrorMessage(
                error,
                'Failed to load categories'
              );
              setError('fetch', errorMessage);
              toast.error('Failed to load categories', {
                description: errorMessage,
              });
            } finally {
              setLoading('fetching', false);
            }
          },

          loadMoreCategories: async () => {
            const { pagination, query, loading } = get();
            if (!pagination?.hasMore || loading.loadingMore) return;

            setLoading('loadingMore', true);
            setError('loadMore', null);

            try {
              const loadMoreQuery = {
                ...query,
                offset: pagination.offset + pagination.limit,
              };
              const queryString = buildQueryParams(loadMoreQuery);
              const response = await axios.get(
                `/api/categories?${queryString}`
              );
              const {
                categories: newCategories,
                pagination: newPagination,
                stats: newStats,
              } = response.data;

              set((state) => {
                const allCategories = [...state.categories, ...newCategories];
                return {
                  categories: allCategories,
                  categoryMap: buildCategoryMap(allCategories),
                  pagination: newPagination,
                  stats: newStats ?? state.stats,
                };
              });
            } catch (error) {
              const errorMessage = getAxiosErrorMessage(
                error,
                'Failed to load more categories'
              );
              setError('loadMore', errorMessage);
              toast.error('Failed to load more categories');
            } finally {
              setLoading('loadingMore', false);
            }
          },

          refreshCategories: async () => {
            const currentQuery = get().query;
            await get().actions.fetchCategories(currentQuery);
          },

          createCategory: async (data) => {
            setLoading('creating', true);
            setError('create', null);

            try {
              const response = await axios.post('/api/admin/categories', data);
              const newCategory = response.data.category;

              set((state) => {
                const updatedCategories = [...state.categories, newCategory];
                return {
                  categories: updatedCategories,
                  categoryMap: buildCategoryMap(updatedCategories),
                };
              });

              toast.success('Category created successfully');
              return newCategory;
            } catch (error) {
              const errorMessage = getAxiosErrorMessage(
                error,
                'Failed to create category'
              );
              setError('create', errorMessage);
              toast.error('Failed to create category', {
                description: errorMessage,
              });
              return null;
            } finally {
              setLoading('creating', false);
            }
          },

          updateCategory: async (id, data) => {
            setLoading('updating', true);
            setError('update', null);

            try {
              const response = await axios.patch(
                `/api/admin/categories/${id}`,
                data
              );
              const updatedCategory = response.data.category;

              set((state) => {
                const updatedCategories = state.categories.map((cat) =>
                  cat._id === id ? updatedCategory : cat
                );

                return {
                  categories: updatedCategories,
                  categoryMap: buildCategoryMap(updatedCategories),
                };
              });

              toast.success('Category updated successfully');
              return updatedCategory;
            } catch (error) {
              const errorMessage = getAxiosErrorMessage(
                error,
                'Failed to update category'
              );
              setError('update', errorMessage);
              toast.error('Failed to update category', {
                description: errorMessage,
              });
              return null;
            } finally {
              setLoading('updating', false);
            }
          },

          deleteCategory: async (id) => {
            setLoading('deleting', true);
            setError('delete', null);

            try {
              await axios.delete(`/api/admin/categories/${id}`);

              set((state) => {
                const updatedCategories = state.categories.filter(
                  (cat) => cat._id !== id
                );

                return {
                  categories: updatedCategories,
                  categoryMap: buildCategoryMap(updatedCategories),
                };
              });

              toast.success('Category deleted successfully');
              return true;
            } catch (error) {
              const errorMessage = getAxiosErrorMessage(
                error,
                'Failed to delete category'
              );
              setError('delete', errorMessage);
              toast.error('Failed to delete category', {
                description: errorMessage,
              });
              return false;
            } finally {
              setLoading('deleting', false);
            }
          },

          generateSlug: (name: string) => {
            return name
              .toLowerCase()
              .trim()
              .replace(/[^\w\s-]/g, '')
              .replace(/[\s_-]+/g, '-')
              .replace(/^-+|-+$/g, '');
          },

          setQuery: (queryUpdates: Partial<typeof DEFAULT_QUERY>) => {
            const current = get().query;
            const newQuery = { ...current, ...queryUpdates };
            set({ query: newQuery });
            get().actions.fetchCategories(newQuery);
          },

          resetQuery: () => {
            set({ query: DEFAULT_QUERY });
            get().actions.fetchCategories(DEFAULT_QUERY);
          },

          clearErrors: () => {
            set(() => ({
              errors: createInitialErrors(),
            }));
          },

          reset: () => {
            set({
              categories: [],
              categoryMap: new Map(),
              stats: null,
              charts: null,
              pagination: null,
              query: DEFAULT_QUERY,
              loading: createInitialLoading(),
              errors: createInitialErrors(),
            });
          },

          getCategoryById: (id: string) => {
            return get().categoryMap.get(id);
          },
        },
      };
    }),
    { name: 'category-store' }
  )
);

// Core hooks
export const useCategories = () =>
  useCategoryStore((state) => state.categories);
export const useCategoryLoading = () =>
  useCategoryStore((state) => state.loading);
export const useCategoryErrors = () =>
  useCategoryStore((state) => state.errors);
export const useCategoryActions = () =>
  useCategoryStore((state) => state.actions);

// Loading hooks
export const useFetchLoading = () =>
  useCategoryStore((state) => state.loading.fetching);
export const useCreateLoading = () =>
  useCategoryStore((state) => state.loading.creating);
export const useUpdateLoading = () =>
  useCategoryStore((state) => state.loading.updating);
export const useDeleteLoading = () =>
  useCategoryStore((state) => state.loading.deleting);

// Specific action hooks
export const useCreateCategory = () =>
  useCategoryStore((state) => state.actions.createCategory);
export const useUpdateCategory = () =>
  useCategoryStore((state) => state.actions.updateCategory);
export const useDeleteCategory = () =>
  useCategoryStore((state) => state.actions.deleteCategory);
export const useLoadMoreCategories = () =>
  useCategoryStore((state) => state.actions.loadMoreCategories);
export const useCategoryById = (id: string) =>
  useCategoryStore((state) => state.categoryMap.get(id));
export const useParentCategories = () =>
  useCategoryStore((state) =>
    state.categories.filter(
      (cat) => cat.isActive && (!cat.parentId || cat.parentId === null)
    )
  );

// Query hooks
export const useSetQuery = () =>
  useCategoryStore((state) => state.actions.setQuery);
export const useResetQuery = () =>
  useCategoryStore((state) => state.actions.resetQuery);
export const useQuery = () => useCategoryStore((state) => state.query);
export const useGenerateSlug = () =>
  useCategoryStore((state) => state.actions.generateSlug);
export const useCategoryStats = () => useCategoryStore((state) => state.stats);
export const useCategoryPagination = () =>
  useCategoryStore((state) => state.pagination);
export const useReset = () => useCategoryStore((state) => state.actions.reset);
export const useClearErrors = () =>
  useCategoryStore((state) => state.actions.clearErrors);
export const useCharts = () => useCategoryStore((state) => state.charts);
