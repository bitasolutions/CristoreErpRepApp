import {api} from '@/api/client';
import type {SalesRoute, Salesperson} from '@/types/api';

export const routeApi = {
  listRoutes: async () => {
    const {data} = await api.get<SalesRoute[]>('/api/salesperson/routes/list');
    return data;
  },
  listSalespeople: async () => {
    const {data} = await api.get<Salesperson[]>('/api/salesperson/list');
    return data;
  },
  getSalespersonById: async (id: number) => {
    const {data} = await api.get<Salesperson>(`/api/salesperson/${id}`);
    return data;
  },
};
