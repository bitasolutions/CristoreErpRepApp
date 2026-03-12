import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text as RNText, View } from 'react-native';
import {
  Button,
  Dialog,
  IconButton,
  Input,
  ListItem,
  Segment,
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
  useCreateVanSale,
  useSubCategories,
  useVanSaleOpen,
  useVanSaleProducts,
} from '@/hooks/api';
import { printerService } from '@/printers';
import { useVanSaleStore } from '@/store/vansaleStore';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { formatCurrency } from '@/utils/format';
import { useAuthStore } from '@/store/authStore';
import { usePreferenceStore } from '@/store/preferenceStore';
import type { CreateVanSaleDto, Product } from '@/types/api';

const CartSeparator = () => {
  const c = useThemeColors();
  return <View style={[styles.separator, { backgroundColor: c.border }]} />;
};

const calcVatAmount = (qty: number, unitPrice: number, taxRate: number) => {
  const rate = taxRate > 1 ? taxRate / 100 : taxRate;
  const safeRate = Number.isFinite(rate) ? rate : 0;
  return qty * unitPrice * safeRate;
};

const paymentModes = ['Cash', 'Mpesa', 'Equity'] as const;

export const VanSaleCreateScreen = () => {
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [subCategoryId, setSubCategoryId] = useState<number | undefined>();
  const [qtyProduct, setQtyProduct] = useState<Product | null>(null);
  const [qtyText, setQtyText] = useState('1');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [location, setLocation] = useState('');
  const [paymentIndex, setPaymentIndex] = useState(0);
  const [transactionNo, setTransactionNo] = useState('');

  const c = useThemeColors();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const authUser = useAuthStore(state => state.user);
  const printLogo = usePreferenceStore(state => state.printLogo);
  const printPin = usePreferenceStore(state => state.printPin);
  const printAfterOrder = usePreferenceStore(state => state.printAfterOrder);
  const loggedUser = authUser?.shortName ?? '';
  const { data: openVanSale, isLoading: openLoading } = useVanSaleOpen(loggedUser);
  const activeVanSale = openVanSale?.response;

  const { data: companyData } = useCompany();
  const { data: categories = [] } = useCategories();
  const { data: subCategories = [] } = useSubCategories(categoryId);
  const refNo = activeVanSale?.refNo ?? undefined;
  const { data: products = [], isLoading: productsLoading } = useVanSaleProducts(
    refNo,
    categoryId,
    subCategoryId,
  );
  const createVanSale = useCreateVanSale(loggedUser);
  const qc = useQueryClient();
  const refresh = () => {
    qc.invalidateQueries({ queryKey: queryKeys.categories });
    if (refNo) {
      qc.invalidateQueries({ queryKey: ['vansale', 'products'] });
    }
    if (loggedUser) {
      qc.invalidateQueries({ queryKey: queryKeys.vanSaleOpen(loggedUser) });
    }
  };

  const selectedCustomer = useVanSaleStore(state => state.selectedCustomer);
  const lines = useVanSaleStore(state => state.lines);
  const addProductWithQty = useVanSaleStore(state => state.addProductWithQty);
  const updateQty = useVanSaleStore(state => state.updateQty);
  const clearSale = useVanSaleStore(state => state.clearSale);
  const totalsValue = useMemo(() => {
    const subTotal = lines.reduce((sum, line) => sum + line.qty * line.unitPrice, 0);
    const taxTotal = lines.reduce(
      (sum, line) => sum + calcVatAmount(line.qty, line.unitPrice, line.taxRate),
      0,
    );
    return { subTotal, taxTotal, grandTotal: subTotal + taxTotal };
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

  useEffect(() => {
    if (selectedCustomer?.customerName) {
      setCustomerName(selectedCustomer.customerName);
    }
    if (!location && selectedCustomer?.physicalLocation) {
      setLocation(selectedCustomer.physicalLocation);
    }
  }, [selectedCustomer, location]);

  useEffect(() => {
    if (paymentModes[paymentIndex] === 'Cash') {
      setTransactionNo('');
    }
  }, [paymentIndex]);

  const submit = async () => {
    if (!activeVanSale?.refNo || !activeVanSale?.refDate) {
      Alert.alert(
        'No Active Van Sale',
        'Open van sale not found. Please open a van sale first.',
      );
      return;
    }

    if (!lines.length) {
      Alert.alert('Empty Cart', 'Add at least one product.');
      return;
    }

    const resolvedCustomerName =
      selectedCustomer?.customerName?.trim() || customerName.trim();
    const resolvedCustomerId = selectedCustomer?.customerId ?? '0';

    if (!resolvedCustomerName) {
      Alert.alert('Customer Required', 'Select a customer or enter a name.');
      return;
    }

    const mode = paymentModes[paymentIndex];
    if ((mode === 'Mpesa' || mode === 'Equity') && !transactionNo.trim()) {
      Alert.alert('Transaction No Required', `Enter the ${mode} transaction number.`);
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

    const now = new Date().toISOString();
    const refDate = activeVanSale.refDate
      ? new Date(activeVanSale.refDate).toISOString()
      : now;
    const amount = totalsValue.grandTotal;
    const payment = { cash: 0, mpesa: 0, equity: 0 };
    if (mode === 'Cash') payment.cash = amount;
    if (mode === 'Mpesa') payment.mpesa = amount;
    if (mode === 'Equity') payment.equity = amount;

    const payload: CreateVanSaleDto = {
      id: 0,
      refNo: activeVanSale.refNo ?? '',
      refDate,
      customerId: resolvedCustomerId,
      customerName: resolvedCustomerName,
      location: location.trim(),
      amount,
      vatAmt: totalsValue.taxTotal,
      entrydate: now,
      action: mode,
      actionNo: transactionNo.trim(),
      entryBy: authUser?.shortName ?? authUser?.repName ?? String(authUser?.id ?? ''),
      cash: payment.cash,
      mpesa: payment.mpesa,
      equity: payment.equity,
      transactionNo: transactionNo.trim(),
      lines: lines.map(line => ({
        id: 0,
        refNo: activeVanSale.refNo ?? '',
        productId: line.productId,
        productName: line.productName,
        issuePrice: line.unitPrice,
        dr: 0,
        cr: line.qty,
        actionNo: transactionNo.trim(),
        actionDate: now,
        entryDate: now,
        action: mode,
      })),
    };

    try {
      const response = await createVanSale.mutateAsync(payload);
      if (response.success) {
        const actionNo = response.response?.actionNo ?? '';
        const saleNo = actionNo || (response.response?.refNo ?? payload.refNo ?? '');

        if (printAfterOrder) {
          try {
            await printerService.printReceipt({
              width: '58mm',
              receipt: {
                company: companyData ?? { companyName: 'Cristore ERP' },
                printLogo,
                printPin,
                customer: resolvedCustomerName || 'Customer',
                date: new Date(now).toLocaleString(),
                orderNumber: String(saleNo),
                documentLabel: 'Sale#:',
                lines: lines as any,
                subTotal: totalsValue.subTotal,
                taxTotal: totalsValue.taxTotal,
                grandTotal: totalsValue.grandTotal,
                location: location.trim(),
                paymentMode: mode,
                transactionNo: transactionNo.trim(),
                cash: payment.cash,
                mpesa: payment.mpesa,
                equity: payment.equity,
              },
            });
          } catch (error) {
            Alert.alert('Van sale saved but failed to print', (error as Error).message);
          }
        }

        Alert.alert('Success', `Van sale ${actionNo || saleNo} saved.`);
        clearSale();
        setCustomerName('');
        setLocation('');
        setTransactionNo('');
        setPaymentIndex(0);
        setConfirmVisible(false);
      } else {
        Alert.alert('Van sale failed', response.message ?? 'Unable to save van sale.');
      }
    } catch (error) {
      Alert.alert('Van sale failed', (error as Error).message);
    }
  };

  const openConfirm = () => {
    if (selectedCustomer?.customerName) {
      setCustomerName(selectedCustomer.customerName);
    }
    if (!location && selectedCustomer?.physicalLocation) {
      setLocation(selectedCustomer.physicalLocation);
    }
    setConfirmVisible(true);
  };

  const openQtyDialog = (product: Product) => {
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
      <View style={styles.content}>
        <View style={[styles.activeCard, { backgroundColor: c.primary, borderColor: c.primary }]}>
          <View style={styles.activeRow}>
            <View style={styles.customerInfo}>
              <Text variant="label" style={styles.activeLabel}>
                ACTIVE VAN SALE
              </Text>
              <Text variant="title" style={styles.activeTitle} numberOfLines={1}>
                {openLoading
                  ? 'Loading...'
                  : activeVanSale?.refNo
                    ? `Ref: ${activeVanSale.refNo}`
                    : 'Not found'}
              </Text>
              {activeVanSale?.refDate ? (
                <Text variant="caption" style={styles.activeCaption}>
                  {new Date(activeVanSale.refDate).toLocaleString()}
                </Text>
              ) : null}
            </View>
            <IconButton name="refresh" size={22} color="#FFFFFF" onPress={refresh} />
          </View>
        </View>

        <View style={[styles.customerCard, { borderColor: c.border, backgroundColor: c.surface }]}>
          <View style={styles.customerRow}>
            <View style={styles.customerInfo}>
              <Text variant="label" muted>
                CUSTOMER
              </Text>
              <Text variant="title" numberOfLines={1}>
                {selectedCustomer?.customerName ?? 'Not selected'}
              </Text>
            </View>
            <Button
              type="outline"
              compact
              onPress={() =>
                navigation.navigate('Customers', { returnToVanSale: true })
              }>
              {selectedCustomer ? 'Change' : 'Select'}
            </Button>
          </View>
        </View>

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
                  onPress={() => openQtyDialog(item)}>
                  Add
                </Button>
              }
            />
          )}
          style={styles.results}
          keyboardShouldPersistTaps="handled"
        />

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

      <CartSummary
        grandTotal={totalsValue.grandTotal}
        loading={createVanSale.isPending}
        disabled={!lines.length}
        onSubmit={openConfirm}
        submitLabel="Submit Van Sale"
      />

      <Dialog
        visible={confirmVisible}
        onDismiss={() => setConfirmVisible(false)}
        title="Confirm Van Sale"
        actions={
          <>
            <Button type="outline" compact onPress={() => setConfirmVisible(false)}>
              Cancel
            </Button>
            <Button type="solid" compact onPress={submit}>
              Confirm
            </Button>
          </>
        }>
        <Input
          label="Customer Name"
          value={selectedCustomer?.customerName ?? customerName}
          onChangeText={setCustomerName}
          placeholder="Enter customer name"
          editable={!selectedCustomer}
          style={styles.field}
        />
        <Input
          label="Location (optional)"
          value={location}
          onChangeText={setLocation}
          placeholder="Enter delivery location"
          style={styles.field}
        />
        <Text variant="label" muted style={styles.sectionLabel}>
          PAYMENT MODE
        </Text>
        <Segment
          options={[...paymentModes]}
          selectedIndex={paymentIndex}
          onSelect={setPaymentIndex}
        />
        {paymentModes[paymentIndex] !== 'Cash' ? (
          <Input
            label="Transaction No"
            value={transactionNo}
            onChangeText={setTransactionNo}
            placeholder="Enter transaction number"
            style={styles.field}
          />
        ) : null}
      </Dialog>

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
  activeCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  activeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  activeLabel: { color: 'rgba(255,255,255,0.85)' },
  activeTitle: { color: '#FFFFFF' },
  activeCaption: { color: 'rgba(255,255,255,0.8)' },
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  customerCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  customerInfo: { flex: 1 },
  field: { marginBottom: 8 },
  sectionLabel: { marginTop: 6, marginBottom: 6 },
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
