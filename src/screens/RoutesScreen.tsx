import React, {useMemo, useState} from 'react';
import {FlatList, StyleSheet, Text as RNText} from 'react-native';
import {Card, SearchBar, Text} from '@/components/ui';
import {useThemeColors} from '@/hooks/useTheme';
import {ScreenContainer} from '@/components/ScreenContainer';
import {useCustomers, useRoutes} from '@/hooks/api';
import {useDebouncedValue} from '@/hooks/useDebouncedValue';

export const RoutesScreen = () => {
  const {data: routes = []} = useRoutes();
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search);
  const {data: customers = []} = useCustomers(debounced || undefined);
  const c = useThemeColors();

  const grouped = useMemo(() => {
    return routes.map(route => ({
      ...route,
      customers: customers.filter(customer => customer.routeId === route.routeId),
    }));
  }, [customers, routes]);

  return (
    <ScreenContainer>
      <SearchBar placeholder="Filter route customers" value={search} onChangeText={setSearch} />
      <FlatList
        data={grouped}
        keyExtractor={item => String(item.routeId)}
        renderItem={({item}) => (
          <Card style={styles.card}>
            <RNText style={[styles.routeName, {color: c.text}]}>{item.route ?? 'Unnamed route'}</RNText>
            <RNText style={[styles.routeCount, {color: c.textMuted}]}>
              {item.customers?.length ?? 0} customer{(item.customers?.length ?? 0) !== 1 ? 's' : ''}
            </RNText>
            {(item.customers ?? []).slice(0, 5).map((customer, index) => (
              <RNText
                key={customer.customerId ?? `${customer.customerName ?? 'customer'}-${index}`}
                style={[styles.customerName, {color: c.textMuted}]}>
                • {customer.customerName}
              </RNText>
            ))}
          </Card>
        )}
        ListEmptyComponent={<Text muted>No routes found.</Text>}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  card: {marginBottom: 8},
  routeName: {fontSize: 15, fontWeight: '700', marginBottom: 2},
  routeCount: {fontSize: 12, marginBottom: 8},
  customerName: {fontSize: 13, paddingVertical: 1},
});
