import { create } from 'zustand';
import { api, tokenStore, ApiError, getApiUrl } from '@/lib/api';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  init: () => Promise<void>;
  login: (identifier: string, password: string) => Promise<void>;
  register: (input: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  isStaff: () => boolean;
}

type TokenApiResponse = { accessToken: string; refreshToken?: string };

/**
 * Attempt a silent refresh using either the httpOnly cookie (desktop) or the
 * refreshToken stored in localStorage (mobile / cross-origin fallback).
 * Returns true if new tokens were issued and stored.
 */
async function silentRefresh(): Promise<boolean> {
  try {
    const storedRefreshToken = tokenStore.getRefreshToken();
    const res = await fetch(`${getApiUrl()}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: storedRefreshToken || undefined }),
    });
    if (!res.ok) return false;
    const json = (await res.json()) as { success: boolean; data: TokenApiResponse };
    if (!json.success || !json.data?.accessToken) return false;
    tokenStore.set(json.data.accessToken, json.data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

/** Global authentication store backed by the API + access-token store. */
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: 'idle',

  async init() {
    set({ status: 'loading' });

    // 1. If we have a valid access token, verify it with /auth/me
    if (tokenStore.get()) {
      try {
        const res = await api.get<User>('/auth/me');
        set({ user: res.data, status: 'authenticated' });
        return;
      } catch {
        // Access token invalid/expired — fall through to refresh
      }
    }

    // 2. Try silent refresh (cookie on desktop, localStorage token on mobile)
    const refreshed = await silentRefresh();
    if (refreshed) {
      try {
        const res = await api.get<User>('/auth/me');
        set({ user: res.data, status: 'authenticated' });
        return;
      } catch {
        // Refresh succeeded but /me failed — clear everything
      }
    }

    // 3. Not authenticated
    tokenStore.clear();
    set({ user: null, status: 'unauthenticated' });
  },

  async login(identifier, password) {
    const res = await api.post<{ user: User; accessToken: string; refreshToken?: string }>(
      '/auth/login',
      // Send as both fields — backend accepts either
      { identifier, email: identifier, password },
      { auth: false },
    );
    tokenStore.set(res.data.accessToken, res.data.refreshToken);
    set({ user: res.data.user, status: 'authenticated' });
  },

  async register(input) {
    const res = await api.post<{ user: User; accessToken: string; refreshToken?: string }>('/auth/register', input, {
      auth: false,
    });
    tokenStore.set(res.data.accessToken, res.data.refreshToken);
    set({ user: res.data.user, status: 'authenticated' });
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      if (!(err instanceof ApiError)) throw err;
    } finally {
      tokenStore.clear();
      set({ user: null, status: 'unauthenticated' });
    }
  },

  setUser(user) {
    set({ user });
  },

  isStaff() {
    const role = get().user?.role;
    return role === 'super_admin' || role === 'admin' || role === 'manager';
  },
}));
