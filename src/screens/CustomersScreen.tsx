import React, {useMemo, useState} from 'react';
import {ActivityIndicator, FlatList} from 'react-native';
import {SearchBar, Text} from '@/components/ui';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import {ScreenContainer} from '@/components/ScreenContainer';
import {CustomerTree} from '@/components/CustomerTree';
import {useDebouncedValue} from '@/hooks/useDebouncedValue';
import {useCustomers} from '@/hooks/api';
import {useOrderStore} from '@/store/orderStore';
import type {RootStackParamList} from '@/navigation/AppNavigator';
import type {Customer} from '@/types/api';

export const CustomersScreen = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 350);
  const {data, isLoading} = useCustomers(debouncedSearch || undefined);
  const setCustomer = useOrderStore(state => state.setCustomer);
  const selectedCustomerId = useOrderStore(state => state.selectedCustomer?.customerId ?? undefined);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Customers'>>();

  const customers = useMemo(() => data ?? [], [data]);

  const handleSelect = (customer: Customer) => {
    setCustomer(customer);
    if (route.params?.returnToOrder) {
      navigation.goBack();
    }
  };

  return (
    <ScreenContainer>
      <SearchBar
        placeholder="Search customer by name/code"
        value={search}
        onChangeText={setSearch}
      />

      {isLoading ? (
        <ActivityIndicator size={40} />
      ) : (
        <FlatList
          data={[{key: 'tree'}]}
          keyExtractor={item => item.key}
          renderItem={() => (
            <CustomerTree customers={customers} onSelect={handleSelect} selectedCustomerId={selectedCustomerId} />
          )}
          ListEmptyComponent={<Text muted>No customers found.</Text>}
        />
      )}
    </ScreenContainer>
  );
};

