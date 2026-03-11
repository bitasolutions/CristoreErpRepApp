import React, {useState} from 'react';
import {Alert, StyleSheet, Switch, View} from 'react-native';
import {Button, Input, Segment, Text} from '@/components/ui';
import {ScreenContainer} from '@/components/ScreenContainer';
import {usePreferenceStore} from '@/store/preferenceStore';
import {useThemeColors} from '@/hooks/useTheme';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '@/navigation/AppNavigator';
import {useRefreshCompany} from '@/hooks/api';
import {useAuthStore} from '@/store/authStore';

export const SettingsScreen = () => {
  const c = useThemeColors();
  const mode = usePreferenceStore(state => state.mode);
  const printLogo = usePreferenceStore(state => state.printLogo);
  const printPin = usePreferenceStore(state => state.printPin);
  const apiBaseUrl = usePreferenceStore(state => state.apiBaseUrl);
  const setMode = usePreferenceStore(state => state.setMode);
  const setPrintLogo = usePreferenceStore(state => state.setPrintLogo);
  const setPrintPin = usePreferenceStore(state => state.setPrintPin);
  const printAfterOrder = usePreferenceStore(state => state.printAfterOrder);
  const setPrintAfterOrder = usePreferenceStore(state => state.setPrintAfterOrder);
  const setApiBaseUrl = usePreferenceStore(state => state.setApiBaseUrl);

  const [apiUrlInput, setApiUrlInput] = useState(apiBaseUrl);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const refreshCompany = useRefreshCompany();

  const saveApiUrl = () => {
    const trimmed = apiUrlInput.trim();
    if (!trimmed) {
      Alert.alert('Invalid API URL', 'API URL cannot be empty.');
      return;
    }
    setApiBaseUrl(trimmed);
    Alert.alert('Saved', 'API URL updated.');
  };

  return (
    <ScreenContainer>
      <Text variant="title" style={styles.sectionTitle}>Theme</Text>
      <Segment
        options={['Light', 'Dark']}
        selectedIndex={mode === 'dark' ? 1 : 0}
        onSelect={i => setMode(i === 1 ? 'dark' : 'light')}
      />

      <Text variant="title" style={styles.sectionTitle}>Receipt Settings</Text>
      <View style={styles.switchRow}>
        <Text variant="body">Print Logo</Text>
        <Switch value={printLogo} onValueChange={setPrintLogo} trackColor={{true: c.primary}} />
      </View>
      <View style={styles.switchRow}>
        <Text variant="body">Print PIN</Text>
        <Switch value={printPin} onValueChange={setPrintPin} trackColor={{true: c.primary}} />
      </View>
      <View style={styles.switchRow}>
        <Text variant="body">Print After Order</Text>
        <Switch value={printAfterOrder} onValueChange={setPrintAfterOrder} trackColor={{true: c.primary}} />
      </View>

      <Text variant="title" style={styles.sectionTitle}>API URL</Text>
      <Input
        value={apiUrlInput}
        onChangeText={setApiUrlInput}
        placeholder="https://your-api-host"
        style={styles.apiInput}
      />
      <Button type="solid" onPress={saveApiUrl} style={styles.saveBtn}>Save</Button>

      <Text variant="title" style={styles.sectionTitle}>Company Data</Text>
      <Button
        type="outline"
        onPress={() => {
          refreshCompany();
          Alert.alert('Refreshed', 'Company data will be re-fetched.');
        }}
        style={styles.saveBtn}>
        Refresh Company
      </Button>

      <Button
        type="outline"
        onPress={() => navigation.navigate('PrinterTest')}
        style={styles.testBtn}>
        Test Printer
      </Button>

      <Button
        type="outline"
        onPress={() => {
          Alert.alert('Logout', 'Are you sure you want to sign out?', [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Logout', style: 'destructive', onPress: () => useAuthStore.getState().logout()},
          ]);
        }}
        style={styles.logoutBtn}>
        Logout
      </Button>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {marginBottom: 10, marginTop: 16},
  switchRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8},
  apiInput: {marginBottom: 12},
  saveBtn: {alignSelf: 'flex-start', paddingHorizontal: 28},
  testBtn: {marginTop: 24, alignSelf: 'flex-start', paddingHorizontal: 28},
  logoutBtn: {marginTop: 32, alignSelf: 'stretch'},
});
