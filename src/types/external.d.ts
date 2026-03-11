declare module 'react-native-thermal-receipt-printer' {
  export interface IBLEPrinter {
    device_name: string;
    inner_mac_address: string;
  }

  export const BLEPrinter: {
    init: () => Promise<void>;
    getDeviceList: () => Promise<IBLEPrinter[]>;
    connectPrinter: (inner_mac_address: string) => Promise<IBLEPrinter>;
    closeConn: () => Promise<void>;
    printBill: (text: string, opts?: {beep?: boolean; cut?: boolean}) => void;
    printText: (text: string, opts?: {beep?: boolean; cut?: boolean}) => void;
  };
}
