import React, {useState} from 'react';
import {FlatList, Platform, Pressable, StyleSheet, View} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Card, FAB, Icon, Text} from '@/components/ui';
import {useThemeColors} from '@/hooks/useTheme';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ScreenContainer} from '@/components/ScreenContainer';
import {useOrdersBySalesDate} from '@/hooks/api';
import {useAuthStore} from '@/store/authStore';
import {formatCurrency} from '@/utils/format';
import type {RootStackParamList} from '@/navigation/AppNavigator';

const formatDateParam = (d: Date) => d.toISOString().split('T')[0];

const formatDisplay = (d: Date) =>
  d.toLocaleDateString(undefined, {year: 'numeric', month: 'short', day: 'numeric'});

export const OrdersHistoryScreen = () => {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const user = useAuthStore(state => state.user);
  const salesId = user?.id ?? 0;
  const {data: orders = [], isLoading} = useOrdersBySalesDate(salesId, formatDateParam(date));
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const c = useThemeColors();

  const onDateChange = (_: unknown, selected?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selected) {
      setDate(selected);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        {/* Date picker row */}
        <View style={styles.dateRow}>
          <Pressable
            style={[styles.dateBtn, {borderColor: c.border, backgroundColor: c.surface}]}
            onPress={() => setShowPicker(true)}>
            <Icon name="calendar" size={18} color={c.primary} />
            <Text variant="body" style={styles.dateText}>{formatDisplay(date)}</Text>
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
          data={orders}
          keyExtractor={item => String(item.id)}
          refreshing={isLoading}
          onRefresh={() => setDate(new Date(date))}
          renderItem={({item}) => (
            <Card style={styles.card}>
              <Text variant="title">{`Order #${item.orderNo ?? item.id}`}</Text>
              <Text variant="caption" muted style={styles.orderDate}>
                {new Date(item.orderDate).toLocaleString()}
              </Text>
              <View style={[styles.divider, {backgroundColor: c.border}]} />
              <View style={styles.row}>
                <Text variant="caption" muted>Customer</Text>
                <Text variant="caption">{item.customerName ?? item.customerId}</Text>
              </View>
              <View style={styles.row}>
                <Text variant="title">Total</Text>
                <Text variant="title">{formatCurrency(item.totalAmount)}</Text>
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <Text muted style={styles.empty}>
              {isLoading ? 'Loading...' : 'No orders found for this date.'}
            </Text>
          }
          contentContainerStyle={styles.list}
        />

        <FAB
          icon="plus"
          label="Create Order"
          style={styles.fab}
          onPress={() => navigation.navigate('OrderCreate')}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  dateRow: {marginBottom: 10},
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    alignSelf: 'flex-start',
  },
  dateText: {fontWeight: '500'},
  list: {paddingBottom: 88},
  card: {marginBottom: 8},
  orderDate: {marginTop: 2, marginBottom: 8},
  divider: {height: 1, marginBottom: 8},
  row: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4},
  empty: {textAlign: 'center', marginTop: 24},
  fab: {position: 'absolute', right: 0, bottom: 16},
});
