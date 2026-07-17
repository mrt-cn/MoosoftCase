import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { getProducts, getProductsByCategory, searchProducts } from '@/api/products.api';
import type { Product } from '@/api/types';
import { mergeProductList } from '@/lib/merge';
import { sortProducts, type SortOption } from '@/lib/sort';
import { selectLocalChanges, useLocalChangesStore } from '@/store/localChanges.store';

import { queryKeys } from './queryKeys';

interface UseProductsParams {
  category: string | null;
  search: string;
  sort: SortOption;
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase('tr');
}

/**
 * Ürün listesi için tek giriş noktası. Sorumlulukları:
 *  1. Filtreye göre doğru DummyJSON uç noktasını seçmek (arama > kategori > tümü).
 *  2. Sonucu lokal overlay ile birleştirmek (create/update/delete kalıcılığı).
 *  3. Kategori ve isim filtrelerini birleşik sonuç üzerinde uygulamak
 *     (arama + kategori kombinasyonu ve lokal ürünler dahil).
 *  4. Client-side sıralama (refetch tetiklemez; query key'e girmez).
 */
export function useProducts({ category, search, sort }: UseProductsParams) {
  const query = useQuery({
    queryKey: queryKeys.products.list({ category, search }),
    queryFn: (): Promise<Product[]> => {
      if (search) return searchProducts(search);
      if (category) return getProductsByCategory(category);
      return getProducts();
    },
    placeholderData: (previous) => previous,
  });

  const localChanges = useLocalChangesStore(useShallow(selectLocalChanges));

  const products = useMemo(() => {
    const apiList = query.data ?? [];
    let result = mergeProductList(apiList, localChanges);

    if (category) {
      result = result.filter((product) => product.category === category);
    }
    if (search) {
      const term = normalize(search);
      result = result.filter((product) => normalize(product.title).includes(term));
    }

    return sortProducts(result, sort);
  }, [query.data, localChanges, category, search, sort]);

  return { ...query, products };
}
