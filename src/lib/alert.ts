import { Alert, Platform } from 'react-native';

// react-native-web's Alert.alert() is a no-op, and window.alert doesn't exist
// on iOS/Android — branch so save errors are visible on every platform.
export function showErrorAlert(message: string, title = 'Error al guardar'): void {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}
