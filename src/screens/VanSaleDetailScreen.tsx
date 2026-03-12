import React from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text } from '@/components/ui';
import { useThemeColors } from '@/hooks/useTheme';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useVanSaleDetails, useCompany } from '@/hooks/api';
import { formatCurrency } from '@/utils/format';
import { printerService } from '@/printers';
import { usePreferenceStore } from '@/store/preferenceStore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'VanSaleDetail'>;

const formatDisplay = (d: Date) =>
  d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

export const VanSaleDetailScreen = ({ route }: Props) => {
  const { saleNo } = route.params;
  const c = useThemeColors();
  const { data: sale, isLoading } = useVanSaleDetails(saleNo);
  const { data: companyData } = useCompany();
  const printLogo = usePreferenceStore(s => s.printLogo);
  const printPin = usePreferenceStore(s => s.printPin);

  const handleReprint = async () => {
    if (!sale) return;

    try {
      const devices = await printerService.getDevices();
      if (!devices.length) {
        Alert.alert(
          'Printer Not Connected',
          'No printer found. Please connect a printer in Settings > Test Printer.',
        );
        return;
      }

      await printerService.printReceipt({
        width: '58mm',
        receipt: {
          company: companyData ?? { companyName: 'Cristore ERP' },
          printLogo,
          printPin,
          copyLabel: '-Copy-',
          customer: sale.customerName || 'Customer',
          date: new Date(sale.entrydate).toLocaleString(),
          orderNumber: sale.actionNo ?? sale.refNo ?? String(sale.id),
          documentLabel: 'Sale#:',
          lines: sale.lines.map(l => ({
            productId: l.productId ?? '',
            productName: l.productName ?? 'Product',
            qty: l.dr || l.cr,
            unitPrice: l.issuePrice,
            taxRate: 16,
            categoryId: 0,
          })),
          subTotal: sale.amount,
          taxTotal: sale.vatAmt,
          grandTotal: sale.amount + sale.vatAmt,
          location: sale.location ?? undefined,
          paymentMode: sale.PaidVia ?? undefined,
          transactionNo: sale.transactionNo ?? undefined,
        },
      });
      Alert.alert('Success', 'Receipt reprinted successfully.');
    } catch (error) {
      Alert.alert('Print failed', (error as Error).message);
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (!sale) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <Text muted>Sale not found.</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.container}>
        {/* Header info */}
        <View style={[styles.headerCard, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text variant="h2">#{sale.actionNo ?? sale.refNo}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Icon name="calendar" size={14} color={c.textMuted} />
              <Text variant="caption" muted>
                {formatDisplay(new Date(sale.refDate))}
              </Text>
            </View>
            {sale.customerName ? (
              <View style={styles.metaItem}>
                <Icon name="account" size={14} color={c.textMuted} />
                <Text variant="caption" muted>
                  {sale.customerName}
                </Text>
              </View>
            ) : null}
          </View>
          {sale.location ? (
            <View style={styles.metaItem}>
              <Icon name="map-marker" size={14} color={c.textMuted} />
              <Text variant="caption" muted>
                {sale.location}
              </Text>
            </View>
          ) : null}
          {sale.PaidVia ? (
            <View style={[styles.metaItem, { marginTop: 4 }]}>
              <Icon name="credit-card-outline" size={14} color={c.textMuted} />
              <Text variant="caption" muted>
                {sale.PaidVia}
                {sale.transactionNo ? ` - ${sale.transactionNo}` : ''}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Line items */}
        <Text variant="title" style={styles.sectionTitle}>
          Items
        </Text>
        <FlatList
          data={sale.lines}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <View style={[styles.lineCard, { backgroundColor: c.surface, borderColor: c.border }]}>
              <Text variant="body" style={styles.productName}>
                {item.productName ?? item.productId}
              </Text>
              <View style={styles.lineRow}>
                <Text variant="caption" muted>
                  {item.dr || item.cr} x {formatCurrency(item.issuePrice)}
                </Text>
                <Text variant="body" style={styles.lineTotal}>
                  {formatCurrency(item.lineTotal)}
                </Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.list}
          ListFooterComponent={
            <View style={[styles.totalsCard, { backgroundColor: c.surface, borderColor: c.border }]}>
              <View style={styles.totalRow}>
                <Text variant="body">Subtotal</Text>
                <Text variant="body" style={styles.totalValue}>
                  {formatCurrency(sale.amount)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text variant="body">VAT</Text>
                <Text variant="body" style={styles.totalValue}>
                  {formatCurrency(sale.vatAmt)}
                </Text>
              </View>
              <View style={[styles.totalRow, styles.grandRow]}>
                <Text variant="title">Grand Total</Text>
                <Text variant="title" style={styles.totalValue}>
                  {formatCurrency(sale.amount + sale.vatAmt)}
                </Text>
              </View>
            </View>
          }
        />

        {/* Reprint button */}
        <Pressable
          onPress={handleReprint}
          style={[styles.reprintBtn, { backgroundColor: c.primary }]}>
          <Icon name="printer" size={20} color="#FFFFFF" />
          <Text variant="title" style={styles.reprintText}>
            Reprint Receipt
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  metaRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontWeight: '700', marginBottom: 8 },
  list: { paddingBottom: 80 },
  lineCard: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 6,
  },
  productName: { fontWeight: '600' },
  lineRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  lineTotal: { fontWeight: '700' },
  totalsCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  totalValue: { fontWeight: '700' },
  grandRow: { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 8, marginTop: 4, marginBottom: 0 },
  reprintBtn: {
    position: 'absolute',
    right: 0,
    bottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
  },
  reprintText: { color: '#FFFFFF', fontWeight: '700' },
});
