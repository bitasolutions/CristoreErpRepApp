import {create} from 'zustand';
import type {PrinterType} from '@/printers';
import {API_BASE_URL} from '@/constants/config';
import {setApiBaseUrl as setApiBaseUrlClient} from '@/api/client';

type ThemeMode = 'light' | 'dark';

interface PreferenceState {
  mode: ThemeMode;
  printerType: PrinterType;
  printLogo: boolean;
  printPin: boolean;
  printAfterOrder: boolean;
  apiBaseUrl: string;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setPrinterType: (printerType: PrinterType) => void;
  setPrintLogo: (value: boolean) => void;
  setPrintPin: (value: boolean) => void;
  setPrintAfterOrder: (value: boolean) => void;
  setApiBaseUrl: (url: string) => void;
}

export const usePreferenceStore = create<PreferenceState>(set => ({
  mode: 'light',
  printerType: 'bluetooth',
  printLogo: false,
  printPin: true,
  printAfterOrder: true,
  apiBaseUrl: API_BASE_URL,
  setMode: mode => set({mode}),
  toggleMode: () => set(state => ({mode: state.mode === 'light' ? 'dark' : 'light'})),
  setPrinterType: printerType => set({printerType}),
  setPrintLogo: printLogo => set({printLogo}),
  setPrintPin: printPin => set({printPin}),
  setPrintAfterOrder: printAfterOrder => set({printAfterOrder}),
  setApiBaseUrl: url =>
    set(() => {
      setApiBaseUrlClient(url);
      return {apiBaseUrl: url};
    }),
}));
