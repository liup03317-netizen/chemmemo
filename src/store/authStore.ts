import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_emoji: string;
}

interface AuthState {
  user: Profile | null;
  login: (user: Profile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'chemmemo-auth',
    }
  )
);
