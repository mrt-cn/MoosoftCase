import { config } from '@/constants/config';

import { apiClient } from './client';
import type { Category, PaginatedResponse, Product, ProductPayload } from './types';

/**
 * DummyJSON ürün uç noktalarının tek sorumlu istemcisi.
 * Ekranlar/hook'lar doğrudan fetch yapmaz; her zaman bu fonksiyonları çağırır.
 */

const PRODUCT_FIELDS = 'title,description,category,price,thumbnail,images,rating,stock,brand';

export async function getProducts(): Promise<Product[]> {
  const data = await apiClient.get<PaginatedResponse<Product>>(
    `/products?limit=${config.productsPageLimit}&select=${PRODUCT_FIELDS}`,
  );
  return data.products;
}

export function getProduct(id: number): Promise<Product> {
  return apiClient.get<Product>(`/products/${id}`);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const data = await apiClient.get<PaginatedResponse<Product>>(
    `/products/search?q=${encodeURIComponent(query)}&select=${PRODUCT_FIELDS}`,
  );
  return data.products;
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const data = await apiClient.get<PaginatedResponse<Product>>(
    `/products/category/${encodeURIComponent(categorySlug)}?select=${PRODUCT_FIELDS}`,
  );
  return data.products;
}

export function getCategories(): Promise<Category[]> {
  return apiClient.get<Category[]>('/products/categories');
}

export function createProduct(payload: ProductPayload): Promise<Product> {
  return apiClient.post<Product>('/products/add', payload);
}

export function updateProduct(id: number, payload: ProductPayload): Promise<Product> {
  return apiClient.put<Product>(`/products/${id}`, payload);
}

export function deleteProduct(id: number): Promise<Product & { isDeleted: boolean }> {
  return apiClient.delete<Product & { isDeleted: boolean }>(`/products/${id}`);
}
