import {api} from '@/api/client';
import type {
  ApiResponseWithData,
  CreateVanSaleDto,
  CreateVanSaleResponse,
  Product,
  VanSaleOpenResponse,
  VanSaleSummaryResponse,
  VanSaleDetailResponse,
  VanSaleSummaryItem,
  VanSaleDetail,
} from '@/types/api';

export const vanSaleApi = {
  getOpen: async (loggedUser: string | number) => {
    const {data} = await api.get<VanSaleOpenResponse>(`/api/vansale/open/${loggedUser}`);
    return data;
  },
  createSale: async (payload: CreateVanSaleDto) => {
    const {data} = await api.post<CreateVanSaleResponse>('/api/vansale/sale', payload);
    return data;
  },
  listByDate: async (date: string): Promise<VanSaleSummaryItem[]> => {
    const {data} = await api.get<VanSaleSummaryResponse>(`/api/vansale/date/${date}`);
    return data.response ?? [];
  },
  searchByDate: async (date: string, query: string): Promise<VanSaleSummaryItem[]> => {
    const {data} = await api.get<VanSaleSummaryResponse>(
      `/api/vansale/date/${date}/${encodeURIComponent(query)}`,
    );
    return data.response ?? [];
  },
  getDetails: async (saleNo: string): Promise<VanSaleDetail | undefined> => {
    const {data} = await api.get<VanSaleDetailResponse>(`/api/vansale/details/${saleNo}`);
    return data.response;
  },
  getProducts: async (refNo: string): Promise<Product[]> => {
    const {data} = await api.get<ApiResponseWithData<Product[]>>(`/api/vansale/products/${refNo}`);
    return data.response ?? [];
  },
  searchProducts: async (refNo: string, searchTerm: string): Promise<Product[]> => {
    const {data} = await api.get<ApiResponseWithData<Product[]>>(
      `/api/vansale/products/${refNo}/${encodeURIComponent(searchTerm)}`,
    );
    return data.response ?? [];
  },
  getProductsByCategory: async (refNo: string, categoryId: number): Promise<Product[]> => {
    const {data} = await api.get<ApiResponseWithData<Product[]>>(
      `/api/vansale/products/${refNo}/${categoryId}`,
    );
    return data.response ?? [];
  },
  getProductsByCategoryAndSub: async (
    refNo: string,
    categoryId: number,
    subcategoryId: number,
  ): Promise<Product[]> => {
    const {data} = await api.get<ApiResponseWithData<Product[]>>(
      `/api/vansale/products/${refNo}/${categoryId}/${subcategoryId}`,
    );
    return data.response ?? [];
  },
};
