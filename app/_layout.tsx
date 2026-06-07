import React, { useEffect } from 'react';
import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SystemUI from 'expo-system-ui';
import { useAuthStore } from '@/store/useAuthStore';

export default function RootLayout() {
  const init    = useAuthStore(s => s.init);
  const loading = useAuthStore(s => s.loading);
  const session = useAuthStore(s => s.session);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync('#f8f9fa').catch(() => {});
    init();
  }, [init]);

  if (loading) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown:  false,
            contentStyle: { backgroundColor: '#f8f9fa' },
            animation:    'fade',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
        </Stack>
        {!session && <Redirect href="/login" />}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
