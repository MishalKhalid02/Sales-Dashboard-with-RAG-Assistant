import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

export function confirmLogout(navigation) {
  Alert.alert('Log out', 'Do you want to log out?', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Log out',
      style: 'destructive',
      onPress: async () => {
        await SecureStore.deleteItemAsync('authToken');
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      },
    },
  ]);
}