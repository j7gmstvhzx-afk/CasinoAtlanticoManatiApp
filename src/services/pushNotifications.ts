import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { api } from './api';

let configured = false;

const configure = () => {
  if (configured) return;
  configured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
};

/**
 * Pide permiso al sistema y registra el token de Expo Push en el backend.
 * Devuelve el token o `undefined` si el usuario rechazó el permiso o si
 * estamos en Web/simulador sin soporte push.
 */
export async function registerForPushNotifications(): Promise<string | undefined> {
  configure();

  if (Platform.OS === 'web') return undefined;

  try {
    const settings = await Notifications.getPermissionsAsync();
    let status = settings.status;

    if (status !== 'granted') {
      const ask = await Notifications.requestPermissionsAsync();
      status = ask.status;
    }
    if (status !== 'granted') return undefined;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'General',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 200, 100, 200],
        lightColor: '#D4A24C',
      });
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

    const tokenResult = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    const token = tokenResult.data;

    await api.registerPushToken(token);
    return token;
  } catch (err) {
    if (__DEV__) console.warn('[push] register failed', err);
    return undefined;
  }
}
