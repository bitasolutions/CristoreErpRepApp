import React, { useMemo, useState } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Icon, SearchBar, Text } from '@/components/ui';
import { useThemeColors } from '@/hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useVanSalesByDate, useVanSalesSearch } from '@/hooks/api';
import { formatCurrency } from '@/utils/format';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const formatDateParam = (d: Date) => d.toISOString().split('T')[0];

const formatDisplay = (d: Date) =>
  d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

export const VanSalesSummaryScreen = () => {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const c = useThemeColors();
  const debouncedSearch = useDebouncedValue(search, 350);
  const dateStr = formatDateParam(date);

  const { data: salesByDate = [], isLoading: loadingByDate } = useVanSalesByDate(dateStr);
  const { data: salesBySearch = [], isLoading: loadingBySearch } = useVanSalesSearch(
    dateStr,
    debouncedSearch || undefined,
  );

  const isSearching = debouncedSearch.trim().length > 0;
  const sales = useMemo(
    () => (isSearching ? salesBySearch : salesByDate),
    [isSearching, salesBySearch, salesByDate],
  );
  const isLoading = isSearching ? loadingBySearch : loadingByDate;

  const onDateChange = (_: unknown, selected?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selected) {
      setDate(selected);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.searchDateRow}>
          <SearchBar
            placeholder="Search ref no, customer..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchFlex}
          />
          <Pressable
            style={[styles.dateBtn, { borderColor: c.border, backgroundColor: c.surface }]}
            onPress={() => setShowPicker(true)}>
            <Icon name="calendar" size={16} color={c.primary} />
            <Text variant="body" style={styles.dateText}>
              {formatDisplay(date)}
            </Text>
          </Pressable>
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
          data={sales}
          keyExtractor={item => String(item.id)}
          refreshing={isLoading}
          onRefresh={() => setDate(new Date(date))}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
              <View style={styles.cardTop}>
                <Text variant="h3" style={styles.refNo}>
                  #{item.actionNo ?? item.id}
                </Text>
                <Text variant="title" style={styles.amount}>
                  {formatCurrency(item.amount ?? 0)}
                </Text>
              </View>
              {item.customerName ? (
                <View style={styles.metaItem}>
                  <Icon name="account" size={14} color={c.textMuted} />
                  <Text variant="body">{item.customerName}</Text>
                </View>
              ) : null}
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Icon name="calendar" size={14} color={c.textMuted} />
                  <Text variant="caption" muted>
                    {formatDisplay(new Date(item.refDate))}
                  </Text>
                </View>
                {item.action ? (
                  <View style={styles.metaItem}>
                    <Icon name="credit-card-outline" size={14} color={c.textMuted} />
                    <Text variant="caption" muted>
                      {item.action}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Pressable
                style={styles.viewRow}
                onPress={() =>
                  navigation.navigate('VanSaleDetail', { saleNo: item.actionNo ?? String(item.id) })
                }>
                <Text variant="caption" style={{ color: c.primary, fontWeight: '600' }}>
                  View Details
                </Text>
                <Icon name="chevron-right" size={16} color={c.primary} />
              </Pressable>
            </View>
          )}
          ListEmptyComponent={
            <Text muted style={styles.empty}>
              {isLoading
                ? 'Loading...'
                : isSearching
                  ? 'No van sales found for this search.'
                  : 'No van sales found for this date.'}
            </Text>
          }
          contentContainerStyle={styles.list}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  },
  dateText: { fontWeight: '500' },
  list: { paddingBottom: 24 },
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
  amount: { fontWeight: '700' },
  refNo: {},
  metaRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  viewRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  empty: { textAlign: 'center', marginTop: 20 },
});
