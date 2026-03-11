import {useColorScheme} from 'react-native';
import {usePreferenceStore} from '@/store/preferenceStore';
import {darkColors, lightColors} from '@/theme';

export const useThemeColors = () => {
  const mode = usePreferenceStore(state => state.mode);
  const systemScheme = useColorScheme();
  const active = mode ?? (systemScheme === 'dark' ? 'dark' : 'light');
  return active === 'dark' ? darkColors : lightColors;
};
