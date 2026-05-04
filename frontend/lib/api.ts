/**
 * Browser: same-origin `/api` → proxied by Next (see `next.config.ts`) to the Nest backend.
 * Override with NEXT_PUBLIC_API_URL if the API is on another host.
 * Server (SSR): direct URL to backend.
 */
function getApiBase(): string {
  const explicit = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (explicit) return explicit;

  if (typeof window !== 'undefined') {
    return '/api';
  }

  return process.env.INTERNAL_API_URL?.replace(/\/$/, '') ?? 'http://127.0.0.1:3000/api';
}

function parseNestErrorBody(body: unknown, status: number): string {
  if (body && typeof body === 'object') {
    const o = body as Record<string, unknown>;
    if (typeof o.message === 'string' && o.message.length) return o.message;
    if (Array.isArray(o.message) && o.message.length) return String(o.message[0]);
  }
  return `Помилка сервера (HTTP ${status})`;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${getApiBase()}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const contentType = res.headers.get('content-type') ?? '';

  if (!res.ok) {
    if (contentType.includes('application/json')) {
      const body: unknown = await res.json().catch(() => ({}));
      throw new Error(parseNestErrorBody(body, res.status));
    }
    const text = await res.text().catch(() => '');
    throw new Error(text.trim().slice(0, 200) || `Помилка сервера (HTTP ${res.status})`);
  }

  if (res.status === 204) return undefined as T;
  if (!contentType.includes('application/json')) {
    throw new Error('Сервер повернув не JSON. Перевірте URL API (NEXT_PUBLIC_API_URL / проксі).');
  }
  return res.json() as Promise<T>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
}

export const api = {
  register: (email: string, password: string) =>
    request<{ message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  verifyEmail: (email: string, token: string) =>
    request<{ message: string }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, token }),
    }),

  resendVerification: (email: string) =>
    request<{ message: string }>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  forgotPassword: (email: string) =>
    request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (email: string, token: string, password: string) =>
    request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, token, password }),
    }),

  login: (email: string, password: string) =>
    request<AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  refresh: (refreshToken: string) =>
    request<AuthTokens>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  logout: (accessToken: string) =>
    request<void>('/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  me: (accessToken: string) =>
    request<User>('/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
};
