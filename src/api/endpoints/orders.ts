import {api} from '@/api/client';
import type {CreateOrderDto, CreateOrderResponse, CustomerOrder} from '@/types/api';

export const orderApi = {
  list: async () => {
    const {data} = await api.get<CustomerOrder | CustomerOrder[]>('/api/orders');
    if (Array.isArray(data)) {
      return data;
    }
    return data ? [data] : [];
  },
  listByCustomer: async (customerId: string) => {
    const {data} = await api.get<CustomerOrder[]>(`/api/orders/${customerId}`);
    return data ?? [];
  },
  listBySalesAndDate: async (salesId: number, orderDate: string) => {
    const {data} = await api.get<CustomerOrder[]>(`/api/orders/${salesId}/${orderDate}`);
    return data ?? [];
  },
  create: async (payload: CreateOrderDto) => {
    const {data} = await api.post<CreateOrderResponse>('/api/orders/create', payload);
    return data;
  },
};
