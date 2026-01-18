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
  totalActive: number;
  totalInactive: number;
  totalTemplates: number;
  totalClickCount: number;
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

export type Chart = {
  _id: string;
  name: string;
  icon: string;
  color: string;
  templateCount?: number;
  clickCount?: number;
};

export type Charts = {
  topByTemplates: Chart[];
  topByClicks: Chart[];
  totalClickCount: any;
};

// Tooltip Props
export type TooltipProps = {
  active?: boolean;
  payload?: {
    [key: string]: any;
  };
};

export interface CategoryState {
  categories: Category[];
  categoryMap: Map<string, Category>;
  stats: Stats | null;
  charts: Charts | null;
  pagination: Pagination | null;
  loading: Loading;
  errors: ErrorState;
  query: Query;
  actions: CategoryActions;
}
