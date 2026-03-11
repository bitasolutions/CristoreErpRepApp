import {api} from '@/api/client';
import type {Product} from '@/types/api';

export const productApi = {
  list: async () => {
    const {data} = await api.get<Product[]>('/api/product/list');
    return data;
  },
  listByFilter: async (filter: string) => {
    const {data} = await api.get<Product[]>(`/api/product/list/filter/${encodeURIComponent(filter)}`);
    return data;
  },
  getById: async (productId: string) => {
    const {data} = await api.get<Product>(`/api/product/${productId}`);
    return data;
  },
  listByCategory: async (categoryId: number) => {
    const {data} = await api.get<Product[]>(`/api/product/list/${categoryId}`);
    return data;
  },
  listByCategoryAndSubCategory: async (categoryId: number, subCategoryId: number) => {
    const {data} = await api.get<Product[]>(`/api/product/list/${categoryId}/${subCategoryId}`);
    return data;
  },
};
