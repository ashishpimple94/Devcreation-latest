import type { ApiEnvelope } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://lightseagreen-donkey-692988.hostingersite.com/api';

const ACCESS_TOKEN_KEY = 'dc_access_token';

/** In-memory + localStorage access token store (client only). */
export const tokenStore = {
  get(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  set(token: string) {
    if (typeof window !== 'undefined') window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  clear() {
    if (typeof window !== 'undefined') window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
};

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  auth?: boolean;
  /** Set to true to skip the automatic refresh-retry (used by refresh itself). */
  skipRefresh?: boolean;
}

let refreshPromise: Promise<boolean> | null = null;

/** Attempts to refresh the access token using the httpOnly refresh cookie. */
async function tryRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        if (!res.ok) return false;
        const json = (await res.json()) as ApiEnvelope<{ accessToken: string }>;
        tokenStore.set(json.data.accessToken);
        return true;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

/**
 * Core fetch wrapper. Attaches the bearer token, unwraps the API envelope, and
 * transparently retries once after refreshing an expired access token.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<ApiEnvelope<T>> {
  const { body, auth = true, skipRefresh = false, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (auth) {
    const token = tokenStore.get();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth && !skipRefresh) {
    const refreshed = await tryRefresh();
    if (refreshed) return apiRequest<T>(path, { ...options, skipRefresh: true });
  }

  let json: ApiEnvelope<T>;
  try {
    json = (await res.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiError(res.status, res.statusText || 'Request failed');
  }

  if (!res.ok || !json.success) {
    throw new ApiError(res.status, json.message || 'Request failed', json.error);
  }
  return json;
}

/** Multipart upload helper for product images. */
export async function apiUpload<T>(path: string, formData: FormData): Promise<ApiEnvelope<T>> {
  const token = tokenStore.get();
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
  const json = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || !json.success) {
    throw new ApiError(res.status, json.message || 'Upload failed', json.error);
  }
  return json;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => apiRequest<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'PUT', body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'DELETE' }),
};
