import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius } from '@/constants/theme';
import { useFavoritesStore, useIsFavorite } from '@/store/favorites.store';

interface FavoriteButtonProps {
  id: number;
  size?: number;
}

/**
 * Favori aç/kapat butonu. Liste ve detay ekranlarında ortak kullanılır.
 * Favori işlemi yalnızca lokaldir — API'ye istek göndermez (case şartı).
 */
export function FavoriteButton({ id, size = 22 }: FavoriteButtonProps) {
  const isFavorite = useIsFavorite(id);
  const toggle = useFavoritesStore((state) => state.toggle);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
      hitSlop={8}
      onPress={() => toggle(id)}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text
        style={[
          styles.icon,
          { fontSize: size, color: isFavorite ? colors.favorite : colors.textMuted },
        ]}
      >
        {isFavorite ? '♥' : '♡'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  icon: {
    lineHeight: 26,
  },
});
