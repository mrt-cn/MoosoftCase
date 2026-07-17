/**
 * DummyJSON `/products` API sözleşmesinin TypeScript modeli.
 * Yalnızca uygulamada kullanılan alanlar zorunlu, geri kalanı opsiyonel tutulmuştur.
 */

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  thumbnail: string;
  images?: string[];
  rating?: number;
  stock?: number;
  brand?: string;
  discountPercentage?: number;
}

/** DummyJSON liste yanıtı bu zarf ile sarmalanır. */
export interface PaginatedResponse<T> {
  products: T[];
  total: number;
  skip: number;
  limit: number;
}

/**
 * `/products/categories` güncel şemada obje dizisi döner.
 * Filtre isteklerinde `slug`, arayüzde `name` kullanılır.
 */
export interface Category {
  slug: string;
  name: string;
  url: string;
}

/** Ürün oluşturma/güncelleme için form -> API gövdesi. */
export interface ProductPayload {
  title: string;
  description?: string;
  price: number;
  category: string;
  thumbnail?: string;
}
