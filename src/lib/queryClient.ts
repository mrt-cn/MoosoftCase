import { QueryClient } from '@tanstack/react-query';

/**
 * Uygulama genelinde tek QueryClient örneği.
 * Mobilde agresif refetch istemeyiz; makul staleTime ve sınırlı retry.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
