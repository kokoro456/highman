import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  shopId: string | null;
  user: { sub: string; email: string; role: string } | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setShopId: (shopId: string) => void;
  setUser: (user: AuthState['user']) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      shopId: null,
      user: null,
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),
      setShopId: (shopId) => set({ shopId }),
      setUser: (user) => set({ user }),
      logout: () =>
        set({ accessToken: null, refreshToken: null, shopId: null, user: null }),
    }),
    { name: 'beauty-erp-auth' },
  ),
);
