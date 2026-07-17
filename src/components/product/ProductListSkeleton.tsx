import { StyleSheet, View } from 'react-native';

import { Skeleton } from '@/components/ui/Skeleton';
import { colors, radius, shadow, spacing } from '@/constants/theme';

/** İlk yükleme sırasında liste yerine gösterilen iskelet kartlar. */
export function ProductListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.card}>
          <Skeleton width={88} height={88} borderRadius={radius.md} />
          <View style={styles.body}>
            <Skeleton width="80%" height={16} />
            <Skeleton width="40%" height={12} />
            <Skeleton width="30%" height={20} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.card,
  },
  body: {
    flex: 1,
    justifyContent: 'space-around',
    paddingVertical: spacing.xs,
  },
});
