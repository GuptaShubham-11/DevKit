import { ErrorState, LoadingState } from '@/types/small-types/store/auth';

export const createInitialLoading = (): LoadingState => ({
  logout: false,
  logging: false,
  registering: false,
  verifyingOtp: false,
  requestingOtp: false,
  resettingPassword: false,
  checkingUsername: false,
  suggestingUsernames: false,
});

export const createInitialErrors = (): ErrorState => ({
  login: null,
  logout: null,
  register: null,
  verifyOtp: null,
  requestOtp: null,
  resetPassword: null,
  checkUsername: null,
  suggestUsername: null,
});

export const normalize = (value: string) => value.trim().toLowerCase();
