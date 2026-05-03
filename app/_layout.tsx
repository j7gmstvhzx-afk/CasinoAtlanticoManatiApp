import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SystemUI from 'expo-system-ui';
import { palette } from '@/theme';
import { useUserStore } from '@/store/useUserStore';
import { useNotificationsStore } from '@/store/useNotificationsStore';

export default function RootLayout() {
  const hydrateUser = useUserStore((s) => s.hydrate);
  const hydrateNotifications = useNotificationsStore((s) => s.hydrate);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(palette.midnight).catch(() => {});
    hydrateUser();
    hydrateNotifications();
  }, [hydrateUser, hydrateNotifications]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: palette.midnight }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: palette.midnight },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth" options={{ presentation: 'modal' }} />
          <Stack.Screen name="notifications" options={{ presentation: 'modal' }} />
          <Stack.Screen name="jackpot/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="promotion/[id]" options={{ animation: 'slide_from_right' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
