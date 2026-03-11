import {bluetoothPrinterService} from '@/printers/bluetoothPrinter';
import type {IBLEPrinter} from '@/printers/bluetoothPrinter';
import type {ReceiptData, ReceiptWidth} from '@/printers/types';

export type PrinterType = 'bluetooth';
export type {IBLEPrinter};

export const printerService = {
  init: () => bluetoothPrinterService.init(),
  getDevices: () => bluetoothPrinterService.getDevices(),
  connect: (macAddress: string) => bluetoothPrinterService.connect(macAddress),
  disconnect: () => bluetoothPrinterService.disconnect(),

  printReceipt: async ({
    receipt,
    width,
  }: {
    receipt: ReceiptData;
    width?: ReceiptWidth;
  }) => {
    return bluetoothPrinterService.printReceipt(receipt, width);
  },
};
