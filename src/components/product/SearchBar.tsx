import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, fontSize, radius, spacing } from '@/constants/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

/** Kontrollü arama girişi. Debounce üst katmanda (ekran) uygulanır. */
export function SearchBar({ value, onChangeText, placeholder = 'Ürün ara...' }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔍</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        returnKeyType="search"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityLabel="Aramayı temizle"
          hitSlop={8}
          onPress={() => onChangeText('')}
        >
          <Text style={styles.clear}>✕</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    minHeight: 46,
  },
  icon: {
    fontSize: fontSize.md,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  clear: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    paddingHorizontal: spacing.xs,
  },
});
