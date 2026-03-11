import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, Input, Text } from '@/components/ui';
import { useThemeColors } from '@/hooks/useTheme';
import { authApi } from '@/api/endpoints/auth';
import { useAuthStore } from '@/store/authStore';

export const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore(state => state.setAuth);
  const c = useThemeColors();

  const handleLogin = async () => {
    const trimmed = username.trim();
    if (!trimmed || !password) {
      Alert.alert('Validation', 'Please enter username and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.login(trimmed, password);
      if (res.success) {
        setAuth(res.accessToken, res.refreshToken, res.user);
      } else {
        Alert.alert('Login Failed', res.message || 'Invalid credentials.');
      }
    } catch (error) {
      Alert.alert('Login Failed', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: c.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text variant="h2" style={styles.title}>
          Cristore Rep Orders
        </Text>
        <Text variant="body" muted style={styles.subtitle}>
          Sign in to continue
        </Text>

        <Input
          label="Short Name"
          value={username}
          onChangeText={setUsername}
          placeholder="Enter username"
        />
        <Input
          label="App Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          secureTextEntry
          style={styles.passwordField}
        />

        <Button
          type="solid"
          style={styles.button}
          onPress={handleLogin}
          loading={loading}
          disabled={loading}>
          Sign In
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    paddingVertical: 32,
  },
  title: {
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 28,
  },
  passwordField: {
    marginTop: 12,
  },
  button: {
    marginTop: 24,
    alignSelf: 'stretch',
  },
});
