/**
 * Uygulama genelinde kullanılan çalışma zamanı yapılandırması.
 *
 * Base URL ve timeout, `EXPO_PUBLIC_*` ortam değişkenlerinden okunur; ayarlanmadıysa
 * güvenli varsayılanlara düşer. Böylece proje ekstra bir kurulum olmadan çalışır,
 * ama isteyen `.env` ile ortamı değiştirebilir (bkz. `.env.example`).
 */

const DEFAULT_BASE_URL = 'https://dummyjson.com';
const DEFAULT_TIMEOUT_MS = 12_000;

function parseTimeout(raw: string | undefined): number {
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_TIMEOUT_MS;
}

export const config = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_BASE_URL,
  apiTimeoutMs: parseTimeout(process.env.EXPO_PUBLIC_API_TIMEOUT_MS),
  /** Liste isteğinde çekilecek ürün sayısı (DummyJSON'da limit=0 => tümü). */
  productsPageLimit: 0,
} as const;
