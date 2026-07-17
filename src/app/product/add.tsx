import { useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ProductForm } from '@/components/product/ProductForm';
import { ErrorView } from '@/components/ui/ErrorView';
import { colors } from '@/constants/theme';
import { useCategories } from '@/hooks/useCategories';
import { useProductMutations } from '@/hooks/useProductMutations';

export default function AddProductScreen() {
  const router = useRouter();
  const { data: categories = [], isLoading, isError, error, refetch } = useCategories();
  const { create } = useProductMutations();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError) return <ErrorView message={error?.message} onRetry={refetch} />;

  return (
    <ProductForm
      mode="add"
      categories={categories}
      submitting={create.isPending}
      onSubmit={(payload) =>
        create.mutate(payload, {
          onSuccess: () => router.back(),
        })
      }
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
