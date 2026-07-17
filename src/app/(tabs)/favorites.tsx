import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import type { Product } from '@/api/types';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductListSkeleton } from '@/components/product/ProductListSkeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorView } from '@/components/ui/ErrorView';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { colors, spacing } from '@/constants/theme';
import { useProductMutations } from '@/hooks/useProductMutations';
import { useProducts } from '@/hooks/useProducts';
import { DEFAULT_SORT } from '@/lib/sort';
import { useFavoritesStore } from '@/store/favorites.store';

export default function FavoritesScreen() {
  const router = useRouter();
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);
  const hasHydrated = useFavoritesStore((state) => state.hasHydrated);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);

  // Liste ekranıyla aynı query cache'i paylaşır (aynı queryKey).
  const { products, isLoading, isError, error, refetch } = useProducts({
    category: null,
    search: '',
    sort: DEFAULT_SORT,
  });
  const { remove } = useProductMutations();

  const favoriteProducts = useMemo(
    () => products.filter((product) => favoriteIds.includes(product.id)),
    [products, favoriteIds],
  );

  const confirmDelete = () => {
    if (!pendingDelete) return;
    remove.mutate({ id: pendingDelete.id }, { onSettled: () => setPendingDelete(null) });
  };

  if (!hasHydrated) return <ProductListSkeleton count={3} />;

  if (favoriteIds.length === 0) {
    return (
      <EmptyState
        icon="💔"
        title="Henüz favori ürününüz yok"
        description="Beğendiğiniz ürünleri kalp simgesine dokunarak favorilere ekleyin."
        actionLabel="Ürünlere göz at"
        onAction={() => router.push('/')}
      />
    );
  }

  if (isLoading) return <ProductListSkeleton count={3} />;
  if (isError) return <ErrorView message={error?.message} onRetry={refetch} />;

  if (favoriteProducts.length === 0) {
    return (
      <EmptyState
        icon="❤️"
        title="Favoriler yüklenemedi"
        description="Favori ürünler şu anda listede bulunamadı."
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favoriteProducts}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={(product) => router.push(`/product/${product.id}`)}
            onEdit={(product) => router.push(`/product/edit/${product.id}`)}
            onDelete={setPendingDelete}
          />
        )}
      />

      <ConfirmDialog
        visible={pendingDelete !== null}
        title="Ürünü sil"
        message={`"${pendingDelete?.title ?? ''}" ürününü silmek istediğinize emin misiniz?`}
        confirmLabel="Sil"
        destructive
        loading={remove.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <LoadingOverlay visible={remove.isPending} message="Siliniyor..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
});
