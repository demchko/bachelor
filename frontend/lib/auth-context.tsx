'use client';

import { createContext, useContext, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api, User } from './api';
import { useAuthStore } from './store/auth';

const REFRESH_TOKEN_KEY = 'refreshToken';

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<{ message: string }>;
  verifyEmail: (email: string, token: string) => Promise<{ message: string }>;
  resendVerification: (email: string) => Promise<{ message: string }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, accessToken, isLoading, setAuth, setLoading, clearAuth } =
    useAuthStore();

  // Keep a ref so mutation callbacks always see the latest token
  const tokenRef = useRef<string | null>(null);
  tokenRef.current = accessToken;

  // Restore session on mount
  useEffect(() => {
    const stored = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!stored) {
      setLoading(false);
      return;
    }
    api
      .refresh(stored)
      .then(async (tokens) => {
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
        const me = await api.me(tokens.accessToken);
        setAuth(me, tokens.accessToken);
      })
      .catch(() => localStorage.removeItem(REFRESH_TOKEN_KEY))
      .finally(() => setLoading(false));
  }, [setAuth, setLoading]);

  const loginMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const tokens = await api.login(email, password);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
      const me = await api.me(tokens.accessToken);
      return { me, tokens };
    },
    onSuccess: ({ me, tokens }) => setAuth(me, tokens.accessToken),
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const token = tokenRef.current;
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      clearAuth();
      tokenRef.current = null;
      if (token) await api.logout(token).catch(() => {});
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.register(email, password),
  });

  const verifyEmailMutation = useMutation({
    mutationFn: ({ email, token }: { email: string; token: string }) =>
      api.verifyEmail(email, token),
  });

  const resendVerificationMutation = useMutation({
    mutationFn: ({ email }: { email: string }) =>
      api.resendVerification(email),
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        login: (email, password) =>
          loginMutation.mutateAsync({ email, password }).then(() => {}),
        logout: () => logoutMutation.mutateAsync(),
        register: (email, password) =>
          registerMutation.mutateAsync({ email, password }),
        verifyEmail: (email, token) =>
          verifyEmailMutation.mutateAsync({ email, token }),
        resendVerification: (email) =>
          resendVerificationMutation.mutateAsync({ email }),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
