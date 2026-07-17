import type { Product } from '@/api/types';

export const SORT_OPTIONS = [
  { value: 'name-asc', label: 'İsim: A → Z' },
  { value: 'name-desc', label: 'İsim: Z → A' },
  { value: 'price-asc', label: 'Fiyat: Düşük → Yüksek' },
  { value: 'price-desc', label: 'Fiyat: Yüksek → Düşük' },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]['value'];

export const DEFAULT_SORT: SortOption = 'name-asc';

export function getSortLabel(option: SortOption): string {
  return SORT_OPTIONS.find((item) => item.value === option)?.label ?? '';
}

/**
 * Ürünleri seçilen ölçüte göre sıralar. Saf fonksiyon: kopya döndürür,
 * girdi diziyi mutasyona uğratmaz. Sıralama daima client-side yapılır çünkü
 * DummyJSON'un sıralaması lokal eklenen ürünleri kapsamaz.
 */
export function sortProducts(products: Product[], option: SortOption): Product[] {
  const sorted = [...products];

  switch (option) {
    case 'name-asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title, 'tr'));
    case 'name-desc':
      return sorted.sort((a, b) => b.title.localeCompare(a.title, 'tr'));
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    default:
      return sorted;
  }
}
