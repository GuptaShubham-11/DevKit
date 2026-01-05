import { Badge } from '@/types/shared/badge';
import { Query } from '@/types/small-types/store/badge';

export const DEFAULT_QUERY: Query = {
  includeInactive: false,
  sort: 'createdAt',
  order: 'desc',
  limit: 20,
  offset: 0,
  includeStats: false,
};

export const buildBadgeMap = (badges: Badge[]): Map<string, Badge> =>
  new Map(badges.map((badge) => [badge._id, badge]));

export const buildBadgesByCategory = (
  badges: Badge[]
): Map<string, Badge[]> => {
  const categoryMap = new Map<string, Badge[]>();

  badges.forEach((badge) => {
    const category = badge.category || 'uncategorized';
    const list = categoryMap.get(category) ?? [];
    list.push(badge);
    categoryMap.set(category, list);
  });

  return categoryMap;
};

export const buildBadgesByRarity = (badges: Badge[]): Map<string, Badge[]> => {
  const rarityMap = new Map<string, Badge[]>();

  badges.forEach((badge) => {
    const list = rarityMap.get(badge.rarityLevel) ?? [];
    list.push(badge);
    rarityMap.set(badge.rarityLevel, list);
  });

  return rarityMap;
};

export const buildQueryParams = (query: Query | Partial<Query>): string => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });
  return params.toString();
};
