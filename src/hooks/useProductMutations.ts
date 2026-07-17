import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ApiError } from '@/api/client';
import {
  createProduct as createProductApi,
  deleteProduct as deleteProductApi,
  updateProduct as updateProductApi,
} from '@/api/products.api';
import type { Product, ProductPayload } from '@/api/types';
import { isLocalId } from '@/lib/merge';
import { useFavoritesStore } from '@/store/favorites.store';
import { useLocalChangesStore } from '@/store/localChanges.store';
import { toast } from '@/utils/toast';

import { queryKeys } from './queryKeys';

function messageOf(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

/**
 * Ürün CRUD mutation'ları.
 *
 * Akış her işlemde aynı: (1) doğru API isteğini gönder, (2) sonucu lokal
 * overlay'e yaz ki UI'da anında ve kalıcı görünsün, (3) kullanıcıya geri bildir.
 * Lokal (negatif id) ürünler için API isteği atlanır — sunucuda olmadıkları için
 * 404 döner. Silme işlemi ayrıca ürünü favorilerden de düşürür.
 */
export function useProductMutations() {
  const queryClient = useQueryClient();
  const addLocal = useLocalChangesStore((state) => state.addProduct);
  const patchLocal = useLocalChangesStore((state) => state.patchProduct);
  const deleteLocal = useLocalChangesStore((state) => state.deleteProduct);
  const removeFavorite = useFavoritesStore((state) => state.remove);

  const invalidateProducts = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.products.all });

  const create = useMutation({
    mutationFn: (payload: ProductPayload) => createProductApi(payload),
    onSuccess: (_response, payload) => {
      // API sahte/çakışabilecek bir id döndürür; biz negatif id ile lokal saklarız.
      addLocal(payload);
      toast.success('Ürün başarıyla eklendi.');
    },
    onError: (error) => toast.error(messageOf(error, 'Ürün eklenemedi.')),
  });

  const update = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: ProductPayload }) => {
      if (!isLocalId(id)) {
        await updateProductApi(id, payload);
      }
      return { id, payload };
    },
    onSuccess: ({ id, payload }) => {
      patchLocal(id, payload);
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(id) });
      toast.success('Ürün güncellendi.');
    },
    onError: (error) => toast.error(messageOf(error, 'Ürün güncellenemedi.')),
  });

  const remove = useMutation({
    mutationFn: async (product: Pick<Product, 'id'>) => {
      if (!isLocalId(product.id)) {
        await deleteProductApi(product.id);
      }
      return product.id;
    },
    onSuccess: (id) => {
      // Başarılı yanıt sonrası overlay'e yaz; favorilerden de temizle.
      deleteLocal(id);
      removeFavorite(id);
      invalidateProducts();
      toast.success('Ürün silindi.');
    },
    onError: (error) => toast.error(messageOf(error, 'Ürün silinemedi.')),
  });

  return { create, update, remove };
}
