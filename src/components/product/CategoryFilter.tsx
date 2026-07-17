import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import type { Category } from '@/api/types';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/theme';

interface CategoryFilterProps {
  categories: Category[];
  selected: string | null;
  onSelect: (slug: string | null) => void;
}

/** Yatay kaydırılabilir kategori çipleri; "Tümü" seçeneği ile filtreyi sıfırlar. */
export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <Chip label="Tümü" active={selected === null} onPress={() => onSelect(null)} />
      {categories.map((category) => (
        <Chip
          key={category.slug}
          label={category.name}
          active={selected === category.slug}
          onPress={() => onSelect(category.slug)}
        />
      ))}
    </ScrollView>
  );
}

interface ChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

function Chip({ label, active, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  chipTextActive: {
    color: colors.textInverse,
  },
});
