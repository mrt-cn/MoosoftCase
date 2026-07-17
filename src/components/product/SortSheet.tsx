import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/theme';
import { SORT_OPTIONS, type SortOption } from '@/lib/sort';

interface SortSheetProps {
  visible: boolean;
  selected: SortOption;
  onSelect: (option: SortOption) => void;
  onClose: () => void;
}

/** Alt sayfa (bottom sheet) olarak sıralama seçenekleri; aktif olan işaretlenir. */
export function SortSheet({ visible, selected, onSelect, onClose }: SortSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}
          onPress={() => {}}
        >
          <View style={styles.handle} />
          <Text style={styles.title}>Sıralama</Text>
          {SORT_OPTIONS.map((option) => {
            const active = option.value === selected;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="menuitem"
                accessibilityState={{ selected: active }}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
                style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
              >
                <Text style={[styles.optionText, active && styles.optionTextActive]}>
                  {option.label}
                </Text>
                {active ? <Text style={styles.check}>✓</Text> : null}
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
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
