import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SystemUI from 'expo-system-ui';
import { palette } from '@/theme';
import { useNotificationsStore } from '@/store/useNotificationsStore';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { registerForPushNotifications } from '@/services/pushNotifications';

export default function RootLayout() {
  const hydrateNotifications = useNotificationsStore((s) => s.hydrate);
  const pushEnabled = usePreferencesStore((s) => s.pushEnabled);
  const setPushToken = usePreferencesStore((s) => s.setPushToken);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(palette.midnight).catch(() => {});
    hydrateNotifications();
  }, [hydrateNotifications]);

  useEffect(() => {
    if (!pushEnabled) return;
    registerForPushNotifications().then((token) => {
      if (token) setPushToken(token);
    });
  }, [pushEnabled, setPushToken]);

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
          <Stack.Screen name="notifications" options={{ presentation: 'modal' }} />
          <Stack.Screen name="jackpot/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="promotion/[id]" options={{ animation: 'slide_from_right' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
