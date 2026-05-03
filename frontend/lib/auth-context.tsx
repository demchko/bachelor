'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { api, User } from './api';

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
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Keep a ref so callbacks always see the latest token without re-creating
  const tokenRef = useRef<string | null>(null);
  tokenRef.current = accessToken;

  const applyTokens = useCallback(
    (tokens: { accessToken: string; refreshToken: string }) => {
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
      setAccessToken(tokens.accessToken);
      tokenRef.current = tokens.accessToken;
    },
    [],
  );

  const clearAuth = useCallback(() => {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setAccessToken(null);
    setUser(null);
    tokenRef.current = null;
  }, []);

  // Restore session on mount
  useEffect(() => {
    const stored = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!stored) {
      setIsLoading(false);
      return;
    }
    api
      .refresh(stored)
      .then(async (tokens) => {
        applyTokens(tokens);
        const me = await api.me(tokens.accessToken);
        setUser(me);
      })
      .catch(() => localStorage.removeItem(REFRESH_TOKEN_KEY))
      .finally(() => setIsLoading(false));
  }, [applyTokens]);

  const login = useCallback(
    async (email: string, password: string) => {
      const tokens = await api.login(email, password);
      applyTokens(tokens);
      const me = await api.me(tokens.accessToken);
      setUser(me);
    },
    [applyTokens],
  );

  const logout = useCallback(async () => {
    const token = tokenRef.current;
    clearAuth();
    if (token) {
      await api.logout(token).catch(() => {});
    }
  }, [clearAuth]);

  const register = useCallback(
    (email: string, password: string) => api.register(email, password),
    [],
  );

  const verifyEmail = useCallback(
    (email: string, token: string) => api.verifyEmail(email, token),
    [],
  );

  const resendVerification = useCallback(
    (email: string) => api.resendVerification(email),
    [],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        login,
        logout,
        register,
        verifyEmail,
        resendVerification,
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
