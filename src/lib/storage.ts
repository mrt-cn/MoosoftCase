import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Kalıcı depolama soyutlaması.
 *
 * Uygulama doğrudan AsyncStorage'a değil bu arayüze bağımlıdır; böylece ileride
 * MMKV gibi başka bir çözüme geçmek tek dosyalık bir değişiklik olur.
 *
 * AsyncStorage tercih edildi çünkü Expo Go ile ekstra native derleme gerektirmeden
 * çalışır — teslimin birincil şartı olan "talimatlarla anında çalışabilirlik" için.
 */
export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export const storage: KeyValueStorage = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
};
