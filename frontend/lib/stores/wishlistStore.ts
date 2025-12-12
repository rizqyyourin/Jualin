import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  id: string | number;
  name: string;
  price: number;
  image?: string;
  category?: string;
}

interface WishlistStore {
  items: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (itemId: string | number) => void;
  isInWishlist: (itemId: string | number) => boolean;
  clearWishlist: () => void;
  getWishlistCount: () => number;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addToWishlist: (item: WishlistItem) => {
        set((state) => {
          // Check if item already exists
          if (state.items.some((wishItem) => wishItem.id === item.id)) {
            return state;
          }
          return {
            items: [...state.items, item],
          };
        });
      },

      removeFromWishlist: (itemId: string | number) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      isInWishlist: (itemId: string | number) => {
        return get().items.some((item) => item.id === itemId);
      },

      clearWishlist: () => {
        set({ items: [] });
      },

      getWishlistCount: () => {
        return get().items.length;
      },
    }),
    {
      name: 'wishlist-store',
      version: 1,
    }
  )
);

// Convenience hook for wishlist operations
export const useWishlist = () => {
  const {
    items,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    getWishlistCount,
  } = useWishlistStore();

  return {
    items,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    getWishlistCount,
    count: getWishlistCount(),
  };
};
