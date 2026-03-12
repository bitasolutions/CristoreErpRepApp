export interface ApiResponse {
  success: boolean;
  message?: string | null;
}

export interface ApiResponseWithData<T> extends ApiResponse {
  response?: T;
}

export interface PriceLevelItem {
  id: number;
  priceLevelId: number;
  productId?: string | null;
  priceAmt: number;
  isActive: boolean;
  productName?: string | null;
  sellingPrice: number;
}

export interface PriceLevel {
  id: number;
  customerId?: string | null;
  priceLevel?: string | null;
  isActive: boolean;
  customerName?: string | null;
  priceLevelItems?: PriceLevelItem[] | null;
}

export interface Customer {
  customerId?: string | null;
  customerName?: string | null;
  customerPin?: string | null;
  routeId: number;
  deliveryDay?: string | null;
  parentAccount?: string | null;
  physicalLocation?: string | null;
  hsCode?: string | null;
  hasPriceLevel: boolean;
  shippingAddress?: string | null;
  priceLevelId: number;
  byCredit: boolean;
  isSpecialEcoZone: boolean;
  isParent: boolean;
  priceLevel?: PriceLevel;
  branches?: Customer[] | null;
}

export interface Product {
  productId?: string | null;
  barcode?: string | null;
  productName?: string | null;
  description?: string | null;
  unit?: string | null;
  categoryId: number;
  subcategoryId: number;
  sellingPrice: number;
  balQty: number;
  taxCharge: number;
  taxCode?: string | null;
  vatInclusivePrice: number;
  vatExclusivePrice: number;
  isActive: boolean;
}

export interface Category {
  id: number;
  category?: string | null;
  isActive: boolean;
}

export interface SubCategory {
  subcategoryId: number;
  categoryId: number;
  subcategory?: string | null;
  isActive: boolean;
  category?: string | null;
}

export interface SalesRepRoute {
  id: number;
  salesRepId: number;
  routeId: number;
  route?: string | null;
  routeDescription?: string | null;
}

export interface Salesperson {
  id: number;
  salesRepId: number;
  repName?: string | null;
  shortName?: string | null;
  target: number;
  commission: number;
  routes?: SalesRepRoute[] | null;
  isActive?: boolean | null;
  tel?: string | null;
  email?: string | null;
}

export interface SalesRoute {
  id: number;
  routeId: number;
  route?: string | null;
  routeDirection?: string | null;
  isActive: boolean;
  routeDescription?: string | null;
  customers?: Customer[];
}

export interface OrderLine {
  id?: number;
  orderNo?: string | null;
  orderDate: string;
  productId?: string | null;
  productName?: string | null;
  orderQty: number;
  price: number;
  lineAmount: number;
  taxCode?: string | null;
  vatAmount: number;
  categoryId: number;
}

export interface CustomerOrder {
  id: number;
  orderNo?: string | null;
  orderDate: string;
  salesPersonId: number;
  salesPersonRouteId: number;
  customerId?: string | null;
  customerName?: string | null;
  taxAmount: number;
  totalAmount: number;
  orderMode?: string | null;
  isDownloaded: boolean;
  isInvoiced: boolean;
  device?: string | null;
  invoiceDate?: string | null;
  orderLines?: OrderLine[] | null;
}

export interface CreateOrderDto {
  id?: number;
  orderNo?: string;
  orderDate: string;
  salesPersonId: number;
  salesPersonRouteId: number;
  customerId: string;
  customerName?: string;
  taxAmount: number;
  totalAmount: number;
  orderMode?: string;
  isDownloaded?: boolean;
  isInvoiced?: boolean;
  device?: string;
  orderLines: OrderLine[];
}

export type CreateOrderResponse = ApiResponseWithData<CustomerOrder>;

export interface VanSaleLine {
  id?: number;
  refNo?: string | null;
  productId?: string | null;
  productName?: string | null;
  issuePrice: number;
  dr: number;
  cr: number;
  actionNo?: string | null;
  actionDate: string;
  entryDate: string;
  action?: string | null;
}

export interface VanSaleHeader {
  id?: number;
  refNo?: string | null;
  refDate: string;
  customerId?: string | null;
  customerName?: string | null;
  location?: string | null;
  amount: number;
  vatAmt: number;
  entrydate: string;
  action?: string | null;
  actionNo?: string | null;
  entryBy?: string | null;
  cash: number;
  mpesa: number;
  equity: number;
  transactionNo?: string | null;
  lines: VanSaleLine[];
}

export type CreateVanSaleDto = VanSaleHeader;

export interface ActiveVanSale {
  id: number;
  refNo?: string | null;
  refDate?: string | null;
  entryBy?: string | null;
  initialAmt: number;
  closingAmt: number;
  issuedTo?: string | null;
  vehicleReg?: string | null;
  driver?: string | null;
  status?: string | null;
}

export type VanSaleOpenResponse = ApiResponseWithData<ActiveVanSale>;
export type CreateVanSaleResponse = ApiResponseWithData<VanSaleHeader>;

export interface VanSaleSummaryItem {
  id: number;
  refNo?: string | null;
  refDate: string;
  customerId?: string | null;
  customerName?: string | null;
  location?: string | null;
  amount: number;
  vatAmt: number;
  downloaded: boolean;
  entrydate: string;
  action?: string | null;
  actionNo?: string | null;
  entryBy?: string | null;
}

export type VanSaleSummaryResponse = ApiResponseWithData<VanSaleSummaryItem[]>;

export interface VanSaleDetailLine {
  id: number;
  refNo?: string | null;
  productId?: string | null;
  productName?: string | null;
  issuePrice: number;
  dr: number;
  cr: number;
  actionNo?: string | null;
  actionDate: string;
  entryDate: string;
  action?: string | null;
  lineTotal: number;
}

export interface VanSaleDetail {
  id: number;
  refNo?: string | null;
  refDate: string;
  customerId?: string | null;
  customerName?: string | null;
  location?: string | null;
  amount: number;
  vatAmt: number;
  downloaded: boolean;
  entrydate: string;
  action?: string | null;
  actionNo?: string | null;
  entryBy?: string | null;
  PaidVia?: string | null;
  transactionNo?: string | null;
  lines: VanSaleDetailLine[];
}

export type VanSaleDetailResponse = ApiResponseWithData<VanSaleDetail>;

export interface AuthUser {
  id: number;
  repName: string;
  shortName: string;
  appPwd: string;
  isActive: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface Company {
  id: number;
  companyName?: string | null;
  pinNo?: string | null;
  postalAddress?: string | null;
  physicalAddress?: string | null;
  emailAddress?: string | null;
  website?: string | null;
  contact?: string | null;
  logo?: string | null;
  printLogo: boolean;
  footer?: string | null;
  header?: string | null;
  invoiceTerms?: string | null;
  paymentTerms?: string | null;
  etimsUrl?: string | null;
  etimsBranch?: string | null;
  etimsDeviceNo?: string | null;
  uploaded: boolean;
  esdSerialNo?: string | null;
  esdCuNo?: string | null;
  licenseDate?: string | null;
  enableEtims: boolean;
  etimsOffline: boolean;
  etimsItemId: number;
  etimsSaleno: number;
  etimsPurchaseNo: number;
  etimsStkIoNo: number;
}
