import { z } from 'zod';

import type { ProductPayload } from '@/api/types';

/** "12,5" gibi TR klavye girişini sayıya çevirir. Geçersizse NaN döner. */
export function parseLocaleNumber(value: string): number {
  const normalized = value.replace(/\s/g, '').replace(',', '.');
  if (normalized === '') return NaN;
  return Number(normalized);
}

const URL_REGEX = /^https?:\/\/.+/i;

/**
 * Add ve Edit ekranlarının paylaştığı tek form şeması.
 * Form alanları TextInput ile string olarak tutulur; sayısal/opsiyonel
 * kurallar burada deklaratif olarak tanımlanır.
 */
export const productSchema = z.object({
  title: z.string().trim().min(1, 'Ürün adı boş olamaz'),

  description: z.string().trim().optional().default(''),

  price: z
    .string()
    .trim()
    .min(1, 'Fiyat zorunludur')
    .refine((value) => !Number.isNaN(parseLocaleNumber(value)), 'Fiyat geçerli bir sayı olmalı')
    .refine((value) => parseLocaleNumber(value) > 0, "Fiyat 0'dan büyük olmalı"),

  category: z.string().min(1, 'Kategori seçilmelidir'),

  // Görsel URL opsiyonel; ama girildiyse geçerli bir http(s) adresi olmalı.
  thumbnail: z
    .string()
    .trim()
    .optional()
    .default('')
    .refine((value) => !value || URL_REGEX.test(value), 'Geçerli bir URL girin (http/https)'),
});

export type ProductFormValues = z.input<typeof productSchema>;

/** Doğrulanmış form değerlerini API gövdesine dönüştürür. */
export function toProductPayload(values: ProductFormValues): ProductPayload {
  return {
    title: values.title.trim(),
    description: values.description?.trim() || undefined,
    price: parseLocaleNumber(values.price),
    category: values.category,
    thumbnail: values.thumbnail?.trim() || undefined,
  };
}
