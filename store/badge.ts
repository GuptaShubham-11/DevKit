import axios from 'axios';
import { toast } from 'sonner';
import { create } from 'zustand';
import { Badge } from '@/types/shared/badge';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { ErrorState, Loading } from '@/types/small-types/store/common';
import {
  BadgeCategory,
  BadgeRarity,
  BadgeState,
  Query,
} from '@/types/small-types/store/badge';
import {
  createInitialErrors,
  createInitialLoading,
  getAxiosErrorMessage,
} from '@/lib/small-utils/store/common';
import {
  buildBadgeMap,
  buildBadgesByCategory,
  buildBadgesByRarity,
  buildQueryParams,
  DEFAULT_QUERY,
} from '@/lib/small-utils/store/badge';

const useBadgeStore = create<BadgeState>()(
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
        badges: [],
        badgeMap: new Map(),
        badgesByCategory: new Map(),
        badgesByRarity: new Map(),
        featuredBadges: [],
        stats: null,
        pagination: null,
        loading: createInitialLoading(),
        errors: createInitialErrors(),
        query: DEFAULT_QUERY,

        actions: {
          fetchBadges: async (queryUpdates = {}) => {
            const mergedQuery: Query = {
              ...get().query,
              ...queryUpdates,
              offset: 0,
            };
            set({ query: mergedQuery });

            setLoading('fetching', true);
            setError('fetch', null);

            try {
              const queryString = buildQueryParams(mergedQuery);
              const response = await axios.get(`/api/badges?${queryString}`);

              const { badges, pagination, stats, badgesByCategory } =
                response.data.data;

              set((state) => ({
                badges,
                badgeMap: buildBadgeMap(badges),
                badgesByCategory:
                  badgesByCategory ?? buildBadgesByCategory(badges),
                badgesByRarity: buildBadgesByRarity(badges),
                pagination,
                stats: stats ?? state.stats,
              }));
            } catch (error) {
              const errorMessage = getAxiosErrorMessage(
                error,
                'Failed to load badges'
              );
              setError('fetch', errorMessage);
              toast.error('Failed to load badges', {
                description: errorMessage,
              });
            } finally {
              setLoading('fetching', false);
            }
          },

          loadMoreBadges: async () => {
            const { pagination, query, loading } = get();
            if (!pagination?.hasMore || loading.loadingMore) return;

            setLoading('loadingMore', true);
            setError('loadMore', null);

            try {
              const loadMoreQuery: Query = {
                ...query,
                offset: pagination.offset + pagination.limit,
              };
              const queryString = buildQueryParams(loadMoreQuery);

              const response = await axios.get(`/api/badges?${queryString}`);
              const { badges: newBadges, pagination: newPagination } =
                response.data.data;

              set((state) => {
                const allBadges = [...state.badges, ...newBadges];
                return {
                  badges: allBadges,
                  badgeMap: buildBadgeMap(allBadges),
                  badgesByCategory: buildBadgesByCategory(allBadges),
                  badgesByRarity: buildBadgesByRarity(allBadges),
                  pagination: newPagination,
                };
              });
            } catch (error) {
              const errorMessage = getAxiosErrorMessage(
                error,
                'Failed to load more badges'
              );
              setError('loadMore', errorMessage);
              toast.error('Failed to load more badges', {
                description: errorMessage,
              });
            } finally {
              setLoading('loadingMore', false);
            }
          },

          refreshBadges: async () => {
            const currentQuery = get().query;
            await get().actions.fetchBadges(currentQuery);
          },

          createBadge: async (data) => {
            setLoading('creating', true);
            setError('create', null);

            try {
              const response = await axios.post('/api/admin/badges', data);
              const newBadge: Badge = response.data.badge;

              set((state) => {
                const updatedBadges = [...state.badges, newBadge];
                return {
                  badges: updatedBadges,
                  badgeMap: buildBadgeMap(updatedBadges),
                  badgesByCategory: buildBadgesByCategory(updatedBadges),
                  badgesByRarity: buildBadgesByRarity(updatedBadges),
                };
              });

              toast.success('Badge created successfully.');
              return newBadge;
            } catch (error) {
              const errorMessage = getAxiosErrorMessage(
                error,
                'Failed to create badge'
              );
              setError('create', errorMessage);
              toast.error('Failed to create badge', {
                description: errorMessage,
              });
              return null;
            } finally {
              setLoading('creating', false);
            }
          },

          updateBadge: async (id, data) => {
            setLoading('updating', true);
            setError('update', null);

            try {
              const response = await axios.patch(
                `/api/admin/badges/${id}`,
                data
              );
              const updatedBadge: Badge = response.data.badge;

              set((state) => {
                const updatedBadges = state.badges.map((badge) =>
                  badge._id === id ? updatedBadge : badge
                );
                return {
                  badges: updatedBadges,
                  badgeMap: buildBadgeMap(updatedBadges),
                  badgesByCategory: buildBadgesByCategory(updatedBadges),
                  badgesByRarity: buildBadgesByRarity(updatedBadges),
                };
              });

              toast.success('Badge updated successfully.');
              return updatedBadge;
            } catch (error) {
              const errorMessage = getAxiosErrorMessage(
                error,
                'Failed to update badge'
              );
              setError('update', errorMessage);
              toast.error('Failed to update badge', {
                description: errorMessage,
              });
              return null;
            } finally {
              setLoading('updating', false);
            }
          },

          deleteBadge: async (id) => {
            setLoading('deleting', true);
            setError('delete', null);

            try {
              await axios.delete(`/api/admin/badges/${id}`);

              set((state) => {
                const updatedBadges = state.badges.filter(
                  (badge) => badge._id !== id
                );
                return {
                  badges: updatedBadges,
                  badgeMap: buildBadgeMap(updatedBadges),
                  badgesByCategory: buildBadgesByCategory(updatedBadges),
                  badgesByRarity: buildBadgesByRarity(updatedBadges),
                };
              });

              toast.success('Badge deleted successfully.');
              return true;
            } catch (error) {
              const errorMessage = getAxiosErrorMessage(
                error,
                'Failed to delete badge'
              );
              setError('delete', errorMessage);
              toast.error('Failed to delete badge', {
                description: errorMessage,
              });
              return false;
            } finally {
              setLoading('deleting', false);
            }
          },

          setQuery: (queryUpdates) => {
            set((state) => ({
              query: { ...state.query, ...queryUpdates },
            }));
            void get().actions.fetchBadges(queryUpdates);
          },

          resetQuery: () => {
            set({ query: DEFAULT_QUERY });
            void get().actions.fetchBadges();
          },

          clearErrors: () => {
            set({ errors: createInitialErrors() });
          },

          reset: () => {
            set({
              badges: [],
              badgeMap: new Map(),
              badgesByCategory: new Map(),
              badgesByRarity: new Map(),
              featuredBadges: [],
              stats: null,
              pagination: null,
              query: DEFAULT_QUERY,
              loading: createInitialLoading(),
              errors: createInitialErrors(),
            });
          },

          getBadgeById: (id) => get().badgeMap.get(id),

          getBadgesByCategory: (category) =>
            get().badgesByCategory.get(category) || [],

          getBadgesByRarity: (rarity) => get().badgesByRarity.get(rarity) || [],

          getActiveBadges: () => get().badges.filter((badge) => badge.isActive),

          searchBadges: (searchTerm) => {
            const normalizedSearch = searchTerm.toLowerCase().trim();
            if (!normalizedSearch) return get().badges;

            return get().badges.filter((badge) => {
              const name = badge.name.toLowerCase();
              const description = badge.description?.toLowerCase() ?? '';
              const category = badge.category?.toLowerCase() ?? '';
              return (
                name.includes(normalizedSearch) ||
                description.includes(normalizedSearch) ||
                category.includes(normalizedSearch)
              );
            });
          },
        },
      };
    }),
    { name: 'badge-store' }
  )
);

// Loading selectors
export const useFetchLoading = () =>
  useBadgeStore((state) => state.loading.fetching);
export const useCreateLoading = () =>
  useBadgeStore((state) => state.loading.creating);
export const useUpdateLoading = () =>
  useBadgeStore((state) => state.loading.updating);
export const useDeleteLoading = () =>
  useBadgeStore((state) => state.loading.deleting);
export const useLoadMoreLoading = () =>
  useBadgeStore((state) => state.loading.loadingMore);

// Error selectors
export const useFetchError = () => useBadgeStore((state) => state.errors.fetch);
export const useCreateError = () =>
  useBadgeStore((state) => state.errors.create);
export const useUpdateError = () =>
  useBadgeStore((state) => state.errors.update);
export const useDeleteError = () =>
  useBadgeStore((state) => state.errors.delete);
export const useLoadMoreError = () =>
  useBadgeStore((state) => state.errors.loadMore);

// Core selectors
export const useBadges = () => useBadgeStore((state) => state.badges);
export const useBadgeErrors = () => useBadgeStore((state) => state.errors);
export const useBadgeLoading = () => useBadgeStore((state) => state.loading);
export const useBadgeActions = () => useBadgeStore((state) => state.actions);

// Specific selectors
export const useBadgeQuery = () => useBadgeStore((state) => state.query);
export const useBadgeStats = () => useBadgeStore((state) => state.stats);
export const useBadgeMap = () => useBadgeStore((state) => state.badgeMap);
export const useBadgePagination = () =>
  useBadgeStore((state) => state.pagination);

export const useCreateBadge = () =>
  useBadgeStore((state) => state.actions.createBadge);
export const useUpdateBadge = () =>
  useBadgeStore((state) => state.actions.updateBadge);
export const useDeleteBadge = () =>
  useBadgeStore((state) => state.actions.deleteBadge);
export const useRefreshBadges = () =>
  useBadgeStore((state) => state.actions.refreshBadges);
export const useFetchBadges = () =>
  useBadgeStore((state) => state.actions.fetchBadges);
export const useLoadMoreBadges = () =>
  useBadgeStore((state) => state.actions.loadMoreBadges);
export const useSetQuery = () =>
  useBadgeStore((state) => state.actions.setQuery);
export const useResetQuery = () =>
  useBadgeStore((state) => state.actions.resetQuery);

export const useFeaturedBadges = () =>
  useBadgeStore((state) => state.featuredBadges);
export const useBadgesByRarity = () =>
  useBadgeStore((state) => state.badgesByRarity);
export const useBadgesByCategory = () =>
  useBadgeStore((state) => state.badgesByCategory);

export const useBadgeById = (id: string) =>
  useBadgeStore((state) => state.badgeMap.get(id));
export const useBadgesCount = () =>
  useBadgeStore((state) => state.badges.length);
export const useActiveBadges = () =>
  useBadgeStore((state) => state.badges.filter((badge) => badge.isActive));
export const useActiveBadgesCount = () =>
  useBadgeStore(
    (state) => state.badges.filter((badge) => badge.isActive).length
  );
export const useBadgesByRaritySelector = (rarity: BadgeRarity) =>
  useBadgeStore((state) => state.badgesByRarity.get(rarity) || []);
export const useBadgesByCategorySelector = (category: BadgeCategory) =>
  useBadgeStore((state) => state.badgesByCategory.get(category) || []);

export const useBadgeSearch = (searchTerm: string) =>
  useBadgeStore((state) => {
    const normalized = searchTerm.toLowerCase().trim();
    if (!normalized) return state.badges;
    return state.badges.filter((badge) => {
      const name = badge.name.toLowerCase();
      const description = badge.description?.toLowerCase() ?? '';
      const category = badge.category?.toLowerCase() ?? '';
      return (
        name.includes(normalized) ||
        description.includes(normalized) ||
        category.includes(normalized)
      );
    });
  });

export const useRecentBadges = (days = 7) =>
  useBadgeStore((state) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return state.badges.filter((badge) => new Date(badge.createdAt) > cutoff);
  });
