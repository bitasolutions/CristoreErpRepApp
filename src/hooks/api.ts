import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {queryKeys} from '@/api/queryKeys';
import {companyApi} from '@/api/endpoints/company';
import {customerApi} from '@/api/endpoints/customers';
import {productApi} from '@/api/endpoints/products';
import {categoryApi} from '@/api/endpoints/categories';
import {routeApi} from '@/api/endpoints/routes';
import {orderApi} from '@/api/endpoints/orders';
import {vanSaleApi} from '@/api/endpoints/vansale';
import type {CreateOrderDto, CreateVanSaleDto} from '@/types/api';

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
    queryFn: () =>
      filter ? customerApi.listByFilter(filter) : customerApi.list(),
  });

export const useProducts = (
  filter?: string,
  categoryId?: number,
  subCategoryId?: number,
) =>
  useQuery({
    queryKey: [
      ...queryKeys.products,
      filter ?? '',
      categoryId ?? -1,
      subCategoryId ?? -1,
    ],
    queryFn: () => {
      if (categoryId && subCategoryId) {
        return productApi.listByCategoryAndSubCategory(
          categoryId,
          subCategoryId,
        );
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
    queryKey: categoryId
      ? queryKeys.subCategories(categoryId)
      : ['subcategories', 'none'],
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

export const useOrdersByCustomerName = (name?: string) =>
  useQuery({
    queryKey: name ? ['orders', 'bycustomer', name] : ['orders', 'bycustomer', 'none'],
    queryFn: () => orderApi.listByCustomerName(name as string),
    enabled: Boolean(name && name.trim().length > 0),
  });

export const useOrdersByCustomer = (customerId?: string) =>
  useQuery({
    queryKey: customerId
      ? queryKeys.ordersByCustomer(customerId)
      : ['orders', 'customer', 'none'],
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

export const useVanSaleOpen = (loggedUser?: string | number) =>
  useQuery({
    queryKey: loggedUser
      ? queryKeys.vanSaleOpen(loggedUser)
      : ['vansale', 'open', 'none'],
    queryFn: () => vanSaleApi.getOpen(loggedUser as string | number),
    enabled: Boolean(loggedUser),
  });

export const useVanSaleProducts = (
  refNo?: string,
  categoryId?: number,
  subCategoryId?: number,
) =>
  useQuery({
    queryKey: queryKeys.vanSaleProducts(refNo ?? '', categoryId, subCategoryId),
    queryFn: () => {
      if (!refNo) return [];
      if (categoryId && subCategoryId) {
        return vanSaleApi.getProductsByCategoryAndSub(refNo, categoryId, subCategoryId);
      }
      if (categoryId) {
        return vanSaleApi.getProductsByCategory(refNo, categoryId);
      }
      return vanSaleApi.getProducts(refNo);
    },
    enabled: Boolean(refNo),
    staleTime: 10 * 60 * 1000,
  });

export const useVanSalesByDate = (date: string) =>
  useQuery({
    queryKey: queryKeys.vanSalesByDate(date),
    queryFn: () => vanSaleApi.listByDate(date),
    enabled: date.length > 0,
  });

export const useVanSalesSearch = (date: string, query?: string) =>
  useQuery({
    queryKey: queryKeys.vanSalesSearch(date, query ?? ''),
    queryFn: () => vanSaleApi.searchByDate(date, query as string),
    enabled: date.length > 0 && Boolean(query && query.trim().length > 0),
  });

export const useVanSaleDetails = (saleNo?: string) =>
  useQuery({
    queryKey: queryKeys.vanSaleDetails(saleNo ?? ''),
    queryFn: () => vanSaleApi.getDetails(saleNo as string),
    enabled: Boolean(saleNo),
  });

export const useCreateVanSale = (loggedUser?: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVanSaleDto) => vanSaleApi.createSale(payload),
    onSuccess: () => {
      if (loggedUser) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.vanSaleOpen(loggedUser),
        });
      }
    },
  });
};
