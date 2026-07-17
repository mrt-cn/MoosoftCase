import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { FavoriteButton } from '@/components/product/FavoriteButton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorView } from '@/components/ui/ErrorView';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/theme';
import { useProduct } from '@/hooks/useProduct';
import { useProductMutations } from '@/hooks/useProductMutations';
import { formatPrice } from '@/utils/format';

export default function ProductDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const id = Number(params.id);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const { product, isLoading, isError, error, refetch } = useProduct(id);
  const { remove } = useProductMutations();

  const handleDelete = () => {
    remove.mutate(
      { id },
      {
        onSuccess: () => {
          setConfirmVisible(false);
          router.back();
        },
        onError: () => setConfirmVisible(false),
      },
    );
  };

  if (isLoading) {
    return (
      <View style={styles.skeleton}>
        <Skeleton width="100%" height={280} borderRadius={radius.lg} />
        <Skeleton width="70%" height={24} />
        <Skeleton width="30%" height={20} />
        <Skeleton width="100%" height={80} />
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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageWrapper}>
          <Image
            source={product.thumbnail || undefined}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.favorite}>
            <FavoriteButton id={product.id} size={26} />
          </View>
        </View>

        <View style={styles.body}>
          <Badge label={product.category} tone="primary" />
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>

          {product.description ? (
            <>
              <Text style={styles.sectionTitle}>Açıklama</Text>
              <Text style={styles.description}>{product.description}</Text>
            </>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <Button
          label="Düzenle"
          variant="secondary"
          onPress={() => router.push(`/product/edit/${product.id}`)}
          style={styles.actionButton}
        />
        <Button
          label="Sil"
          variant="danger"
          onPress={() => setConfirmVisible(true)}
          style={styles.actionButton}
        />
      </View>

      <ConfirmDialog
        visible={confirmVisible}
        title="Ürünü sil"
        message={`"${product.title}" ürününü silmek istediğinize emin misiniz?`}
        confirmLabel="Sil"
        destructive
        loading={remove.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmVisible(false)}
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
  skeleton: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: colors.surfaceAlt,
  },
  favorite: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  price: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.md,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  actionButton: {
    flex: 1,
  },
});
