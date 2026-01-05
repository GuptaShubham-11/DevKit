import axios, { AxiosError } from 'axios';
import { Loading, ErrorState } from '@/types/small-types/store/common';

export const getAxiosErrorMessage = (
  error: unknown,
  fallback: string
): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: string }>;
    return axiosError.response?.data?.error || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export const createInitialLoading = (): Loading => ({
  fetching: false,
  creating: false,
  updating: false,
  deleting: false,
  loadingMore: false,
});

export const createInitialErrors = (): ErrorState => ({
  fetch: null,
  create: null,
  update: null,
  delete: null,
  loadMore: null,
});
