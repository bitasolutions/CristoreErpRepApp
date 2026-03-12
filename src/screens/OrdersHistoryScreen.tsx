import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Platform, Pressable, StyleSheet, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Icon, SearchBar, Text } from '@/components/ui';
import { useThemeColors } from '@/hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useOrdersByCustomerName, useOrdersBySalesDate } from '@/hooks/api';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency } from '@/utils/format';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const formatDateParam = (d: Date) => d.toISOString().split('T')[0];

const formatDisplay = (d: Date) =>
  d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

export const OrdersHistoryScreen = () => {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const user = useAuthStore(state => state.user);
  const salesId = user?.id ?? 0;
  const debouncedSearch = useDebouncedValue(search, 350);
  const { data: ordersByDate = [], isLoading: loadingByDate } = useOrdersBySalesDate(
    salesId,
    formatDateParam(date),
  );
  const { data: ordersByCustomer = [], isLoading: loadingByCustomer } =
    useOrdersByCustomerName(debouncedSearch || undefined);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const c = useThemeColors();

  const isSearching = debouncedSearch.trim().length > 0;
  const orders = useMemo(
    () => (isSearching ? ordersByCustomer : ordersByDate),
    [isSearching, ordersByCustomer, ordersByDate],
  );
  const isLoading = isSearching ? loadingByCustomer : loadingByDate;

  const onDateChange = (_: unknown, selected?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selected) {
      setDate(selected);
    }
  };

  const tabs = ['All Orders', 'Pending', 'In Transit', 'Delivered'];

  const getStatus = (order: { isInvoiced: boolean; isDownloaded: boolean }) => {
    if (order.isInvoiced) {
      return { label: 'DELIVERED', color: '#16A34A' };
    }
    if (order.isDownloaded) {
      return { label: 'IN TRANSIT', color: '#F97316' };
    }
    return { label: 'PENDING', color: c.primary };
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        {/* <View style={styles.headerRow}>
          <Pressable
            style={[styles.iconBtn, { backgroundColor: c.surfaceVariant }]}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={20} color={c.text} />
          </Pressable>
          <View style={[styles.headerCenter, { backgroundColor: c.surfaceVariant }]}>
            <Icon name="truck" size={20} color={c.primary} />
          </View>
          <Text variant="h2" style={styles.headerTitle}>Orders</Text>
          <Pressable style={[styles.iconBtn, { backgroundColor: c.surfaceVariant }]}>
            <Icon name="bell-outline" size={20} color={c.text} />
          </Pressable>
        </View> */}

        <View style={styles.searchDateRow}>
          <SearchBar
            placeholder="Search order number, customer..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchFlex}
          />
          <Pressable
            style={[styles.dateBtn, { borderColor: c.border, backgroundColor: c.surface }]}
            onPress={() => setShowPicker(true)}>
            <Icon name="calendar" size={16} color={c.primary} />
            <Text variant="body" style={styles.dateText}>{formatDisplay(date)}</Text>
          </Pressable>
        </View>

        <View style={[styles.tabRow, { borderBottomColor: c.border }]}>
          {tabs.map((tab, idx) => {
            const active = idx === activeTab;
            return (
              <Pressable
                key={tab}
                onPress={() => {
                  if (idx !== 0) {
                    Alert.alert('Coming soon', `${tab} page is coming soon.`);
                    return;
                  }
                  setActiveTab(idx);
                }}
                style={styles.tabBtn}
              >
                <Text
                  variant="body"
                  style={[
                    styles.tabText,
                    { color: active ? c.primary : c.textMuted },
                  ] as any}
                >
                  {tab}
                </Text>
                {active ? (
                  <View style={[styles.tabUnderline, { backgroundColor: c.primary }]} />
                ) : null}
              </Pressable>
            );
          })}
        </View>

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={onDateChange}
          />
        )}

        <FlatList
          data={orders}
          keyExtractor={item => String(item.id)}
          refreshing={isLoading}
          onRefresh={() => setDate(new Date(date))}
          renderItem={({ item }) => {
            const status = getStatus(item);
            return (
              <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
                <View style={styles.cardTop}>
                  <Text variant="caption" style={[styles.status, { color: status.color }] as any}>
                    {status.label}
                  </Text>
                  <Text variant="title" style={styles.amount}>
                    {formatCurrency(item.totalAmount)}
                  </Text>
                </View>
                <Text variant="h3" style={styles.orderNo}>
                  {`#${item.orderNo ?? item.id}`}
                </Text>
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Icon name="calendar" size={14} color={c.textMuted} />
                    <Text variant="caption" muted>
                      {formatDisplay(new Date(item.orderDate))}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Icon name="account" size={14} color={c.textMuted} />
                    <Text variant="caption" muted>
                      {item.customerName ?? item.customerId}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text muted style={styles.empty}>
              {isLoading
                ? 'Loading...'
                : isSearching
                  ? 'No orders found for this search.'
                  : 'No orders found for this date.'}
            </Text>
          }
          contentContainerStyle={styles.list}
        />

        <Pressable
          onPress={() => navigation.navigate('OrderCreate')}
          style={[styles.createBtn, { backgroundColor: c.primary }]}
        >
          <Text variant="title" style={styles.createBtnText}>
            + Create Order
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  headerTitle: { marginLeft: 6, flex: 1 },
  searchDateRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  searchFlex: { flex: 1, marginBottom: 0 },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.2,
    alignSelf: 'flex-start',
  },
  dateText: { fontWeight: '500' },
  tabRow: {
    flexDirection: 'row',
    gap: 12,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  tabBtn: { paddingBottom: 6 },
  tabText: { fontWeight: '600' },
  tabUnderline: { height: 2, marginTop: 6, borderRadius: 2 },
  list: { paddingBottom: 76 },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  status: { letterSpacing: 0.4, fontWeight: '700' },
  amount: { fontWeight: '700' },
  orderNo: { marginTop: 2 },
  metaRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  empty: { textAlign: 'center', marginTop: 20 },
  createBtn: {
    position: 'absolute',
    right: 0,
    bottom: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createBtnText: { color: '#FFFFFF', fontWeight: '700' },
});
