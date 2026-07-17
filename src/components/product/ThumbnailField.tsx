import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/theme';
import { productSchema } from '@/lib/validation';
import { toast } from '@/utils/toast';

interface ThumbnailFieldProps {
  value: string;
  onChange: (text: string) => void;
  onBlur: () => void;
  error?: string;
}

/**
 * Görsel alanı: üstte kare önizleme, altında ya URL girişi ya da galeri seçimi chip'i.
 *
 * Önizlemenin geçerlilik ölçütü ayrı bir fonksiyon değildir; doğrudan mevcut Zod
 * şemasının thumbnail kuralı (tek doğruluk kaynağı) ile değerlendirilir. Bu kural
 * hem http(s) URL'yi hem de galeriden gelen file:// URI'sini kabul eder.
 */
export function ThumbnailField({ value, onChange, onBlur, error }: ThumbnailFieldProps) {
  const [picking, setPicking] = useState(false);

  const trimmed = (value ?? '').trim();
  const isValidImage = trimmed !== '' && productSchema.shape.thumbnail.safeParse(trimmed).success;
  // Galeriden seçilen görseller documentDirectory altında file:// olarak tutulur.
  const isGallerySelected = trimmed.startsWith('file://');

  const pickFromGallery = async () => {
    try {
      setPicking(true);
      // İzin akışı kütüphanenin modern foto seçicisine bırakılır.
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset) return;

      // Seçicinin döndürdüğü cache URI kalıcı değildir; documentDirectory'ye kopyalanır.
      const destination = `${FileSystem.documentDirectory}product-${Date.now()}.jpg`;
      await FileSystem.copyAsync({ from: asset.uri, to: destination });
      onChange(destination);
    } catch {
      toast.error('Görsel seçilemedi. Lütfen tekrar deneyin.');
    } finally {
      setPicking(false);
    }
  };

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

      {isGallerySelected ? (
        // file:// metnini kullanıcıya göstermeyiz; yerine temizlenebilir bir chip.
        <View style={styles.selectedChip}>
          <Text style={styles.selectedChipText}>Galeriden seçildi</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Galeri seçimini temizle"
            hitSlop={8}
            onPress={() => onChange('')}
          >
            <Text style={styles.selectedChipClose}>✕</Text>
          </Pressable>
        </View>
      ) : (
        <>
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
          <Button
            label="Galeriden Seç"
            variant="secondary"
            onPress={pickFromGallery}
            loading={picking}
          />
        </>
      )}
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
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  selectedChipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primaryDark,
  },
  selectedChipClose: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.primaryDark,
  },
});
