import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';

import {
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

const API_URL = 'https://qcare-tisd.onrender.com';

export default function HospitalLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        'Missing Details',
        'Please enter your email and password.'
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/hospital-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        Alert.alert(
          'Login Failed',
          data.message || 'Unable to login.'
        );
        return;
      }

      await AsyncStorage.setItem(
        'currentHospital',
        JSON.stringify(data.hospital)
      );

      await AsyncStorage.setItem(
        'hospitalLoggedIn',
        'true'
      );

      router.replace('/hospital-dashboard');
    } catch (error) {
      console.log('HOSPITAL LOGIN ERROR:', error);

      Alert.alert(
        'Connection Error',
        'Unable to connect to QCare server.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>Q</Text>
          </View>

          <Text style={styles.logoTitle}>QCare</Text>

          <Text style={styles.tagline}>
            Smart Hospital Queue Management
          </Text>
        </View>

        {/* Login Card */}
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Text style={styles.hospitalIcon}>🏥</Text>
          </View>

          <Text style={styles.title}>
            Hospital Login
          </Text>

          <Text style={styles.subtitle}>
            Sign in to manage your hospital queue
          </Text>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>✉</Text>

              <TextInput
                style={styles.input}
                placeholder="Enter hospital email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔒</Text>

              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Text>

            {!loading && (
              <Text style={styles.arrow}>→</Text>
            )}
          </TouchableOpacity>

          {/* Register */}
          <TouchableOpacity
  style={styles.forgotButton}
  onPress={() =>
    router.push('/hospital-forgot-password')
  }
>
  <Text style={styles.forgotText}>
    Forgot Password?
  </Text>
</TouchableOpacity>
          <View style={styles.registerSection}>
            <Text style={styles.registerText}>
              New hospital?
            </Text>

            <TouchableOpacity
              onPress={() =>
                router.push('/hospital-register')
              }
            >
              <Text style={styles.registerLink}>
                Register here
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>
            🏥 Hospital Portal
          </Text>

          <Text style={styles.infoText}>
            Manage patients, tokens and live queues
            easily with QCare.
          </Text>
        </View>

        <Text style={styles.footer}>
          © QCare • Making healthcare waiting simpler
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },

  container: {
    flex: 1,
  },

  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 45,
  },

  header: {
    alignItems: 'center',
    marginBottom: 28,
  },

  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  logoText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },

  logoTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },

  tagline: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 5,
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 5,
  },

  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },

  hospitalIcon: {
    fontSize: 28,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 7,
    marginBottom: 25,
    lineHeight: 20,
  },

  inputGroup: {
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },

  inputWrapper: {
    height: 52,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },

  inputIcon: {
    fontSize: 17,
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },

  loginButton: {
    height: 54,
    borderRadius: 15,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },

  disabledButton: {
    opacity: 0.7,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  arrow: {
    color: '#FFFFFF',
    fontSize: 22,
    marginLeft: 10,
  },

  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },

  registerText: {
    color: '#6B7280',
    fontSize: 14,
  },

  registerLink: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 5,
  },

  infoSection: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    marginTop: 22,
  },

  infoTitle: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 5,
  },

  infoText: {
    color: '#4B5563',
    fontSize: 13,
    lineHeight: 19,
  },

  footer: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 24,
  },
  forgotButton: {
  alignItems: 'flex-end',
  marginTop: 14,
},

forgotText: {
  color: '#2563EB',
  fontSize: 13,
  fontWeight: '700',
},
});