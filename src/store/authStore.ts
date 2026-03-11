import {create} from 'zustand';
import {storage} from '@/services/storage';
import type {AuthUser} from '@/types/api';

const TOKEN_KEY = 'AUTH_TOKENS';

interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  hydrated: boolean;
  setAuth: (accessToken: string, refreshToken: string, user: AuthUser) => void;
  logout: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  hydrated: false,

  setAuth: (accessToken, refreshToken, user) => {
    set({accessToken, refreshToken, user});
    storage.set(TOKEN_KEY, {accessToken, refreshToken, user});
  },

  logout: () => {
    set({accessToken: null, refreshToken: null, user: null});
    storage.remove(TOKEN_KEY);
  },

  hydrate: async () => {
    if (get().hydrated) return;
    const tokens = await storage.get<StoredTokens>(TOKEN_KEY);
    if (tokens) {
      set({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: tokens.user,
      });
    }
    set({hydrated: true});
  },
}));
