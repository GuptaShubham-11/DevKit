import { Category } from '@/types/shared/category';
import { ErrorState, Loading, Pagination } from './common';

export type Query = {
  parentId?: string;
  includeInactive: boolean;
  search?: string;
  sort: 'name' | 'createdAt' | 'sortOrder' | 'templateCount' | 'clickCount';
  order: 'asc' | 'desc';
  limit: number;
  offset: number;
  includeStats: boolean;
  treeStructure: string;
  onlyWithTemplates: boolean;
};

export type Stats = {
  totalCategories: number;
  activeCategories: number;
  totalTemplates: number;
  totalClicks: number;
  avgSortOrder: number;
};

export type CategoryActions = {
  fetchCategories: (query?: Partial<Query>) => Promise<void>;
  loadMoreCategories: () => Promise<void>;
  refreshCategories: () => Promise<void>;

  createCategory: (data: any) => Promise<Category | null>;
  updateCategory: (id: string, data: any) => Promise<Category | null>;
  deleteCategory: (id: string) => Promise<boolean>;
  generateSlug: (name: string) => string;

  setQuery: (query: Partial<Query>) => void;
  resetQuery: () => void;

  clearErrors: () => void;
  reset: () => void;

  getCategoryById: (id: string) => Category | undefined;
};

export interface CategoryState {
  categories: Category[];
  categoryMap: Map<string, Category>;
  stats: Stats | null;
  pagination: Pagination | null;
  loading: Loading;
  errors: ErrorState;
  query: Query;
  actions: CategoryActions;
}
