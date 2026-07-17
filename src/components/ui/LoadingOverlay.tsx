import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, radius, spacing } from '@/constants/theme';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

/** Tam ekran engelleyici yükleniyor katmanı (ör. silme işlemi sürerken). */
export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={colors.primary} />
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.lg,
    alignItems: 'center',
    gap: spacing.md,
    minWidth: 140,
  },
  message: {
    fontSize: fontSize.md,
    color: colors.text,
  },
});
