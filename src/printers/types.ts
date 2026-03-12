import type {CartLine} from '@/store/orderStore';

export interface ReceiptCompany {
  companyName: string;
  pinNo?: string | null;
  contact?: string | null;
  physicalAddress?: string | null;
  website?: string | null;
  logo?: string | null;
  footer?: string | null;
}

export interface ReceiptData {
  company: ReceiptCompany;
  printLogo: boolean;
  printPin: boolean;
  customer: string;
  date: string;
  orderNumber: string;
  documentLabel?: string;
  lines: CartLine[];
  subTotal: number;
  taxTotal: number;
  grandTotal: number;
  location?: string;
  paymentMode?: string;
  transactionNo?: string;
  cash?: number;
  mpesa?: number;
  equity?: number;
  copyLabel?: string;
}

export type ReceiptWidth = '58mm' | '80mm';
