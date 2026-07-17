import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

import type { Category, ProductPayload } from '@/api/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { spacing } from '@/constants/theme';
import { productSchema, toProductPayload, type ProductFormValues } from '@/lib/validation';

import { CategorySelect } from './CategorySelect';

interface ProductFormProps {
  mode: 'add' | 'edit';
  categories: Category[];
  initialValues?: Partial<ProductFormValues>;
  submitting?: boolean;
  onSubmit: (payload: ProductPayload) => void;
}

const EMPTY_VALUES: ProductFormValues = {
  title: '',
  description: '',
  price: '',
  category: '',
  thumbnail: '',
};

/**
 * Add ve Edit ekranlarının paylaştığı tek form bileşeni.
 * Doğrulama Zod şemasıyla; edit modunda alanlar mevcut ürünle doldurulur.
 */
export function ProductForm({
  mode,
  categories,
  initialValues,
  submitting = false,
  onSubmit,
}: ProductFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { ...EMPTY_VALUES, ...initialValues },
    mode: 'onTouched',
  });

  const submit = handleSubmit((values) => onSubmit(toProductPayload(values)));

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Controller
          control={control}
          name="title"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="Ürün Adı"
              required
              placeholder="Örn. Kaşarlı Tost"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.title?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="Açıklama"
              placeholder="Ürün açıklaması (opsiyonel)"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={4}
              style={styles.textarea}
              error={errors.description?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="price"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="Fiyat"
              required
              placeholder="Örn. 49.90"
              keyboardType="decimal-pad"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.price?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="category"
          render={({ field: { value, onChange } }) => (
            <CategorySelect
              categories={categories}
              value={value}
              onChange={onChange}
              error={errors.category?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="thumbnail"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="Görsel URL"
              placeholder="https://... (opsiyonel)"
              autoCapitalize="none"
              keyboardType="url"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.thumbnail?.message}
            />
          )}
        />

        <Button
          label={mode === 'add' ? 'Ürünü Ekle' : 'Değişiklikleri Kaydet'}
          onPress={submit}
          loading={submitting}
          fullWidth
          style={styles.submit}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  submit: {
    marginTop: spacing.sm,
  },
});
