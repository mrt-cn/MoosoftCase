import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';

import { Button } from './Button';

interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
}

/** API hatalarını "Tekrar Dene" aksiyonuyla gösteren tek tip görünüm. */
export function ErrorView({ message, onRetry }: ErrorViewProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.title}>Bir şeyler ters gitti</Text>
      <Text style={styles.message}>{message ?? 'Beklenmeyen bir hata oluştu.'}</Text>
      {onRetry ? (
        <Button label="Tekrar Dene" onPress={onRetry} variant="primary" style={styles.retry} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  icon: {
    fontSize: 44,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  message: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
  },
  retry: {
    marginTop: spacing.md,
    minWidth: 160,
  },
});
