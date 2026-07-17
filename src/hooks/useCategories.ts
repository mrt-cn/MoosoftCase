import { useQuery } from '@tanstack/react-query';

import { getCategories } from '@/api/products.api';

import { queryKeys } from './queryKeys';

/**
 * Kategoriler nadiren değişir; `staleTime: Infinity` ile gereksiz refetch engellenir.
 */
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: getCategories,
    staleTime: Infinity,
  });
}
