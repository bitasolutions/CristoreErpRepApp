import React, {useState} from 'react';
import {Alert, FlatList, Platform, PermissionsAndroid, StyleSheet, View} from 'react-native';
import {Button, Segment, Text} from '@/components/ui';
import {ScreenContainer} from '@/components/ScreenContainer';
import {useThemeColors} from '@/hooks/useTheme';
import {printerService, type IBLEPrinter} from '@/printers';
import type {ReceiptData, ReceiptWidth} from '@/printers/types';
import {formatReceiptText} from '@/printers/receiptFormatter';
import {useCompany} from '@/hooks/api';
import {usePreferenceStore} from '@/store/preferenceStore';

const requestBluetoothPermissions = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;

  const apiLevel = Platform.Version;

  if (apiLevel >= 31) {
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);
    return Object.values(results).every(r => r === PermissionsAndroid.RESULTS.GRANTED);
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
};

const SAMPLE_LINES = [
  {productId: '1', productName: 'Product Alpha', qty: 2, unitPrice: 15.5, taxRate: 16, categoryId: 1},
  {productId: '2', productName: 'Product Beta', qty: 1, unitPrice: 42.0, taxRate: 16, categoryId: 1},
  {productId: '3', productName: 'Long Product Name Here', qty: 3, unitPrice: 8.75, taxRate: 0, categoryId: 2},
];

export const PrinterTestScreen = () => {
  const c = useThemeColors();
  const {data: companyData} = useCompany();
  const printLogo = usePreferenceStore(state => state.printLogo);
  const printPin = usePreferenceStore(state => state.printPin);
  const [width, setWidth] = useState<ReceiptWidth>('58mm');

  const sampleReceipt: ReceiptData = {
    company: companyData ?? {companyName: 'Cristore ERP'},
    printLogo,
    printPin,
    customer: 'Test Customer',
    date: new Date().toLocaleString(),
    orderNumber: 'TEST-001',
    lines: SAMPLE_LINES,
    subTotal: 73.25,
    taxTotal: 11.76,
    grandTotal: 85.01,
  };

  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<IBLEPrinter[]>([]);
  const [connected, setConnected] = useState<IBLEPrinter | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [previewText, setPreviewText] = useState('');

  const scanDevices = async () => {
    const granted = await requestBluetoothPermissions();
    if (!granted) {
      Alert.alert('Permission Denied', 'Bluetooth permissions are required to scan for printers.');
      return;
    }
    setConnected(null);
    setDevices([]);
    setScanning(true);
    try {
      const list = await printerService.getDevices();
      setDevices(list);
      if (list.length === 0) {
        Alert.alert('No Devices', 'No paired Bluetooth printers found. Pair your printer in Android settings first.');
      }
    } catch (e) {
      Alert.alert('Scan Failed', (e as Error).message);
    } finally {
      setScanning(false);
    }
  };

  const connectDevice = async (device: IBLEPrinter) => {
    setConnecting(true);
    try {
      await printerService.connect(device.inner_mac_address);
      setConnected(device);
    } catch (e) {
      Alert.alert('Connection Failed', (e as Error).message);
    } finally {
      setConnecting(false);
    }
  };

  const printTest = async () => {
    if (!connected) {
      Alert.alert('Not Connected', 'Scan and connect to a Bluetooth printer first.');
      return;
    }
    setPrinting(true);
    try {
      await printerService.printReceipt({receipt: sampleReceipt, width});
      Alert.alert('Success', 'Test receipt printed successfully.');
    } catch (e) {
      Alert.alert('Print Failed', (e as Error).message);
    } finally {
      setPrinting(false);
    }
  };

  return (
    <ScreenContainer>
      <Text variant="title" style={styles.label}>Paper Width</Text>
      <Segment
        options={['58 mm', '80 mm']}
        selectedIndex={width === '58mm' ? 0 : 1}
        onSelect={i => setWidth(i === 0 ? '58mm' : '80mm')}
      />

      <View style={styles.connectRow}>
        <Text variant="title">Bluetooth Printer</Text>
        {connected ? (
          <Text variant="caption" style={[styles.badge, {color: c.success, borderColor: c.success}]}>
            Connected
          </Text>
        ) : null}
      </View>
      {connected ? (
        <Text variant="caption" muted style={styles.connectedName}>
          {connected.device_name || connected.inner_mac_address}
        </Text>
      ) : null}

      <Button
        type="outline"
        loading={scanning}
        onPress={scanDevices}
        style={styles.scanBtn}>
        {scanning ? 'Scanning...' : 'Scan for Printers'}
      </Button>

      {devices.length > 0 ? (
        <FlatList
          data={devices}
          keyExtractor={item => item.inner_mac_address}
          style={[styles.deviceList, {borderColor: c.border}]}
          renderItem={({item}) => {
            const active = item.inner_mac_address === connected?.inner_mac_address;
            return (
              <View style={[styles.deviceRow, {borderBottomColor: c.border}]}>
                <View style={styles.deviceInfo}>
                  <Text variant="body">{item.device_name || 'Unknown Device'}</Text>
                  <Text variant="caption" muted>{item.inner_mac_address}</Text>
                </View>
                <Button
                  type={active ? 'solid' : 'outline'}
                  compact
                  loading={connecting}
                  onPress={() => connectDevice(item)}>
                  {active ? 'Connected' : 'Connect'}
                </Button>
              </View>
            );
          }}
        />
      ) : null}

      <View style={styles.actions}>
        <Button type="outline" onPress={() => setPreviewText(formatReceiptText(sampleReceipt, width))} style={styles.btn}>
          Preview
        </Button>
        <Button type="solid" onPress={printTest} loading={printing} style={styles.btn}>
          Print Test
        </Button>
      </View>

      {previewText ? (
        <View style={[styles.previewBox, {backgroundColor: c.surfaceVariant, borderColor: c.border}]}>
          <Text variant="label" muted style={styles.previewLabel}>RECEIPT PREVIEW</Text>
          <Text variant="body" style={styles.previewText}>{previewText}</Text>
        </View>
      ) : null}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  label: {marginTop: 16, marginBottom: 8},
  connectRow: {flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 6, gap: 10},
  badge: {fontSize: 11, borderWidth: 1, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2},
  connectedName: {marginBottom: 8},
  scanBtn: {alignSelf: 'flex-start', marginBottom: 8},
  deviceList: {borderWidth: 1, borderRadius: 10, maxHeight: 200, marginBottom: 4},
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  deviceInfo: {flex: 1, paddingRight: 8},
  actions: {flexDirection: 'row', gap: 12, marginTop: 20},
  btn: {flex: 1},
  previewBox: {marginTop: 20, borderWidth: 1, borderRadius: 10, padding: 14},
  previewLabel: {marginBottom: 8},
  previewText: {fontFamily: 'monospace', fontSize: 12, lineHeight: 18},
});
