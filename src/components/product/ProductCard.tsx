import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Product } from '@/api/types';
import { Badge } from '@/components/ui/Badge';
import { colors, fontSize, fontWeight, radius, shadow, spacing } from '@/constants/theme';
import { formatPrice } from '@/utils/format';

import { FavoriteButton } from './FavoriteButton';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const BLUR_HASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

function ProductCardComponent({ product, onPress, onEdit, onDelete }: ProductCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(product)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Image
        source={product.thumbnail || undefined}
        placeholder={{ blurhash: BLUR_HASH }}
        style={styles.image}
        contentFit="cover"
        transition={200}
      />

      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={2}>
            {product.title}
          </Text>
          <FavoriteButton id={product.id} />
        </View>

        <Badge label={product.category} tone="primary" />

        <View style={styles.footerRow}>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
          <View style={styles.actions}>
            <Pressable
              accessibilityLabel="Düzenle"
              hitSlop={8}
              onPress={() => onEdit(product)}
              style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
            >
              <Text style={styles.actionIcon}>✏️</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Sil"
              hitSlop={8}
              onPress={() => onDelete(product)}
              style={({ pressed }) => [
                styles.actionButton,
                styles.deleteButton,
                pressed && styles.actionPressed,
              ]}
            >
              <Text style={styles.actionIcon}>🗑️</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export const ProductCard = memo(ProductCardComponent);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    ...shadow.card,
  },
  pressed: {
    opacity: 0.9,
  },
  image: {
    width: 88,
    height: 88,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  price: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: colors.dangerSoft,
  },
  actionPressed: {
    opacity: 0.6,
  },
  actionIcon: {
    fontSize: 16,
  },
});
