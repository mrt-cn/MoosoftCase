import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Product, ProductPayload } from '@/api/types';
import { isLocalId, type LocalChanges } from '@/lib/merge';
import { storage } from '@/lib/storage';

/**
 * DummyJSON CRUD simülasyonu için "overlay" store.
 * API verisi salt-okunur kabul edilir; tüm lokal create/update/delete
 * farkları burada tutulur ve `mergeProductList` ile birleştirilir.
 */
interface LocalChangesState extends LocalChanges {
  hasHydrated: boolean;
  /** Lokal ürün ekler ve oluşturulan negatif id'yi döndürür. */
  addProduct: (payload: ProductPayload) => Product;
  patchProduct: (id: number, patch: ProductPayload) => void;
  deleteProduct: (id: number) => void;
  setHasHydrated: (value: boolean) => void;
}

export const useLocalChangesStore = create<LocalChangesState>()(
  persist(
    (set) => ({
      added: [],
      updated: {},
      deleted: [],
      hasHydrated: false,

      addProduct: (payload) => {
        const product: Product = {
          id: -Date.now(),
          title: payload.title,
          description: payload.description ?? '',
          price: payload.price,
          category: payload.category,
          thumbnail: payload.thumbnail ?? '',
        };
        set((state) => ({ added: [product, ...state.added] }));
        return product;
      },

      patchProduct: (id, patch) =>
        set((state) => {
          // Lokal eklenen ürün: doğrudan added dizisinde güncellenir (API'de yok).
          if (isLocalId(id)) {
            return {
              added: state.added.map((product) =>
                product.id === id ? { ...product, ...patch } : product,
              ),
            };
          }
          // API ürünü: yama updated haritasına yazılır.
          return { updated: { ...state.updated, [id]: patch } };
        }),

      deleteProduct: (id) =>
        set((state) => {
          const restUpdated = { ...state.updated };
          delete restUpdated[id];

          // Lokal eklenen ürün: overlay'den tamamen kaldırılır (API'de yok).
          if (isLocalId(id)) {
            return {
              added: state.added.filter((product) => product.id !== id),
              updated: restUpdated,
            };
          }
          // API ürünü: silinenler listesine eklenir, böylece merge onu gizler.
          return {
            deleted: state.deleted.includes(id) ? state.deleted : [...state.deleted, id],
            updated: restUpdated,
          };
        }),

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'local-changes-storage',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        added: state.added,
        updated: state.updated,
        deleted: state.deleted,
      }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);

/** Merge fonksiyonlarına verilecek düz veri anlık görüntüsü. */
export const selectLocalChanges = (state: LocalChangesState): LocalChanges => ({
  added: state.added,
  updated: state.updated,
  deleted: state.deleted,
});
