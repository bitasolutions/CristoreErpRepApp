import React from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import { Text } from '@/components/ui';
import { useThemeColors } from '@/hooks/useTheme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useAuthStore } from '@/store/authStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

const cards: Array<{
  title: string;
  icon: string;
  target?: keyof RootStackParamList;
  action?: 'logout';
  tone?: 'default' | 'muted' | 'danger';
  size?: 'default' | 'small';
}> = [
  { title: 'Customers', icon: '👤', target: 'Customers' },
  { title: 'Routes', icon: '🗺️', target: 'Routes' },
  { title: 'Order', icon: '🧾', target: 'OrderCreate' },
  { title: 'Van Sale', icon: '🚚', target: 'VanSaleCreate' },
  { title: 'Products', icon: '📦', target: 'Products' },
  { title: 'Categories', icon: '🏷️', target: 'Categories' },
  { title: 'Settings', icon: '⚙️', target: 'Settings', size: 'small', tone: 'muted' },
  { title: 'Logout', icon: '🚪', action: 'logout', size: 'small', tone: 'danger' },
];

export const DashboardScreen = ({ navigation }: Props) => {
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
        <Text variant="h2">Hello, {user?.repName ?? 'Agent'}</Text>
        <Text variant="caption" muted>
          Select an action below
        </Text>
      </View>

      <FlatList
        data={cards}
        keyExtractor={item => item.title}
        numColumns={2}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              if (item.action === 'logout') {
                handleLogout();
                return;
              }
              if (item.target) {
                navigation.navigate(item.target as never);
              }
            }}
            style={({ pressed }) => [
              styles.tile,
              item.size === 'small' && styles.tileSmall,
              {
                backgroundColor:
                  item.tone === 'danger'
                    ? '#FDECEC'
                    : item.tone === 'muted'
                    ? c.surfaceVariant
                    : c.surface,
                borderColor:
                  item.tone === 'danger'
                    ? '#F6C7C7'
                    : item.tone === 'muted'
                    ? c.border
                    : c.border,
              },
              pressed && { opacity: 0.85 },
            ]}
          >
            <View
              style={[
                styles.iconCircle,
                item.size === 'small' && styles.iconCircleSmall,
                {
                  backgroundColor:
                    item.tone === 'danger' ? '#FBE1E1' : c.surfaceVariant,
                },
              ]}
            >
              <RNText style={[styles.emoji, item.size === 'small' && styles.emojiSmall]}>
                {item.icon}
              </RNText>
            </View>
            <RNText
              style={[
                styles.tileTitle,
                item.size === 'small' && styles.tileTitleSmall,
                { color: item.tone === 'danger' ? '#B42318' : c.text },
              ]}
            >
              {item.title}
            </RNText>
          </Pressable>
        )}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
      />
      <View style={[styles.bottomTabs, { borderTopColor: c.border, backgroundColor: c.surface }]}>
        <Pressable
          onPress={() => navigation.navigate('OrdersHistory')}
          style={styles.tabBtn}
        >
          <RNText style={[styles.tabIcon, { color: c.primary }]}>🧾</RNText>
          <RNText style={[styles.tabLabel, { color: c.primary }]}>Orders</RNText>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate('VanSalesSummary')}
          style={styles.tabBtn}
        >
          <RNText style={[styles.tabIcon, { color: c.textMuted }]}>🚚</RNText>
          <RNText style={[styles.tabLabel, { color: c.textMuted }]}>Van Sales</RNText>
        </Pressable>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { marginBottom: 12, marginLeft: 2 },
  list: { paddingBottom: 74 },
  row: { justifyContent: 'space-between', gap: 12, marginBottom: 12 },
  tile: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  tileSmall: {
    paddingVertical: 12,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  iconCircleSmall: { width: 44, height: 44, borderRadius: 22, marginBottom: 8 },
  emoji: { fontSize: 24 },
  emojiSmall: { fontSize: 20 },
  tileTitle: { fontSize: 13, fontWeight: '700' },
  tileTitleSmall: { fontSize: 12 },
  bottomTabs: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tabBtn: { alignItems: 'center', flex: 1 },
  tabIcon: { fontSize: 18, marginBottom: 2 },
  tabLabel: { fontSize: 12, fontWeight: '600' },
});
