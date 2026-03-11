import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { QueryProvider } from '@/services/queryClient';
import { AppNavigator } from '@/navigation/AppNavigator';
import { usePreferenceStore } from '@/store/preferenceStore';


export default function App() {
  const systemScheme = useColorScheme();
  const mode = usePreferenceStore(state => state.mode);

  const activeMode = mode ?? (systemScheme === 'dark' ? 'dark' : 'light');
  const theme = activeMode === 'dark' ? MD3DarkTheme : MD3LightTheme;

  return (
    <PaperProvider theme={theme}>
      <QueryProvider>
        <StatusBar barStyle={activeMode === 'dark' ? 'light-content' : 'dark-content'} />
        <AppNavigator />
      </QueryProvider>
    </PaperProvider>
  );
}
