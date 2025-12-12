import { create } from 'zustand';
import { User } from '@/lib/api/auth';

interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start loading

  setUser: (user: User | null) => {
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    });

    // Persist to localStorage
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
    }
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  },

  updateUser: (updates: Partial<User>) => {
    set((state) => {
      if (!state.user) return state;

      const updatedUser = { ...state.user, ...updates };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      return { user: updatedUser };
    });
  },
}));
