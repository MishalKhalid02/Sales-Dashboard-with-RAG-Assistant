import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { confirmLogout } from '../utils/auth';
import { colors } from '../constants/colors';

export default function LogoutButton({ navigation }) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => confirmLogout(navigation)}
      activeOpacity={0.7}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      accessibilityRole="button"
      accessibilityLabel="Log out"
    >
      <Ionicons name="log-out-outline" size={22} color={colors.arctic} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.arctic,
  },
});