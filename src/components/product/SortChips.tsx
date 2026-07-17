import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/theme';

export type SortField = 'name' | 'price';
export type SortDirection = 'asc' | 'desc';

interface SortChipsProps {
  field: SortField;
  direction: SortDirection;
  onChange: (field: SortField, direction: SortDirection) => void;
}

const CHIPS: { field: SortField; label: string }[] = [
  { field: 'name', label: 'İsim' },
  { field: 'price', label: 'Fiyat' },
];

/**
 * Sıralama denetimi: iki chip (İsim / Fiyat).
 * - Aktif chip'e dokunma → yönü çevirir (▲ artan / ▼ azalan).
 * - Pasif chip'e dokunma → kriteri değiştirir, yön varsayılan olarak artan.
 * Sıralamanın kendisi çağıran ekranda client-side yapılır (query key'e girmez).
 */
export function SortChips({ field, direction, onChange }: SortChipsProps) {
  const handlePress = (chip: SortField) => {
    if (chip === field) {
      onChange(field, direction === 'asc' ? 'desc' : 'asc');
    } else {
      onChange(chip, 'asc');
    }
  };

  return (
    <View style={styles.row}>
      {CHIPS.map((chip) => {
        const active = chip.field === field;
        return (
          <Pressable
            key={chip.field}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => handlePress(chip.field)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{chip.label}</Text>
            {active ? (
              <Text style={[styles.arrow, styles.chipTextActive]}>
                {direction === 'asc' ? '▲' : '▼'}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
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
  },
  chipTextActive: {
    color: colors.textInverse,
    fontWeight: fontWeight.semibold,
  },
  arrow: {
    fontSize: fontSize.xs,
  },
});
