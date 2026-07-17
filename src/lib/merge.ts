import type { Product } from '@/api/types';

/**
 * API verisinin üzerine uygulanan lokal değişiklik katmanı ("overlay").
 *
 * DummyJSON CRUD isteklerini simüle eder; sunucuda kalıcı değişiklik olmaz.
 * Bu yüzden create/update/delete sonuçlarını burada tutup her render'da API
 * verisiyle birleştiririz. Böylece pull-to-refresh sonrasında bile lokal
 * değişiklikler korunur (overlay refetch'ten bağımsızdır).
 */
export interface LocalChanges {
  added: Product[];
  updated: Record<number, Partial<Product>>;
  deleted: number[];
}

export const emptyLocalChanges: LocalChanges = {
  added: [],
  updated: {},
  deleted: [],
};

/** Lokal eklenen ürünler negatif id alır → API id'leriyle asla çakışmaz. */
export function isLocalId(id: number): boolean {
  return id < 0;
}

/**
 * Tek bir API ürününe lokal `updated` yamasını uygular.
 * Saf fonksiyon: girdileri değiştirmez.
 */
function applyPatch(product: Product, changes: LocalChanges): Product {
  const patch = changes.updated[product.id];
  return patch ? { ...product, ...patch } : product;
}

/**
 * Liste birleştirme sırası:
 *   1) silinenleri çıkar
 *   2) güncelleme yamalarını uygula
 *   3) lokal eklenenleri başa ekle (en yeni en üstte)
 */
export function mergeProductList(apiProducts: Product[], changes: LocalChanges): Product[] {
  const deleted = new Set(changes.deleted);

  const fromApi = apiProducts
    .filter((product) => !deleted.has(product.id))
    .map((product) => applyPatch(product, changes));

  const localAdded = changes.added.filter((product) => !deleted.has(product.id));

  return [...localAdded, ...fromApi];
}

/**
 * Tekil ürün çözümleme (detay/düzenleme ekranı için).
 * Lokal eklenen ürün API'de yoktur; önce overlay'de aranır.
 */
export function resolveProduct(
  id: number,
  apiProduct: Product | undefined,
  changes: LocalChanges,
): Product | undefined {
  if (changes.deleted.includes(id)) return undefined;

  if (isLocalId(id)) {
    const local = changes.added.find((product) => product.id === id);
    return local ? applyPatch(local, changes) : undefined;
  }

  return apiProduct ? applyPatch(apiProduct, changes) : undefined;
}
