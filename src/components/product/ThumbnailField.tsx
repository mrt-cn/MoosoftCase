import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Input } from '@/components/ui/Input';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/theme';
import { productSchema } from '@/lib/validation';

interface ThumbnailFieldProps {
  value: string;
  onChange: (text: string) => void;
  onBlur: () => void;
  error?: string;
}

/**
 * Görsel alanı: üstte kare önizleme paneli, altında URL girişi.
 *
 * Önizlemenin geçerlilik ölçütü ayrı bir fonksiyon değildir; doğrudan mevcut
 * Zod şemasının thumbnail kuralı (tek doğruluk kaynağı) ile değerlendirilir.
 * Böylece kurallar tek yerde tanımlı kalır.
 */
export function ThumbnailField({ value, onChange, onBlur, error }: ThumbnailFieldProps) {
  const trimmed = (value ?? '').trim();
  const isValidImage = trimmed !== '' && productSchema.shape.thumbnail.safeParse(trimmed).success;

  return (
    <View style={styles.container}>
      <View style={styles.preview}>
        {isValidImage ? (
          <Image source={trimmed} style={styles.image} contentFit="cover" transition={150} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>🖼️</Text>
            <Text style={styles.placeholderText}>Görsel seçilmedi</Text>
          </View>
        )}
      </View>

      <Input
        label="Görsel URL"
        placeholder="https://... (opsiyonel)"
        autoCapitalize="none"
        keyboardType="url"
        value={value ?? ''}
        onChangeText={onChange}
        onBlur={onBlur}
        error={error}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  preview: {
    width: 128,
    height: 128,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  placeholderIcon: {
    fontSize: 32,
  },
  placeholderText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
