import {api} from '@/api/client';
import type {Customer} from '@/types/api';

export const customerApi = {
  list: async () => {
    const {data} = await api.get<Customer[]>('/api/customer/list');
    return data;
  },
  listByFilter: async (filter: string) => {
    const {data} = await api.get<Customer[]>(`/api/customer/list/${encodeURIComponent(filter)}`);
    return data;
  },
  getById: async (customerId: string) => {
    const {data} = await api.get<Customer>(`/api/customer/${customerId}`);
    return data;
  },
};
