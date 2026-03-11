import {api} from '@/api/client';
import type {Category, SubCategory} from '@/types/api';

export const categoryApi = {
  list: async () => {
    const {data} = await api.get<Category[]>('/api/categories');
    return data;
  },
  subcategories: async (categoryId: number) => {
    const {data} = await api.get<SubCategory[]>(`/api/categories/subcategory/${categoryId}`);
    return data;
  },
};
