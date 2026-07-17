import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ProductForm } from '@/components/product/ProductForm';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorView } from '@/components/ui/ErrorView';
import { colors } from '@/constants/theme';
import { useCategories } from '@/hooks/useCategories';
import { useProduct } from '@/hooks/useProduct';
import { useProductMutations } from '@/hooks/useProductMutations';
import type { ProductFormValues } from '@/lib/validation';

export default function EditProductScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const id = Number(params.id);

  const { product, isLoading, isError, error, refetch } = useProduct(id);
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { update } = useProductMutations();

  const initialValues = useMemo<Partial<ProductFormValues> | undefined>(() => {
    if (!product) return undefined;
    return {
      title: product.title,
      description: product.description ?? '',
      price: String(product.price),
      category: product.category,
      thumbnail: product.thumbnail ?? '',
    };
  }, [product]);

  if (isLoading || categoriesLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError) return <ErrorView message={error?.message} onRetry={refetch} />;

  if (!product) {
    return (
      <EmptyState icon="🗑️" title="Ürün bulunamadı" description="Bu ürün silinmiş olabilir." />
    );
  }

  return (
    <ProductForm
      mode="edit"
      categories={categories}
      initialValues={initialValues}
      submitting={update.isPending}
      onSubmit={(payload) => update.mutate({ id, payload }, { onSuccess: () => router.back() })}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
