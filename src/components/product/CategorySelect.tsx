import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Category } from '@/api/types';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/theme';

interface CategorySelectProps {
  categories: Category[];
  value: string;
  onChange: (slug: string) => void;
  error?: string;
}

/**
 * Kategori seçimi bir picker/bottom-sheet iledir; serbest metin değil.
 * Böylece "Category must be selected" kuralı yapısal olarak garanti edilir.
 */
export function CategorySelect({ categories, value, onChange, error }: CategorySelectProps) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const selected = categories.find((category) => category.slug === value);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Kategori<Text style={styles.required}> *</Text>
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        style={[styles.field, !!error && styles.fieldError]}
      >
        <Text style={[styles.value, !selected && styles.placeholder]}>
          {selected ? selected.name : 'Kategori seçin'}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal
        visible={open}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}
            onPress={() => {}}
          >
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Kategori Seç</Text>
            <ScrollView style={styles.list}>
              {categories.map((category) => {
                const active = category.slug === value;
                return (
                  <Pressable
                    key={category.slug}
                    onPress={() => {
                      onChange(category.slug);
                      setOpen(false);
                    }}
                    style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                  >
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>
                      {category.name}
                    </Text>
                    {active ? <Text style={styles.check}>✓</Text> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  required: {
    color: colors.danger,
  },
  field: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
  },
  fieldError: {
    borderColor: colors.danger,
  },
  value: {
    fontSize: fontSize.md,
    color: colors.text,
    textTransform: 'capitalize',
  },
  placeholder: {
    color: colors.textMuted,
  },
  chevron: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  error: {
    fontSize: fontSize.xs,
    color: colors.danger,
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    maxHeight: '70%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing.md,
  },
  sheetTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  list: {
    flexGrow: 0,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  optionPressed: {
    opacity: 0.6,
  },
  optionText: {
    fontSize: fontSize.md,
    color: colors.text,
    textTransform: 'capitalize',
  },
  optionTextActive: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  check: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
});
