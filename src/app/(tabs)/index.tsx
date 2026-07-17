import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import type { Product } from '@/api/types';
import { CategoryFilter } from '@/components/product/CategoryFilter';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductListSkeleton } from '@/components/product/ProductListSkeleton';
import { SearchBar } from '@/components/product/SearchBar';
import { SortSheet } from '@/components/product/SortSheet';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorView } from '@/components/ui/ErrorView';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { colors, fontSize, fontWeight, radius, shadow, spacing } from '@/constants/theme';
import { useCategories } from '@/hooks/useCategories';
import { useDebounce } from '@/hooks/useDebounce';
import { useProductMutations } from '@/hooks/useProductMutations';
import { useProducts } from '@/hooks/useProducts';
import { DEFAULT_SORT, getSortLabel, type SortOption } from '@/lib/sort';

export default function ProductListScreen() {
  const router = useRouter();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>(DEFAULT_SORT);
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);

  const { data: categories = [] } = useCategories();
  const { products, isLoading, isError, error, isRefetching, refetch } = useProducts({
    category,
    search: debouncedSearch,
    sort,
  });
  const { remove } = useProductMutations();

  const confirmDelete = () => {
    if (!pendingDelete) return;
    remove.mutate({ id: pendingDelete.id }, { onSettled: () => setPendingDelete(null) });
  };

  const renderContent = () => {
    if (isLoading) return <ProductListSkeleton />;

    if (isError) {
      return <ErrorView message={error?.message} onRetry={refetch} />;
    }

    if (products.length === 0) {
      return debouncedSearch ? (
        <EmptyState
          icon="🔎"
          title="Sonuç bulunamadı"
          description={`"${debouncedSearch}" için ürün bulunamadı.`}
        />
      ) : (
        <EmptyState title="Ürün yok" description="Bu filtreye uygun ürün bulunmuyor." />
      );
    }

    return (
      <FlatList
        data={products}
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
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isLoading}
            onRefresh={refetch}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SearchBar value={search} onChangeText={setSearch} />
        <CategoryFilter categories={categories} selected={category} onSelect={setCategory} />
        <View style={styles.toolbar}>
          <Text style={styles.count}>{products.length} ürün</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setSortSheetOpen(true)}
            style={({ pressed }) => [styles.sortButton, pressed && styles.pressed]}
          >
            <Text style={styles.sortIcon}>↕</Text>
            <Text style={styles.sortLabel}>{getSortLabel(sort)}</Text>
          </Pressable>
        </View>
      </View>

      {renderContent()}

      <Pressable
        accessibilityLabel="Yeni ürün ekle"
        onPress={() => router.push('/product/add')}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      >
        <Text style={styles.fabIcon}>＋</Text>
      </Pressable>

      <SortSheet
        visible={sortSheetOpen}
        selected={sort}
        onSelect={setSort}
        onClose={() => setSortSheetOpen(false)}
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
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  count: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  pressed: {
    opacity: 0.7,
  },
  sortIcon: {
    fontSize: fontSize.md,
    color: colors.primaryDark,
    fontWeight: fontWeight.bold,
  },
  sortLabel: {
    fontSize: fontSize.sm,
    color: colors.primaryDark,
    fontWeight: fontWeight.semibold,
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  fabPressed: {
    opacity: 0.85,
  },
  fabIcon: {
    fontSize: 30,
    color: colors.textInverse,
    lineHeight: 34,
  },
});
