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

export default function PatientLoginScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!name || !phone) {
      Alert.alert('Required', 'Please enter name and phone number.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/patient-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          phone,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await AsyncStorage.setItem(
          'currentPatient',
          JSON.stringify(data.patient)
        );

        Alert.alert('Success', 'Patient login successful.', [
          {
            text: 'OK',
            onPress: () => router.push('/patient-dashboard'),
          },
        ]);
      } else {
        Alert.alert('Login Failed', data.message);
      }
    } catch (error) {
      console.log('LOGIN ERROR:', error);

      Alert.alert(
        'Login Error',
        String(error)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* Top Section */}
        <View style={styles.topSection}>

          <View style={styles.logoOuter}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>Q</Text>
            </View>
          </View>

          <Text style={styles.brand}>QCare</Text>

          <Text style={styles.tagline}>
            Your health, your time
          </Text>

        </View>

        {/* Login Card */}
        <View style={styles.loginCard}>

          <View style={styles.cardHeader}>
            <Text style={styles.title}>Welcome</Text>

            <Text style={styles.subtitle}>
              Sign in to access your appointments
            </Text>
          </View>

          {/* Name */}
          <View style={styles.fieldContainer}>

            <Text style={styles.label}>
              Full Name
            </Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>
                👤
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#9AA3AD"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

          </View>

          {/* Phone */}
          <View style={styles.fieldContainer}>

            <Text style={styles.label}>
              Phone Number
            </Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>
                📱
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor="#9AA3AD"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Logging in...' : 'Continue'}
            </Text>

            {!loading && (
              <Text style={styles.arrow}>
                →
              </Text>
            )}
          </TouchableOpacity>

          {/* Register */}
          <View style={styles.registerSection}>

            <Text style={styles.registerText}>
              New to QCare?
            </Text>

            <TouchableOpacity
              onPress={() =>
                router.push('/patient-register')
              }
            >
              <Text style={styles.registerLink}>
                Create Account
              </Text>
            </TouchableOpacity>

          </View>

        </View>

        {/* Bottom Trust Section */}
        <View style={styles.bottomSection}>

          <View style={styles.trustItem}>
            <Text style={styles.trustIcon}>✓</Text>
            <Text style={styles.trustText}>
              Easy Booking
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.trustItem}>
            <Text style={styles.trustIcon}>✓</Text>
            <Text style={styles.trustText}>
              Live Queue
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.trustItem}>
            <Text style={styles.trustIcon}>✓</Text>
            <Text style={styles.trustText}>
              Quick Access
            </Text>
          </View>

        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F7FC',
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },

  topSection: {
    alignItems: 'center',
    marginBottom: 25,
  },

  logoOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#DCEEFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1769AA',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },

  logoText: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
  },

  brand: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1769AA',
    letterSpacing: 0.3,
  },

  tagline: {
    marginTop: 4,
    color: '#7B8794',
    fontSize: 13,
  },

  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 25,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 6,
    },
  },

  cardHeader: {
    marginBottom: 23,
  },

  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#18232E',
  },

  subtitle: {
    fontSize: 14,
    color: '#7A8591',
    marginTop: 6,
    lineHeight: 20,
  },

  fieldContainer: {
    marginBottom: 17,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#34404C',
    marginBottom: 8,
  },

  inputWrapper: {
    height: 54,
    backgroundColor: '#F8FAFD',
    borderWidth: 1,
    borderColor: '#E0E6EC',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
  },

  inputIcon: {
    fontSize: 17,
    marginRight: 10,
  },

  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#18232E',
  },

  loginButton: {
    height: 55,
    backgroundColor: '#1769AA',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },

  buttonDisabled: {
    opacity: 0.6,
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
    marginTop: -2,
  },

  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 21,
  },

  registerText: {
    color: '#7A8591',
    fontSize: 14,
  },

  registerLink: {
    color: '#1769AA',
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 5,
  },

  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 23,
    paddingHorizontal: 5,
  },

  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  trustIcon: {
    color: '#1769AA',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 4,
  },

  trustText: {
    color: '#7A8591',
    fontSize: 11,
    fontWeight: '600',
  },

  divider: {
    width: 1,
    height: 14,
    backgroundColor: '#D5DDE5',
    marginHorizontal: 10,
  },
});