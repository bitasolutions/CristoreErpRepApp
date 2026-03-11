import React, {useEffect} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer, DefaultTheme, DarkTheme} from '@react-navigation/native';
import {usePreferenceStore} from '@/store/preferenceStore';
import {useAuthStore} from '@/store/authStore';
import {LoginScreen} from '@/screens/LoginScreen';
import {DashboardScreen} from '@/screens/DashboardScreen';
import {CustomersScreen} from '@/screens/CustomersScreen';
import {ProductsScreen} from '@/screens/ProductsScreen';
import {CategoriesScreen} from '@/screens/CategoriesScreen';
import {RoutesScreen} from '@/screens/RoutesScreen';
import {OrderCreateScreen} from '@/screens/OrderCreateScreen';
import {OrdersHistoryScreen} from '@/screens/OrdersHistoryScreen';
import {SettingsScreen} from '@/screens/SettingsScreen';
import {PrinterTestScreen} from '@/screens/PrinterTestScreen';

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  Customers: {returnToOrder?: boolean};
  Products: undefined;
  Categories: undefined;
  Routes: undefined;
  OrderCreate: undefined;
  OrdersHistory: undefined;
  Settings: undefined;
  PrinterTest: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const mode = usePreferenceStore(state => state.mode);
  const accessToken = useAuthStore(state => state.accessToken);
  const hydrated = useAuthStore(state => state.hydrated);
  const hydrate = useAuthStore(state => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const isLoggedIn = Boolean(accessToken);

  return (
    <NavigationContainer theme={mode === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack.Navigator
        screenOptions={{
          headerTitleStyle: styles.headerTitle,
          animation: 'slide_from_right',
        }}
      >
        {isLoggedIn ? (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Customers" component={CustomersScreen} />
            <Stack.Screen name="Products" component={ProductsScreen} />
            <Stack.Screen name="Categories" component={CategoriesScreen} />
            <Stack.Screen name="Routes" component={RoutesScreen} />
            <Stack.Screen name="OrderCreate" component={OrderCreateScreen} options={{title: 'Create Order'}} />
            <Stack.Screen name="OrdersHistory" component={OrdersHistoryScreen} options={{title: 'Orders'}} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="PrinterTest" component={PrinterTestScreen} options={{title: 'Printer Test'}} />
          </>
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{headerShown: false}}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  headerTitle: {fontWeight: '700'},
  splash: {flex: 1, justifyContent: 'center', alignItems: 'center'},
});
