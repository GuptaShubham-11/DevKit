import { Badge } from '@/types/shared/badge';
import { ErrorState, Loading, Pagination } from './common';

export interface Stats {
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

export interface Query {
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

export interface BadgeActions {
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

export interface BadgeState {
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
