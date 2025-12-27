import { create } from 'zustand';
import { MeResponse } from '@/lib/api/types';

export const useAuthStore = create<{
  user: MeResponse['data'] | null;
  setUser: (user: MeResponse['data'] | null) => void;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
}>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  accessToken: null,
  setAccessToken: (token) => set({ accessToken: token })
}));
