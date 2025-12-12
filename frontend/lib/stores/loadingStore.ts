import { create } from 'zustand';

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

interface LoadingStore {
  loading: Map<string, LoadingState>;
  setLoading: (key: string, isLoading: boolean, message?: string) => void;
  getLoading: (key: string) => boolean;
  isAnyLoading: () => boolean;
  clearLoading: (key: string) => void;
  clearAllLoading: () => void;
}

export const useLoadingStore = create<LoadingStore>((set, get) => ({
  loading: new Map(),

  setLoading: (key: string, isLoading: boolean, message?: string) => {
    set((state) => {
      const newLoading = new Map(state.loading);
      if (isLoading) {
        newLoading.set(key, { isLoading: true, message });
      } else {
        newLoading.delete(key);
      }
      return { loading: newLoading };
    });
  },

  getLoading: (key: string) => {
    const state = get();
    return state.loading.get(key)?.isLoading ?? false;
  },

  isAnyLoading: () => {
    const state = get();
    return state.loading.size > 0;
  },

  clearLoading: (key: string) => {
    set((state) => {
      const newLoading = new Map(state.loading);
      newLoading.delete(key);
      return { loading: newLoading };
    });
  },

  clearAllLoading: () => {
    set({ loading: new Map() });
  },
}));
