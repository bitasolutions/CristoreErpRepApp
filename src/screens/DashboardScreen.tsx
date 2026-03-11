import React from 'react';
import { Alert, FlatList, StyleSheet, Text as RNText, View } from 'react-native';
import { Card, FAB, Text } from '@/components/ui';
import { useThemeColors } from '@/hooks/useTheme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { ScreenContainer } from '@/components/ScreenContainer';
import { usePreferenceStore } from '@/store/preferenceStore';
import { useAuthStore } from '@/store/authStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

const cards: Array<{ title: string; icon: string; target: keyof RootStackParamList; description: string }> = [
  { title: 'Customers', icon: '👤', target: 'Customers', description: 'Customer tree, credit and routes' },
  { title: 'Products', icon: '📦', target: 'Products', description: 'Search products with pricing and stock' },
  { title: 'Orders', icon: '🧾', target: 'OrdersHistory', description: 'View existing orders' },
  { title: 'Routes', icon: '🗺️', target: 'Routes', description: 'Sales routes and assigned reps' },
  { title: 'Categories', icon: '🏷️', target: 'Categories', description: 'Category and subcategory filters' },
  { title: 'Settings', icon: '⚙️', target: 'Settings', description: 'Theme, printer and API URL' },
];

export const DashboardScreen = ({ navigation }: Props) => {
  const toggleMode = usePreferenceStore(state => state.toggleMode);
  const user = useAuthStore(state => state.user);
  const c = useThemeColors();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => useAuthStore.getState().logout() },
    ]);
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text variant="h2">Sales Dashboard</Text>
        {user ? <Text variant="caption" muted>{user.repName}</Text> : null}
      </View>

      <FlatList
        data={cards}
        keyExtractor={item => item.title}
        renderItem={({ item }) => (
          <Card onPress={() => navigation.navigate(item.target as never)} style={styles.card}>
            <View style={styles.cardRow}>
              <RNText style={styles.emoji}>{item.icon}</RNText>
              <View style={styles.cardText}>
                <RNText style={[styles.cardTitle, { color: c.text }]}>{item.title}</RNText>
                <RNText style={[styles.cardDesc, { color: c.textMuted }]}>{item.description}</RNText>
              </View>
            </View>
          </Card>
        )}
        contentContainerStyle={styles.list}
      />
      <View style={styles.container}>

        {/* Left floating logout */}
        <FAB
          emoji="🚪"
          style={styles.logoutFab}
          onPress={handleLogout}
        />

        {/* Right floating actions */}
        <View style={styles.actions}>
          <FAB emoji="➕" label="New Order" onPress={() => navigation.navigate('OrderCreate')} />
          <FAB emoji="🌗" label="theme" onPress={toggleMode} />
        </View>
      </View>
      {/* </View>
      <View style={styles.actions}>
        <FAB icon="plus" label="New Order" onPress={() => navigation.navigate('OrderCreate')} />
        <FAB icon="theme-light-dark" onPress={toggleMode} />
        <FAB icon="logout" onPress={handleLogout} />
      </View> */}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { marginBottom: 12, marginLeft: 2 },
  list: { paddingBottom: 80 },
  card: { marginVertical: 4 },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  emoji: { fontSize: 26, marginRight: 12 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  cardDesc: { fontSize: 12, marginTop: 2 },
  container: {
    flex: 1,
  },
  actions: { position: 'absolute', right: 16, bottom: 16, gap: 10 },
  logoutFab: {
    position: 'absolute',
    left: 16,
    bottom: 16,
  },
});
