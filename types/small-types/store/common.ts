export interface Loading {
  fetching: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  loadingMore: boolean;
}

export interface ErrorState {
  fetch: string | null;
  create: string | null;
  update: string | null;
  delete: string | null;
  loadMore: string | null;
}

export interface Pagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  totalPages: number;
  currentPage: number;
}
