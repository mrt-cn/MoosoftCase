import { config } from '@/constants/config';

/**
 * Tüm ağ hatalarının normalize edildiği tek tip hata sınıfı.
 * UI katmanı sadece `message` ile ilgilenir; `status`/`isNetworkError`
 * ise gerektiğinde ayrımlaştırma (ör. 404) için kullanılır.
 */
export class ApiError extends Error {
  readonly status?: number;
  readonly isNetworkError: boolean;

  constructor(message: string, options?: { status?: number; isNetworkError?: boolean }) {
    super(message);
    this.name = 'ApiError';
    this.status = options?.status;
    this.isNetworkError = options?.isNetworkError ?? false;
  }
}

function toUserMessage(status: number): string {
  if (status >= 500) return 'Sunucu şu anda yanıt vermiyor. Lütfen daha sonra tekrar deneyin.';
  if (status === 404) return 'İstenen kayıt bulunamadı.';
  if (status === 400) return 'Geçersiz istek. Lütfen bilgileri kontrol edin.';
  return `Beklenmeyen bir hata oluştu (kod: ${status}).`;
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

/**
 * fetch üzerine ince sarmalayıcı:
 *  - baseURL birleştirme
 *  - AbortController ile timeout
 *  - JSON serialize/parse
 *  - tutarlı `ApiError` fırlatma (HTTP + ağ + timeout)
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.apiTimeoutMs);

  try {
    const response = await fetch(`${config.apiBaseUrl}${path}`, {
      ...rest,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new ApiError(toUserMessage(response.status), { status: response.status });
    }

    // 204 gibi gövdesiz yanıtlara karşı güvenli parse.
    const text = await response.text();
    return (text ? JSON.parse(text) : undefined) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('İstek zaman aşımına uğradı. Bağlantınızı kontrol edin.', {
        isNetworkError: true,
      });
    }

    throw new ApiError('İnternet bağlantısı kurulamadı. Lütfen tekrar deneyin.', {
      isNetworkError: true,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
