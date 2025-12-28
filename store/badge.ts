import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import { create } from 'zustand';
import { Badge } from '@/types/shared/badge';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

interface Loading {
  fetching: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  loadingMore: boolean;
}

interface ErrorState {
  fetch: string | null;
  create: string | null;
  update: string | null;
  delete: string | null;
  loadMore: string | null;
}

interface Pagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  totalPages: number;
  currentPage: number;
}

interface Stats {
  totalBadges: number;
  activeBadges: number;
  inactiveBadges: number;
  totalEarnedBy: number;
  categories: Array<{
    _id: string;
    count: number;
    rarities: string[];
  }>;
  rarityDistribution: Array<{
    _id: string;
    count: number;
  }>;
  averageXpBonus: number;
}

export type BadgeCategory =
  | 'creator'
  | 'community'
  | 'usage'
  | 'milestone'
  | 'special'
  | 'seasonal'
  | 'achievement';

export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

interface Query {
  category?: BadgeCategory;
  rarity?: BadgeRarity;
  search?: string;
  includeInactive: boolean;
  sort: 'name' | 'createdAt' | 'rarity' | 'category' | 'earnedBy';
  order: 'asc' | 'desc';
  limit: number;
  offset: number;
  includeStats: boolean;
}

interface BadgeActions {
  fetchBadges: (query?: Partial<Query>) => Promise<void>;
  loadMoreBadges: () => Promise<void>;
  refreshBadges: () => Promise<void>;

  createBadge: (data: Partial<Badge>) => Promise<Badge | null>;
  updateBadge: (id: string, data: Partial<Badge>) => Promise<Badge | null>;
  deleteBadge: (id: string) => Promise<boolean>;

  setQuery: (query: Partial<Query>) => void;
  resetQuery: () => void;

  clearErrors: () => void;
  reset: () => void;

  getActiveBadges: () => Badge[];
  searchBadges: (searchTerm: string) => Badge[];
  getBadgesByRarity: (rarity: BadgeRarity) => Badge[];
  getBadgeById: (id: string) => Badge | undefined;
  getBadgesByCategory: (category: BadgeCategory) => Badge[];
}

interface BadgeState {
  badges: Badge[];
  badgeMap: Map<string, Badge>;
  badgesByCategory: Map<string, Badge[]>;
  badgesByRarity: Map<string, Badge[]>;
  featuredBadges: Badge[];
  stats: Stats | null;
  pagination: Pagination | null;
  loading: Loading;
  errors: ErrorState;
  query: Query;
  actions: BadgeActions;
}

const DEFAULT_QUERY: Query = {
  includeInactive: false,
  sort: 'createdAt',
  order: 'desc',
  limit: 20,
  offset: 0,
  includeStats: false,
};

const createInitialLoading = (): Loading => ({
  fetching: false,
  creating: false,
  updating: false,
  deleting: false,
  loadingMore: false,
});

const createInitialErrors = (): ErrorState => ({
  fetch: null,
  create: null,
  update: null,
  delete: null,
  loadMore: null,
});

const getAxiosErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: string }>;
    return axiosError.response?.data?.error || fallback;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

const buildBadgeMap = (badges: Badge[]): Map<string, Badge> =>
  new Map(badges.map((badge) => [badge._id, badge]));

const buildBadgesByCategory = (badges: Badge[]): Map<string, Badge[]> => {
  const categoryMap = new Map<string, Badge[]>();

  badges.forEach((badge) => {
    const category = badge.category || 'uncategorized';
    const list = categoryMap.get(category) ?? [];
    list.push(badge);
    categoryMap.set(category, list);
  });

  return categoryMap;
};

const buildBadgesByRarity = (badges: Badge[]): Map<string, Badge[]> => {
  const rarityMap = new Map<string, Badge[]>();

  badges.forEach((badge) => {
    const list = rarityMap.get(badge.rarityLevel) ?? [];
    list.push(badge);
    rarityMap.set(badge.rarityLevel, list);
  });

  return rarityMap;
};

const buildQueryParams = (query: Query | Partial<Query>): string => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });
  return params.toString();
};

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
