import {Platform} from 'react-native';
import type {ReceiptData, ReceiptWidth} from '@/printers/types';
import {formatReceiptText} from '@/printers/receiptFormatter';

type USBDevice = {device_name: string; vendor_id: number; product_id: number};

const getUSBPrinter = () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const {USBPrinter} = require('react-native-thermal-receipt-printer');
    return USBPrinter as {
      init: () => Promise<void>;
      getDeviceList: () => Promise<USBDevice[]>;
      connectPrinter: (vendorId: number, productId: number) => Promise<USBDevice>;
      printBill: (text: string) => void;
      closeConn: () => void;
    };
  } catch {
    throw new Error(
      'react-native-thermal-receipt-printer is unavailable. Build a custom dev client or native app.',
    );
  }
};

export const posPrinterService = {
  /** Returns list of connected USB printer devices */
  getDevices: async (): Promise<USBDevice[]> => {
    if (Platform.OS !== 'android') {
      throw new Error('USB POS printing is only supported on Android.');
    }
    const USBPrinter = getUSBPrinter();
    await USBPrinter.init();
    return USBPrinter.getDeviceList();
  },

  /** Connect to a specific USB printer by vendorId + productId */
  connect: async (vendorId: number, productId: number): Promise<void> => {
    const USBPrinter = getUSBPrinter();
    await USBPrinter.connectPrinter(vendorId, productId);
  },

  printReceipt: async (receipt: ReceiptData, width: ReceiptWidth = '58mm') => {
    if (Platform.OS !== 'android') {
      throw new Error('USB POS printing is only supported on Android.');
    }
    const USBPrinter = getUSBPrinter();
    const text = formatReceiptText(receipt, width);
    USBPrinter.printBill(text);
  },
};

export type {USBDevice};
