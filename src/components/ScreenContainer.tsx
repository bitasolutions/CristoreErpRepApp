import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StyleSheet, View} from 'react-native';
import {useThemeColors} from '@/hooks/useTheme';

export const ScreenContainer = ({children}: {children: React.ReactNode}) => {
  const c = useThemeColors();
  return (
    <SafeAreaView style={[styles.safe, {backgroundColor: c.background}]}>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {flex: 1},
  content: {flex: 1, paddingHorizontal: 14, paddingTop: 10},
});
