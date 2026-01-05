import axios from 'axios';
import { toast } from 'sonner';
import { create } from 'zustand';
import { signIn, signOut } from 'next-auth/react';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { getAxiosErrorMessage } from '@/lib/small-utils/store/common';
import {
  AuthState,
  ErrorState,
  LoadingState,
  UsernameCheck,
} from '@/types/small-types/store/auth';
import {
  createInitialErrors,
  createInitialLoading,
  normalize,
} from '@/lib/small-utils/store/auth';

const useAuthStore = create<AuthState>()(
  devtools(
    subscribeWithSelector((set) => {
      const setLoading = <K extends keyof LoadingState>(
        key: K,
        value: boolean
      ) => {
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

      const resetErrors = () => {
        set({ errors: createInitialErrors() });
      };

      return {
        user: null,
        usernameCheck: null,
        suggestedUsernames: [],
        isAuthenticated: false,
        loading: createInitialLoading(),
        errors: createInitialErrors(),

        actions: {
          login: async (email, password) => {
            setLoading('logging', true);
            setError('login', null);

            try {
              const response = await signIn('credentials', {
                redirect: false,
                email: normalize(email),
                password,
              });

              setLoading('logging', false);

              if (!response || response.error) {
                const errorMessage =
                  response?.error || 'Invalid email or password.';
                setError('login', errorMessage);
                toast.error('Login failed!', { description: errorMessage });
                set({ isAuthenticated: false });
                return null;
              }

              set({
                isAuthenticated: true,
              });

              toast.success('Login successful.');
              return response;
            } catch (error) {
              const errorMessage = getAxiosErrorMessage(error, 'Login failed!');

              setLoading('logging', false);
              setError('login', errorMessage);

              toast.error('Login failed!', { description: errorMessage });
              return null;
            }
          },

          logout: async () => {
            setLoading('logout', true);
            setError('logout', null);

            try {
              await signOut({ callbackUrl: '/' });

              set({
                user: null,
                isAuthenticated: false,
              });

              setLoading('logout', false);
              toast.success('Logout successful.');
              return true;
            } catch (error) {
              const errorMessage = getAxiosErrorMessage(
                error,
                'Logout failed!'
              );

              setLoading('logout', false);
              setError('logout', errorMessage);

              toast.error('Logout failed!', { description: errorMessage });
              return false;
            }
          },

          register: async (username, email, password) => {
            setLoading('registering', true);
            setError('register', null);

            try {
              await axios.post('/api/auth/register', {
                username: normalize(username),
                email: normalize(email),
                password,
              });

              setLoading('registering', false);

              toast.success('Registration successful.', {
                description: 'Verification code sent to your email.',
              });

              return true;
            } catch (error) {
              const errorMessage = getAxiosErrorMessage(
                error,
                'Registration failed!'
              );

              setLoading('registering', false);
              setError('register', errorMessage);

              toast.error('Registration failed!', {
                description: errorMessage,
              });

              return false;
            }
          },

          verifyOtp: async (email, otp) => {
            setLoading('verifyingOtp', true);
            setError('verifyOtp', null);

            try {
              await axios.patch('/api/auth/verify-email', {
                email: normalize(email),
                otp,
              });

              setLoading('verifyingOtp', false);
              toast.success('Email verified successfully.');
              return true;
            } catch (error) {
              const errorMessage = getAxiosErrorMessage(
                error,
                'OTP verification failed!'
              );

              setLoading('verifyingOtp', false);
              setError('verifyOtp', errorMessage);

              toast.error('Verification failed!', {
                description: errorMessage,
              });

              return false;
            }
          },

          requestOtp: async (email, type) => {
            setLoading('requestingOtp', true);
            setError('requestOtp', null);

            try {
              await axios.patch('/api/auth/request-otp-email', {
                email: normalize(email),
                type,
              });

              setLoading('requestingOtp', false);

              toast.success('OTP sent.', {
                description:
                  'If an account exists, an OTP has been sent to your email.',
              });

              return true;
            } catch (error) {
              const errorMessage = getAxiosErrorMessage(
                error,
                'Failed to send OTP!'
              );

              setLoading('requestingOtp', false);
              setError('requestOtp', errorMessage);

              toast.error('Failed to send OTP!', {
                description: errorMessage,
              });

              return false;
            }
          },

          resetPassword: async (email, otp, newPassword) => {
            setLoading('resettingPassword', true);
            setError('resetPassword', null);

            try {
              await axios.put('/api/auth/reset-password', {
                email: normalize(email),
                otp,
                newPassword,
              });

              setLoading('resettingPassword', false);

              toast.success('Password reset successful.');
              return true;
            } catch (error) {
              const errorMessage = getAxiosErrorMessage(
                error,
                'Password reset failed!'
              );

              setLoading('resettingPassword', false);
              setError('resetPassword', errorMessage);

              toast.error('Password reset failed!', {
                description: errorMessage,
              });

              return false;
            }
          },

          checkUsername: async (username) => {
            const trimmed = username.trim();

            if (!trimmed) {
              set((state) => ({
                usernameCheck: null,
                errors: {
                  ...state.errors,
                  checkUsername: null,
                },
              }));
              return null;
            }

            setLoading('checkingUsername', true);
            setError('checkUsername', null);

            try {
              const response = await axios.get<UsernameCheck>(
                `/api/auth/check-username?username=${encodeURIComponent(
                  normalize(trimmed)
                )}`
              );

              const usernameCheck = response.data;

              set((state) => ({
                usernameCheck,
                loading: {
                  ...state.loading,
                  checkingUsername: false,
                },
              }));

              return usernameCheck;
            } catch (error: any) {
              const errorMessage = getAxiosErrorMessage(
                error,
                'Failed to check username'
              );

              toast.error(errorMessage);
              const usernameCheck = error?.response?.data;

              set((state) => ({
                usernameCheck,
                loading: {
                  ...state.loading,
                  checkingUsername: false,
                },
                errors: {
                  ...state.errors,
                  checkUsername: errorMessage,
                },
              }));

              return null;
            }
          },

          suggestUsernames: async () => {
            setLoading('suggestingUsernames', true);
            setError('suggestUsername', null);

            try {
              const response = await axios.get<{ usernames: string[] }>(
                '/api/auth/suggest-username'
              );

              const usernames = response.data.usernames ?? [];

              set((state) => ({
                suggestedUsernames: usernames,
                loading: {
                  ...state.loading,
                  suggestingUsernames: false,
                },
              }));

              toast.success('Username suggestions ready.');
              return usernames;
            } catch (error) {
              const errorMessage = getAxiosErrorMessage(
                error,
                'Failed to generate usernames!'
              );

              set((state) => ({
                suggestedUsernames: [],
                loading: {
                  ...state.loading,
                  suggestingUsernames: false,
                },
                errors: {
                  ...state.errors,
                  suggestUsername: errorMessage,
                },
              }));

              toast.error('Failed to generate usernames!', {
                description: errorMessage,
              });

              return [];
            }
          },

          setUser: (user) => {
            set({
              user,
              isAuthenticated: !!user,
            });
          },

          clearErrors: () => {
            resetErrors();
          },

          clearUsernameCheck: () => {
            set({ usernameCheck: null });
          },

          clearSuggestedUsernames: () => {
            set({ suggestedUsernames: [] });
          },

          reset: () => {
            set({
              user: null,
              isAuthenticated: false,
              usernameCheck: null,
              suggestedUsernames: [],
              loading: createInitialLoading(),
              errors: createInitialErrors(),
            });
          },
        },
      };
    }),
    { name: 'auth-store' }
  )
);

export const useAuthStoreBase = useAuthStore;

// Core selectors
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useUsernameCheck = () =>
  useAuthStore((state) => state.usernameCheck);
export const useSuggestedUsernames = () =>
  useAuthStore((state) => state.suggestedUsernames);
export const useAuthErrors = () => useAuthStore((state) => state.errors);
export const useAuthLoading = () => useAuthStore((state) => state.loading);
export const useAuthActions = () => useAuthStore((state) => state.actions);

// Specific actions
export const useLogin = () => useAuthStore((state) => state.actions.login);
export const useLogout = () => useAuthStore((state) => state.actions.logout);
export const useRegister = () =>
  useAuthStore((state) => state.actions.register);
export const useVerifyOtp = () =>
  useAuthStore((state) => state.actions.verifyOtp);
export const useRequestOtp = () =>
  useAuthStore((state) => state.actions.requestOtp);
export const useResetPassword = () =>
  useAuthStore((state) => state.actions.resetPassword);
export const useCheckUsername = () =>
  useAuthStore((state) => state.actions.checkUsername);
export const useClearUsernameCheck = () =>
  useAuthStore((state) => state.actions.clearUsernameCheck);
export const useSuggestUsernames = () =>
  useAuthStore((state) => state.actions.suggestUsernames);

// Specific loading selectors
export const useLoginLoading = () =>
  useAuthStore((state) => state.loading.logging);
export const useRegisterLoading = () =>
  useAuthStore((state) => state.loading.registering);
export const useVerifyOtpLoading = () =>
  useAuthStore((state) => state.loading.verifyingOtp);
export const useRequestOtpLoading = () =>
  useAuthStore((state) => state.loading.requestingOtp);
export const useResetPasswordLoading = () =>
  useAuthStore((state) => state.loading.resettingPassword);
export const useCheckUsernameLoading = () =>
  useAuthStore((state) => state.loading.checkingUsername);
export const useSuggestUsernamesLoading = () =>
  useAuthStore((state) => state.loading.suggestingUsernames);

// Specific error selectors
export const useLoginError = () => useAuthStore((state) => state.errors.login);
export const useRegisterError = () =>
  useAuthStore((state) => state.errors.register);
export const useVerifyOtpError = () =>
  useAuthStore((state) => state.errors.verifyOtp);
export const useRequestOtpError = () =>
  useAuthStore((state) => state.errors.requestOtp);
export const useResetPasswordError = () =>
  useAuthStore((state) => state.errors.resetPassword);
export const useCheckUsernameError = () =>
  useAuthStore((state) => state.errors.checkUsername);
export const useSuggestUsernameError = () =>
  useAuthStore((state) => state.errors.suggestUsername);

// Computed selectors
export const useUserProfile = () => useAuthStore((state) => state.user);
export const useUserEmail = () => useAuthStore((state) => state.user?.email);
// export const useUsername = () => useAuthStore((state) => state.user?.username);
// export const useIsAdmin = () =>
//   useAuthStore((state) => state.user?.isAdmin === true);
// export const useIsVerified = () =>
//   useAuthStore((state) => state.user?.isVerified ?? false);

// Username availability selectors
export const useUsernameMessage = () =>
  useAuthStore((state) => state.usernameCheck?.message);
export const useIsUsernameAvailable = () =>
  useAuthStore((state) => state.usernameCheck?.available);
