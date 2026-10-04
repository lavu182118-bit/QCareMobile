import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AdminLogin() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert(
        'Missing Details',
        'Please enter email and password.'
      );
      return;
    }

    // Temporary login check
    if (
      email.trim() === 'admin@qcare.com' &&
      password === 'JaiHanuman@21'
    ) {
      router.replace('/admin-dashboard');
    } else {
      Alert.alert(
        'Login Failed',
        'Invalid admin email or password.'
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <View style={styles.backgroundCircleTop} />
      <View style={styles.backgroundCircleBottom} />

      <View style={styles.content}>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>Q</Text>
          </View>

          <Text style={styles.logoText}>
            QCare
          </Text>
        </View>

        {/* Heading */}
        <View style={styles.headingContainer}>
          <Text style={styles.title}>
            Admin Portal
          </Text>

          <Text style={styles.subtitle}>
            Secure access for QCare administrators
          </Text>
        </View>

        {/* Login Card */}
        <View style={styles.card}>

          <Text style={styles.cardTitle}>
            Welcome Back
          </Text>

          <Text style={styles.cardSubtitle}>
            Sign in to manage QCare
          </Text>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              ADMIN EMAIL
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter admin email"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              PASSWORD
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.85}
          >
            <Text style={styles.loginText}>
              Sign In
            </Text>

            <Text style={styles.arrow}>
              →
            </Text>
          </TouchableOpacity>

          {/* Security Note */}
          <View style={styles.securityBox}>
            <Text style={styles.lockIcon}>
              🔒
            </Text>

            <Text style={styles.securityText}>
              Authorized administrator access only
            </Text>
          </View>

        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          QCare Hospital Queue Management System
        </Text>

        <Text style={styles.version}>
          Admin Portal
        </Text>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
  },

  backgroundCircleTop: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: '#DBEAFE',
    top: -120,
    right: -80,
    opacity: 0.7,
  },

  backgroundCircleBottom: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#E0E7FF',
    bottom: -90,
    left: -70,
    opacity: 0.7,
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 22,
  },

  logoCircle: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,

    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },

  logoIcon: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
  },

  logoText: {
    fontSize: 25,
    fontWeight: '900',
    color: '#1E3A8A',
    letterSpacing: 0.3,
  },

  headingContainer: {
    alignItems: 'center',
    marginBottom: 22,
  },

  title: {
    fontSize: 29,
    fontWeight: '900',
    color: '#0F172A',
  },

  subtitle: {
    marginTop: 7,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 5,
  },

  cardTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#0F172A',
  },

  cardSubtitle: {
    marginTop: 4,
    marginBottom: 22,
    fontSize: 13,
    color: '#64748B',
  },

  inputContainer: {
    marginBottom: 16,
  },

  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.8,
    marginBottom: 7,
  },

  input: {
    height: 52,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 15,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  loginButton: {
    height: 54,
    backgroundColor: '#2563EB',
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,

    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },

  loginText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  arrow: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '700',
    marginLeft: 10,
  },

  securityBox: {
    marginTop: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  lockIcon: {
    fontSize: 13,
    marginRight: 6,
  },

  securityText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },

  footer: {
    textAlign: 'center',
    marginTop: 22,
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },

  version: {
    textAlign: 'center',
    marginTop: 4,
    fontSize: 10,
    color: '#94A3B8',
  },
});