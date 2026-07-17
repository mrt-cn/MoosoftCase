import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/theme';

interface BadgeProps {
  label: string;
  tone?: 'default' | 'primary';
}

/** Küçük etiket rozeti (ör. kategori adı). */
export function Badge({ label, tone = 'default' }: BadgeProps) {
  const isPrimary = tone === 'primary';
  return (
    <View style={[styles.badge, isPrimary ? styles.primary : styles.default]}>
      <Text
        numberOfLines={1}
        style={[styles.text, isPrimary ? styles.primaryText : styles.defaultText]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  default: {
    backgroundColor: colors.surfaceAlt,
  },
  primary: {
    backgroundColor: colors.primarySoft,
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textTransform: 'capitalize',
  },
  defaultText: {
    color: colors.textMuted,
  },
  primaryText: {
    color: colors.primaryDark,
  },
});
