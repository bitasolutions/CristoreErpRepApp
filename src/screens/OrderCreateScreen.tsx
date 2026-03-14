import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text as RNText, View } from 'react-native';
import {
  Button,
  Dialog,
  IconButton,
  Input,
  ListItem,
  Text,
} from '@/components/ui';
import { useThemeColors } from '@/hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '@/components/ScreenContainer';
import { CartSummary } from '@/components/CartSummary';
import { CategoryChips } from '@/components/CategoryChips';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import {
  useCategories,
  useCompany,
  useCreateOrder,
  useProducts,
  useSubCategories,
} from '@/hooks/api';
import { printerService } from '@/printers';
import { useOrderStore } from '@/store/orderStore';
import { usePreferenceStore } from '@/store/preferenceStore';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { formatCurrency } from '@/utils/format';
import { getDeviceName } from '@/utils/device';
import { useAuthStore } from '@/store/authStore';
import type { Product } from '@/types/api';

const CartSeparator = () => {
  const c = useThemeColors();
  return <View style={[styles.separator, { backgroundColor: c.border }]} />;
};

const calcVatAmount = (qty: number, unitPrice: number, taxRate: number) => {
  const rate = taxRate > 1 ? taxRate / 100 : taxRate;
  const safeRate = Number.isFinite(rate) ? rate : 0;
  return (qty * unitPrice * safeRate) / (1 + safeRate);
};

export const OrderCreateScreen = () => {
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [subCategoryId, setSubCategoryId] = useState<number | undefined>();
  const [qtyProduct, setQtyProduct] = useState<Product | null>(null);
  const [qtyText, setQtyText] = useState('1');
  const printLogo = usePreferenceStore(state => state.printLogo);
  const printPin = usePreferenceStore(state => state.printPin);
  const printAfterOrder = usePreferenceStore(state => state.printAfterOrder);
  const { data: companyData } = useCompany();
  const c = useThemeColors();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { data: categories = [] } = useCategories();
  const { data: subCategories = [] } = useSubCategories(categoryId);
  const { data: products = [], isLoading: productsLoading } = useProducts(
    undefined,
    categoryId,
    subCategoryId,
  );
  const createOrder = useCreateOrder();
  const qc = useQueryClient();
  const refresh = () => {
    qc.invalidateQueries({ queryKey: queryKeys.categories });
    qc.invalidateQueries({ queryKey: queryKeys.products });
  };

  const selectedCustomer = useOrderStore(state => state.selectedCustomer);
  const lines = useOrderStore(state => state.lines);
  const addProductWithQty = useOrderStore(state => state.addProductWithQty);
  const updateQty = useOrderStore(state => state.updateQty);
  const clearOrder = useOrderStore(state => state.clearOrder);
  const totalsValue = useMemo(() => {
    const grandTotal = Math.round(lines.reduce((sum, line) => sum + line.qty * line.unitPrice, 0));
    const taxTotal = Math.round(lines.reduce(
      (sum, line) => sum + calcVatAmount(line.qty, line.unitPrice, line.taxRate),
      0,
    ));
    return { subTotal: grandTotal - taxTotal, taxTotal, grandTotal };
  }, [lines]);
  const sortedProducts = useMemo(
    () =>
      [...products].sort((a, b) =>
        (a.productName ?? '').localeCompare(b.productName ?? ''),
      ),
    [products],
  );

  useEffect(() => {
    if (categoryId && subCategories.length > 0 && !subCategoryId) {
      setSubCategoryId(subCategories[0]?.subcategoryId);
    }
  }, [categoryId, subCategories, subCategoryId]);

  const submit = async () => {
    if (!selectedCustomer) {
      Alert.alert(
        'Select Customer',
        'Please select a customer from the Customers screen first.',
      );
      return;
    }
    if (!selectedCustomer.customerId) {
      Alert.alert(
        'Invalid Customer',
        'Selected customer does not have a customerId.',
      );
      return;
    }

    if (!lines.length) {
      Alert.alert('Empty Cart', 'Add at least one product.');
      return;
    }

    // If printing is enabled, verify printer is connected before saving
    if (printAfterOrder) {
      try {
        const devices = await printerService.getDevices();
        if (!devices.length) {
          Alert.alert(
            'Printer Not Connected',
            'No printer found. Please connect a printer in Settings > Test Printer, or disable "Print After Order" in Settings.',
            [{ text: 'OK' }],
          );
          return;
        }
      } catch {
        Alert.alert(
          'Printer Not Available',
          'Could not reach the printer. Please connect a printer or disable "Print After Order" in Settings.',
          [{ text: 'OK' }],
        );
        return;
      }
    }

    const authUser = useAuthStore.getState().user;
    const payload = {
      customerId: selectedCustomer.customerId ?? '',
      customerName: selectedCustomer.customerName ?? '',
      orderDate: new Date().toISOString(),
      salesPersonId: authUser?.id ?? 0,
      salesPersonRouteId: selectedCustomer.routeId ?? 0,
      taxAmount: totalsValue.taxTotal,
      totalAmount: totalsValue.grandTotal,
      orderMode: 'MOBILE',
      device: getDeviceName(),
      orderLines: lines.map(line => ({
        productId: line.productId,
        productName: line.productName,
        orderQty: line.qty,
        price: line.unitPrice,
        lineAmount: line.qty * line.unitPrice,
        vatAmount: calcVatAmount(line.qty, line.unitPrice, line.taxRate),
        taxCode: line.taxCode ?? null,
        categoryId: line.categoryId,
        orderDate: new Date().toISOString(),
      })),
    };

    try {
      const response = await createOrder.mutateAsync(payload);
      if (response.success) {
        const orderNo = response.response?.orderNo ?? response.response?.id ?? '';

        if (printAfterOrder) {
          try {
            await printerService.printReceipt({
              width: '58mm',
              receipt: {
                company: companyData ?? { companyName: 'Cristore ERP' },
                printLogo,
                printPin,
                customer: selectedCustomer.customerName ?? 'Customer',
                date: new Date().toLocaleString(),
                orderNumber: String(orderNo),
                lines,
                subTotal: totalsValue.subTotal,
                taxTotal: totalsValue.taxTotal,
                grandTotal: totalsValue.grandTotal,
              },
            });
          } catch (error) {
            Alert.alert('Order saved but failed to print', (error as Error).message);
          }
        }

        Alert.alert('Success', `Order ${orderNo} created.`);
        clearOrder();
      }
    } catch (error) {
      Alert.alert('Order failed', (error as Error).message);
    }
  };

  const openQtyDialog = (product: Product) => {
    if (!selectedCustomer?.customerId) {
      Alert.alert(
        'Select Customer',
        'Please select a customer before adding items.',
      );
      return;
    }
    setQtyProduct(product);
    setQtyText('1');
  };

  const confirmQty = () => {
    if (!qtyProduct) {
      return;
    }
    const qty = Number(qtyText);
    if (!Number.isFinite(qty) || qty <= 0) {
      Alert.alert('Invalid quantity', 'Enter a quantity greater than 0.');
      return;
    }
    addProductWithQty(qtyProduct, Math.floor(qty));
    setQtyProduct(null);
    setQtyText('1');
  };

  return (
    <ScreenContainer>
      {/* Scrollable content grows to fill space, pushing CartSummary to bottom */}
      <View style={styles.content}>
        {/* Customer row */}
        <View style={styles.customerRow}>
          <View style={styles.customerInfo}>
            <Text variant="label" muted>
              CUSTOMER
            </Text>
            <Text variant="title" numberOfLines={1}>
              {selectedCustomer?.customerName ?? 'Not selected'}
            </Text>
          </View>
          <IconButton name="refresh" size={22} onPress={refresh} />
          <Button
            type="outline"
            compact
            onPress={() =>
              navigation.navigate('Customers', { returnToOrder: true })
            }>
            {selectedCustomer ? 'Change' : 'Select'}
          </Button>
        </View>

        {/* Category filters */}
        <CategoryChips
          categories={categories}
          selectedCategoryId={categoryId}
          onSelectCategory={id => {
            setCategoryId(id);
            setSubCategoryId(undefined);
          }}
          subCategories={subCategories}
          selectedSubCategoryId={subCategoryId}
          onSelectSubCategory={setSubCategoryId}
          hideAll
        />

        {/* Product list */}
        {productsLoading ? (
          <ActivityIndicator size="large" color={c.primary} style={styles.loader} />
        ) : null}
        <FlatList
          data={sortedProducts.slice(0, 30)}
          keyExtractor={item => String(item.productId)}
          renderItem={({ item }) => (
            <ListItem
              title={item.productName ?? ''}
              description={`${formatCurrency(item.sellingPrice)}  •  Stock: ${item.balQty ?? 0}`}
              right={
                <Button
                  type="outline"
                  compact
                  disabled={!selectedCustomer?.customerId}
                  onPress={() => openQtyDialog(item)}>
                  Add
                </Button>
              }
            />
          )}
          style={styles.results}
          keyboardShouldPersistTaps="handled"
        />

        {/* Cart section */}
        <View style={[styles.cartHeader, { borderTopColor: c.border }]}>
          <Text variant="label" muted>
            CART{lines.length > 0 ? ` (${lines.length})` : ''}
          </Text>
        </View>
        <FlatList
          data={lines}
          keyExtractor={item => String(item.productId)}
          renderItem={({ item }) => (
            <View style={styles.cartRow}>
              <View style={styles.cartInfo}>
                <RNText
                  style={[styles.cartName, { color: c.text }]}
                  numberOfLines={1}>
                  {item.productName}
                </RNText>
                <RNText style={[styles.cartPrice, { color: c.textMuted }]}>
                  {formatCurrency(item.unitPrice)} × {item.qty} ={' '}
                  {formatCurrency(item.unitPrice * item.qty)}
                </RNText>
              </View>
              <View style={styles.qtyControls}>
                <IconButton
                  name="minus"
                  size={18}
                  onPress={() => updateQty(item.productId, item.qty - 1)}
                />
                <RNText style={[styles.qtyText, { color: c.text }]}>
                  {item.qty}
                </RNText>
                <IconButton
                  name="plus"
                  size={18}
                  onPress={() => updateQty(item.productId, item.qty + 1)}
                />
              </View>
            </View>
          )}
          style={styles.cartList}
          ItemSeparatorComponent={CartSeparator}
          ListEmptyComponent={
            <RNText style={[styles.emptyCart, { color: c.textMuted }]}>
              No items in cart
            </RNText>
          }
        />
      </View>

      {/* Submit — pinned at bottom */}
      <CartSummary
        grandTotal={totalsValue.grandTotal}
        loading={createOrder.isPending}
        disabled={!selectedCustomer?.customerId || !lines.length}
        onSubmit={submit}
      />

      {/* Qty dialog */}
      <Dialog
        visible={Boolean(qtyProduct)}
        onDismiss={() => setQtyProduct(null)}
        title="Add to Cart"
        actions={
          <>
            <Button type="outline" compact onPress={() => setQtyProduct(null)}>
              Cancel
            </Button>
            <Button type="solid" compact onPress={confirmQty}>
              Add
            </Button>
          </>
        }>
        <Text variant="title" style={styles.dlgProduct}>
          {qtyProduct?.productName ?? ''}
        </Text>
        <Input
          label="Quantity"
          value={qtyText}
          onChangeText={setQtyText}
          keyboardType="number-pad"
        />
      </Dialog>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: { flex: 1 },
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  customerInfo: { flex: 1 },
  loader: { marginVertical: 8 },
  results: { maxHeight: 150 },
  cartHeader: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 4,
    marginBottom: 4,
  },
  cartList: { flex: 1 },
  cartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  cartInfo: { flex: 1, paddingRight: 4 },
  cartName: { fontSize: 14, fontWeight: '500' },
  cartPrice: { fontSize: 12, marginTop: 1 },
  qtyControls: { flexDirection: 'row', alignItems: 'center' },
  qtyText: { minWidth: 26, textAlign: 'center', fontSize: 14, fontWeight: '600' },
  separator: { height: StyleSheet.hairlineWidth, marginHorizontal: 2 },
  emptyCart: { fontSize: 13, textAlign: 'center', paddingVertical: 10 },
  dlgProduct: { marginBottom: 12 },
});
