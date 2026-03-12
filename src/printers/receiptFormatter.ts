import type {ReceiptData, ReceiptWidth} from '@/printers/types';
import {formatCurrency} from '@/utils/format';

/**
 * react-native-thermal-receipt-printer printBill() tags:
 *   <C>text</C>   — center
 *   <B>text</B>   — bold
 *   <CB>text</CB> — center + bold
 *   Plain text     — left-aligned normal
 */

const rightAlign = (label: string, value: string, width: number) => {
  const gap = width - label.length - value.length;
  return label + ' '.repeat(Math.max(1, gap)) + value;
};

export const formatReceiptText = (
  receipt: ReceiptData,
  width: ReceiptWidth = '58mm',
) => {
  const maxChars = width === '58mm' ? 32 : 48;
  const sep = '-'.repeat(maxChars);
  const out: string[] = [];

  // ── Header ──

  out.push(`<CB>${receipt.company.companyName}</CB>`);
  if (receipt.printPin && receipt.company.pinNo) {
    out.push(`<C>PIN: ${receipt.company.pinNo}</C>`);
  }
  if (receipt.company.contact) {
    out.push(`<C>${receipt.company.contact}</C>`);
  }
  if (receipt.company.physicalAddress) {
    out.push(`<C>${receipt.company.physicalAddress}</C>`);
  }
  if (receipt.company.website) {
    out.push(`<C>${receipt.company.website}</C>`);
  }

  out.push(sep);
  if (receipt.copyLabel) {
    out.push(`<C><B>${receipt.copyLabel}</B></C>`);
  }
  const docLabel = receipt.documentLabel ?? 'Order';
  out.push(`${docLabel}: ${receipt.orderNumber}`);
  out.push(`Date:  ${receipt.date}`);
  out.push(`<M>CUST: ${receipt.customer}</M>`);
  if (receipt.location) {
    out.push(`LOC:  ${receipt.location}`);
  }
  if (receipt.paymentMode) {
    out.push(`PAY:  ${receipt.paymentMode}`);
  }
  if (receipt.transactionNo) {
    out.push(`TRN:  ${receipt.transactionNo}`);
  }
  const payLines: Array<[string, number | undefined]> = [
    ['Cash', receipt.cash],
    ['Mpesa', receipt.mpesa],
    ['Equity', receipt.equity],
  ];
  for (const [label, value] of payLines) {
    if (value && value > 0) {
      out.push(rightAlign(`${label}:`, formatCurrency(value), maxChars));
    }
  }
  out.push(sep);

  // ── Line items (2-line layout) ──
  for (const line of receipt.lines) {
    const lineTotal = line.qty * line.unitPrice;
    out.push(line.productName);
    const detail = `${line.qty} x ${formatCurrency(line.unitPrice)}`;
    const total = formatCurrency(lineTotal);
    out.push(rightAlign(detail, total, maxChars));
    out.push(sep);
  }

  // ── Totals ──
  out.push(
    `<M>${rightAlign('Subtotal:', formatCurrency(receipt.subTotal), maxChars)}</M>`,
  );
  out.push(
    `<M>${rightAlign('Tax:', formatCurrency(receipt.taxTotal), maxChars)}</M>`,
  );
  out.push(
    `<M>${rightAlign('Grand Total:', formatCurrency(receipt.grandTotal), maxChars)}</M>`,
  );
  out.push(sep);

  // ── Footer ──
  if (receipt.company.footer) {
    out.push(`<C>${receipt.company.footer}</C>`);
  } else {
    out.push('<C>Thank you</C>');
  }
  out.push('');
  out.push('');

  return out.join('\n');
};
