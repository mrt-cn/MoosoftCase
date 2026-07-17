/**
 * Merkezi TanStack Query anahtar fabrikası.
 * Anahtarların tek yerden üretilmesi, cache invalidation'ı tutarlı kılar.
 */
export const queryKeys = {
  products: {
    all: ['products'] as const,
    list: (filters: { category: string | null; search: string }) =>
      ['products', 'list', filters] as const,
    detail: (id: number) => ['products', 'detail', id] as const,
  },
  categories: ['categories'] as const,
};
