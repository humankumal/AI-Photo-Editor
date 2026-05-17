import { useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'theme_preference';

export function useTheme() {
  const [theme, setTheme] = useState<ColorSchemeName>('dark');

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((stored) => {
      const value = (stored as ColorSchemeName) ?? 'dark';
      setTheme(value);
      Appearance.setColorScheme(value);
    });
  }, []);

  async function toggleTheme() {
    const next: ColorSchemeName = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    Appearance.setColorScheme(next);
    await AsyncStorage.setItem(KEY, next ?? 'dark');
  }

  return { theme, toggleTheme };
}
