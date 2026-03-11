import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  get: async <T,>(key: string): Promise<T | null> => {
    const value = await AsyncStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  },
  set: async (key: string, value: unknown) => AsyncStorage.setItem(key, JSON.stringify(value)),
  remove: async (key: string) => AsyncStorage.removeItem(key),
};
