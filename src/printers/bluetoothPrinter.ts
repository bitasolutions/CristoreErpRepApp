import {Platform} from 'react-native';
import {BLEPrinter} from 'react-native-thermal-receipt-printer';
import type {IBLEPrinter} from 'react-native-thermal-receipt-printer';
import type {ReceiptData, ReceiptWidth} from '@/printers/types';
import {formatReceiptText} from '@/printers/receiptFormatter';

export type {IBLEPrinter};

export const bluetoothPrinterService = {
  init: async () => {
    if (Platform.OS !== 'android') {
      throw new Error('Bluetooth printing is only supported on Android.');
    }
    await BLEPrinter.init();
  },

  getDevices: async (): Promise<IBLEPrinter[]> => {
    await BLEPrinter.init();
    return BLEPrinter.getDeviceList();
  },

  connect: async (macAddress: string): Promise<IBLEPrinter> => {
    return BLEPrinter.connectPrinter(macAddress);
  },

  disconnect: async () => {
    await BLEPrinter.closeConn();
  },

  printReceipt: async (receipt: ReceiptData, width: ReceiptWidth = '58mm') => {
    if (Platform.OS !== 'android') {
      throw new Error('Bluetooth printing is only supported on Android.');
    }
    const text = formatReceiptText(receipt, width);
    BLEPrinter.printBill(text, {beep: false, cut: true});
  },
};
