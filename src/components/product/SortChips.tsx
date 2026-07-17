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

/** Aktif chip'te yönü açık metinle anlatan etiket. */
function getActiveLabel(field: SortField, direction: SortDirection): string {
  if (field === 'name') {
    return direction === 'asc' ? 'İsim: A→Z' : 'İsim: Z→A';
  }
  return direction === 'asc' ? 'Fiyat: Artan' : 'Fiyat: Azalan';
}

/**
 * Sıralama denetimi: iki chip (İsim / Fiyat).
 * - Aktif chip'e dokunma → yönü çevirir; etiket açık metinle güncellenir
 *   (ör. "İsim: A→Z" ↔ "İsim: Z→A", "Fiyat: Artan" ↔ "Fiyat: Azalan").
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
        const label = active ? getActiveLabel(chip.field, direction) : chip.label;
        return (
          <Pressable
            key={chip.field}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => handlePress(chip.field)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
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
});
