import { Category } from '@/types/shared/category';
import { Query } from '@/types/small-types/store/category';

export const DEFAULT_QUERY: Query = {
  includeInactive: false,
  sort: 'createdAt',
  order: 'asc',
  limit: 20,
  offset: 0,
  includeStats: true,
  treeStructure: 'false',
  onlyWithTemplates: false,
};

export const buildCategoryMap = (
  categories: Category[]
): Map<string, Category> => {
  return new Map(categories.map((cat) => [cat._id, cat]));
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
