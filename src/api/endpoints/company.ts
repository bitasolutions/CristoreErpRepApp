import {api} from '@/api/client';
import type {Company} from '@/types/api';
import type {ReceiptCompany} from '@/printers/types';

/** Fetch only the fields needed for receipts to keep the cache small. */
export const companyApi = {
  get: async (): Promise<ReceiptCompany> => {
    const {data} = await api.get<Company>('/api/company');
    return {
      companyName: data.companyName ?? 'Cristore ERP',
      pinNo: data.pinNo,
      contact: data.contact,
      physicalAddress: data.physicalAddress,
      website: data.website,
      footer: data.footer,
    };
  },
};
