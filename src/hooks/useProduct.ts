import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { getProduct } from '@/api/products.api';
import { isLocalId, resolveProduct } from '@/lib/merge';
import { selectLocalChanges, useLocalChangesStore } from '@/store/localChanges.store';

import { queryKeys } from './queryKeys';

/**
 * Tekil ürün çözümleme. Lokal eklenen ürünler (negatif id) API'de bulunmaz;
 * bu durumda istek atılmaz, veri doğrudan overlay'den okunur (§3.1).
 */
export function useProduct(id: number) {
  const isLocal = isLocalId(id);
  const localChanges = useLocalChangesStore(selectLocalChanges);

  const query = useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => getProduct(id),
    enabled: !isLocal && Number.isFinite(id),
  });

  const product = useMemo(
    () => resolveProduct(id, query.data, localChanges),
    [id, query.data, localChanges],
  );

  return { ...query, product, isLocal };
}
