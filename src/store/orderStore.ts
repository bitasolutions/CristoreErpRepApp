import {create} from 'zustand';
import type {Customer, Product} from '@/types/api';

const parseTaxRate = (value: unknown) => {
  const parsed =
    typeof value === 'number'
      ? value
      : Number.parseFloat(String(value ?? '0'));
  return Number.isFinite(parsed) ? parsed : 0;
};

export interface CartLine {
  productId: string;
  productName: string;
  qty: number;
  unitPrice: number;
  taxRate: number;
  taxCode?: string | null;
  categoryId: number;
}

interface OrderState {
  selectedCustomer?: Customer;
  lines: CartLine[];
  setCustomer: (customer: Customer) => void;
  addProduct: (product: Product) => void;
  addProductWithQty: (product: Product, qty: number) => void;
  updateQty: (productId: string, qty: number) => void;
  removeLine: (productId: string) => void;
  clearOrder: () => void;
  totals: () => {subTotal: number; taxTotal: number; grandTotal: number};
}

export const useOrderStore = create<OrderState>((set, get) => ({
  selectedCustomer: undefined,
  lines: [],
  setCustomer: customer => set({selectedCustomer: customer}),
  addProduct: product =>
    set(state => {
      if (!product.productId) {
        return state;
      }

      const existing = state.lines.find(line => line.productId === product.productId);
      if (existing) {
        return {
          lines: state.lines.map(line =>
            line.productId === product.productId ? {...line, qty: line.qty + 1} : line,
          ),
        };
      }

      return {
        lines: [
          ...state.lines,
          {
            productId: product.productId,
            productName: product.productName ?? 'Unnamed product',
            qty: 1,
            unitPrice: product.sellingPrice,
            taxRate: parseTaxRate(product.taxCharge),
            taxCode: product.taxCode ?? null,
            categoryId: product.categoryId,
          },
        ],
      };
    }),
  addProductWithQty: (product, qty) =>
    set(state => {
      if (!Number.isFinite(qty) || qty <= 0) {
        return state;
      }
      if (!product.productId) {
        return state;
      }
      const existing = state.lines.find(line => line.productId === product.productId);
      if (existing) {
        return {
          lines: state.lines.map(line =>
            line.productId === product.productId ? {...line, qty: line.qty + qty} : line,
          ),
        };
      }

      return {
        lines: [
          ...state.lines,
          {
            productId: product.productId,
            productName: product.productName ?? 'Unnamed product',
            qty,
            unitPrice: product.sellingPrice,
            taxRate: parseTaxRate(product.taxCharge),
            taxCode: product.taxCode ?? null,
            categoryId: product.categoryId,
          },
        ],
      };
    }),
  updateQty: (productId, qty) =>
    set(state => ({
      lines: state.lines
        .map(line => (line.productId === productId ? {...line, qty: Math.max(0, qty)} : line))
        .filter(line => line.qty > 0),
    })),
  removeLine: productId =>
    set(state => ({lines: state.lines.filter(line => line.productId !== productId)})),
  clearOrder: () => set({selectedCustomer: undefined, lines: []}),
  totals: () => {
    const lines = get().lines;
    const grandTotal = Math.round(lines.reduce((sum, line) => sum + line.qty * line.unitPrice, 0));
    const taxTotal = Math.round(lines.reduce((sum, line) => {
      const rate = line.taxRate > 1 ? line.taxRate / 100 : line.taxRate;
      const safeRate = Number.isFinite(rate) ? rate : 0;
      return sum + (line.qty * line.unitPrice * safeRate) / (1 + safeRate);
    }, 0));
    return {
      subTotal: grandTotal - taxTotal,
      taxTotal,
      grandTotal,
    };
  },
}));
