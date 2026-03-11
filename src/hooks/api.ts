import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {queryKeys} from '@/api/queryKeys';
import {companyApi} from '@/api/endpoints/company';
import {customerApi} from '@/api/endpoints/customers';
import {productApi} from '@/api/endpoints/products';
import {categoryApi} from '@/api/endpoints/categories';
import {routeApi} from '@/api/endpoints/routes';
import {orderApi} from '@/api/endpoints/orders';
import type {CreateOrderDto} from '@/types/api';

export const useCompany = () =>
  useQuery({
    queryKey: queryKeys.company,
    queryFn: companyApi.get,
    staleTime: Infinity, // rarely changes — refresh manually via Settings
  });

export const useRefreshCompany = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({queryKey: queryKeys.company});
};

export const useCustomers = (filter?: string) =>
  useQuery({
    queryKey: filter ? [...queryKeys.customers, filter] : queryKeys.customers,
    queryFn: () => (filter ? customerApi.listByFilter(filter) : customerApi.list()),
  });

export const useProducts = (filter?: string, categoryId?: number, subCategoryId?: number) =>
  useQuery({
    queryKey: [...queryKeys.products, filter ?? '', categoryId ?? -1, subCategoryId ?? -1],
    queryFn: () => {
      if (categoryId && subCategoryId) {
        return productApi.listByCategoryAndSubCategory(categoryId, subCategoryId);
      }
      if (categoryId) {
        return productApi.listByCategory(categoryId);
      }
      if (filter) {
        return productApi.listByFilter(filter);
      }
      return productApi.list();
    },
    staleTime: 10 * 60 * 1000, // refetch product quantities after 10 minutes
  });

export const useCategories = () =>
  useQuery({
    queryKey: queryKeys.categories,
    queryFn: categoryApi.list,
    staleTime: Infinity, // categories rarely change — cache indefinitely
  });

export const useSubCategories = (categoryId?: number) =>
  useQuery({
    queryKey: categoryId ? queryKeys.subCategories(categoryId) : ['subcategories', 'none'],
    queryFn: () => categoryApi.subcategories(categoryId as number),
    enabled: Boolean(categoryId),
    staleTime: Infinity, // subcategories rarely change — cache indefinitely
  });

export const useRoutes = () =>
  useQuery({
    queryKey: queryKeys.routes,
    queryFn: routeApi.listRoutes,
  });

export const useSalespeople = () =>
  useQuery({
    queryKey: queryKeys.salespeople,
    queryFn: routeApi.listSalespeople,
  });

export const useOrders = () =>
  useQuery({
    queryKey: queryKeys.orders,
    queryFn: orderApi.list,
  });

export const useOrdersBySalesDate = (salesId: number, orderDate: string) =>
  useQuery({
    queryKey: queryKeys.ordersBySalesDate(salesId, orderDate),
    queryFn: () => orderApi.listBySalesAndDate(salesId, orderDate),
    enabled: salesId > 0 && orderDate.length > 0,
  });

export const useOrdersByCustomer = (customerId?: string) =>
  useQuery({
    queryKey: customerId ? queryKeys.ordersByCustomer(customerId) : ['orders', 'customer', 'none'],
    queryFn: () => orderApi.listByCustomer(customerId as string),
    enabled: Boolean(customerId),
  });

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderDto) => orderApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.orders});
    },
  });
};
