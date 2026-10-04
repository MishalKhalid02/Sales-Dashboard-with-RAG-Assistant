import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../api/client';
import { colors } from '../constants/colors';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const normalizedUsername = username.trim();
    const normalizedPassword = password.trim();

    if (!normalizedUsername || !normalizedPassword) {
      Alert.alert('Missing info', 'Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/login', {
        username: normalizedUsername,
        password: normalizedPassword,
      });
      const { token } = response.data;

      await SecureStore.setItemAsync('authToken', token);
      navigation.replace('SelectionPane');
    } catch (error) {
      
    console.log('Login error:', error.response?.data || error.message);
    console.log('Login error response:', JSON.stringify(error.response?.data));
Alert.alert('Login failed', getErrorMessage(error));    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.navyDeep, colors.ocean]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>SSGC Dashboard</Text>
        <Text style={styles.headerSubtitle}>Sales &amp; Billing Data Analytics</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.headingGroup}>
              <Text style={styles.welcomeText}>Welcome</Text>
              <Text style={styles.subtitle}>Sign in to access the dashboard</Text>
            </View>

            <View style={styles.formGroup}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor={colors.muted}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={colors.muted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.footerGroup}>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color={colors.arctic} />
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>
                Don&apos;t have an account? <Text style={styles.linkBold}>Sign up</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.mist },
  header: {
    paddingTop: 54,
    paddingBottom: 34,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    alignItems: 'center',
  },
  headerCollapsed: {
    paddingTop: 45,
    paddingBottom: 16,
  },
  headerTitle: { color: colors.arctic, fontSize: 22, fontWeight: '700' },
  headerSubtitle: { color: colors.dusk, fontSize: 12, marginTop: 6 },
  keyboardAvoidingView: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: -18,
  },
  card: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: colors.arctic,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.navyDeep,
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    justifyContent: 'center',
  },
  headingGroup: {
    alignItems: 'center',
    marginBottom: 30,
  },
  formGroup: {
    marginBottom: 20,
  },
  footerGroup: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.navyDeep,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
  },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, color: colors.muted, marginBottom: 6, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surfaceMuted,
    minHeight: 48,
  },
  loginButton: {
    width: '100%',
    backgroundColor: colors.navyDeep,
    borderRadius: 9,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  loginButtonText: { color: colors.arctic, fontWeight: '700', fontSize: 15 },
  link: { marginTop: 16, textAlign: 'center', fontSize: 13, color: colors.muted },
  linkBold: { color: colors.ocean, fontWeight: '700' },
});