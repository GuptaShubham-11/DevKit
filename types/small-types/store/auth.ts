import { User } from 'next-auth';
import { SignInResponse } from 'next-auth/react';

export interface UsernameCheck {
  message: string;
  available: boolean;
}

export interface LoadingState {
  logout: boolean;
  logging: boolean;
  registering: boolean;
  verifyingOtp: boolean;
  requestingOtp: boolean;
  resettingPassword: boolean;
  checkingUsername: boolean;
  suggestingUsernames: boolean;
}

export interface ErrorState {
  login: string | null;
  logout: string | null;
  register: string | null;
  verifyOtp: string | null;
  requestOtp: string | null;
  resetPassword: string | null;
  checkUsername: string | null;
  suggestUsername: string | null;
}

export interface AuthActions {
  // Authentication
  login: (email: string, password: string) => Promise<SignInResponse | null>;
  logout: () => Promise<boolean>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;

  // Password Reset
  requestOtp: (
    email: string,
    type: 'register' | 'resetPassword'
  ) => Promise<boolean>;
  resetPassword: (
    email: string,
    otp: string,
    newPassword: string
  ) => Promise<boolean>;

  // Username Management
  checkUsername: (username: string) => Promise<UsernameCheck | null>;
  suggestUsernames: () => Promise<string[]>;

  // State Management
  setUser: (user: User | null) => void;
  clearErrors: () => void;
  clearUsernameCheck: () => void;
  clearSuggestedUsernames: () => void;
  reset: () => void;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  suggestedUsernames: string[];
  usernameCheck: UsernameCheck | null;
  loading: LoadingState;
  errors: ErrorState;
  actions: AuthActions;
}
