import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { storage } from '@/lib/storage';

/**
 * Favoriler yalnızca ürün ID listesi olarak saklanır (case şartı).
 * Ürün objesi tutulmaz → tek doğruluk kaynağı korunur, bayat veri riski olmaz.
 * MMKV/AsyncStorage persist sayesinde uygulama yeniden başlatılınca korunur.
 */
interface FavoritesState {
  favoriteIds: number[];
  hasHydrated: boolean;
  toggle: (id: number) => void;
  remove: (id: number) => void;
  setHasHydrated: (value: boolean) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      favoriteIds: [],
      hasHydrated: false,
      toggle: (id) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.includes(id)
            ? state.favoriteIds.filter((favoriteId) => favoriteId !== id)
            : [id, ...state.favoriteIds],
        })),
      remove: (id) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.filter((favoriteId) => favoriteId !== id),
        })),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({ favoriteIds: state.favoriteIds }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);

/** Belirli bir ürünün favori olup olmadığını izleyen seçici hook. */
export const useIsFavorite = (id: number): boolean =>
  useFavoritesStore((state) => state.favoriteIds.includes(id));
