import { router } from 'expo-router';
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

const API_URL = 'https://qcare-tisd.onrender.com';

export default function HospitalRegisterScreen() {
  const [hospitalName, setHospitalName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const cleanName = hospitalName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanAddress = address.trim();

    if (
      !cleanName ||
      !cleanEmail ||
      !cleanPhone ||
      !cleanAddress ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert(
        'Missing Details',
        'Please fill in all the fields.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        'Password Mismatch',
        'Password and confirm password must be the same.'
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Weak Password',
        'Password must contain at least 6 characters.'
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/register-hospital`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: cleanName,
            email: cleanEmail,
            phone: cleanPhone,
            address: cleanAddress,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        Alert.alert(
          'Registration Failed',
          data.message || 'Unable to register hospital.'
        );
        return;
      }

      Alert.alert(
        'Registration Successful',
        data.message ||
          'Hospital registered successfully. Please wait for admin approval.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/hospital-login'),
          },
        ]
      );
    } catch (error) {
      console.log('HOSPITAL REGISTER ERROR:', error);

      Alert.alert(
        'Unable to Connect',
        'Unable to connect to QCare server. Please make sure the server is running.'
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
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>Q</Text>
          </View>

          <Text style={styles.brand}>QCare</Text>

          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>🏥</Text>
            <Text style={styles.badgeText}>
              HOSPITAL REGISTRATION
            </Text>
          </View>
        </View>

        {/* Registration Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Register Hospital</Text>

          <Text style={styles.subtitle}>
            Create your hospital account to manage patients and queues
          </Text>

          {/* Hospital Name */}
          <Text style={styles.label}>Hospital Name</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.icon}>🏥</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter hospital name"
              placeholderTextColor="#98A2B3"
              value={hospitalName}
              onChangeText={setHospitalName}
            />
          </View>

          {/* Email */}
          <Text style={[styles.label, styles.fieldTop]}>
            Hospital Email
          </Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.icon}>✉</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter hospital email"
              placeholderTextColor="#98A2B3"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Phone */}
          <Text style={[styles.label, styles.fieldTop]}>
            Phone Number
          </Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.icon}>📱</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              placeholderTextColor="#98A2B3"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          {/* Address */}
          <Text style={[styles.label, styles.fieldTop]}>
            Hospital Address
          </Text>

          <View style={[styles.inputWrapper, styles.addressWrapper]}>
            <Text style={styles.icon}>📍</Text>

            <TextInput
              style={[styles.input, styles.addressInput]}
              placeholder="Enter hospital address"
              placeholderTextColor="#98A2B3"
              multiline
              value={address}
              onChangeText={setAddress}
            />
          </View>

          {/* Password */}
          <Text style={[styles.label, styles.fieldTop]}>
            Password
          </Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.icon}>🔒</Text>

            <TextInput
              style={styles.input}
              placeholder="Create a password"
              placeholderTextColor="#98A2B3"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.showText}>
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <Text style={[styles.label, styles.fieldTop]}>
            Confirm Password
          </Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.icon}>🔐</Text>

            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              placeholderTextColor="#98A2B3"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <TouchableOpacity
              onPress={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            >
              <Text style={styles.showText}>
                {showConfirmPassword ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Approval Notice */}
          <View style={styles.noticeBox}>
            <Text style={styles.noticeIcon}>ℹ️</Text>

            <Text style={styles.noticeText}>
              After registration, your hospital account will remain
              pending until it is approved by the QCare administrator.
            </Text>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[
              styles.registerButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.registerButtonText}>
                  Create Hospital Account
                </Text>

                <Text style={styles.arrow}>→</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>
              Already have a hospital account?
            </Text>

            <TouchableOpacity
              onPress={() => router.replace('/hospital-login')}
            >
              <Text style={styles.loginLink}> Login</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footer}>
          Smart Hospital Queue Management
        </Text>
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
    paddingHorizontal: 22,
    paddingTop: 40,
    paddingBottom: 30,
  },

  header: {
    alignItems: 'center',
    marginBottom: 25,
  },

  logoCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#1769AA',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#1769AA',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },

  logoText: {
    color: '#FFFFFF',
    fontSize: 33,
    fontWeight: '800',
  },

  brand: {
    fontSize: 29,
    fontWeight: '800',
    color: '#172B4D',
    marginTop: 8,
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F3FC',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 9,
  },

  badgeIcon: {
    fontSize: 14,
    marginRight: 6,
  },

  badgeText: {
    color: '#1769AA',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    elevation: 5,
    shadowColor: '#172B4D',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 18,
  },

  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#172B4D',
    marginBottom: 7,
  },

  subtitle: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 21,
    marginBottom: 23,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#344054',
    marginBottom: 8,
  },

  fieldTop: {
    marginTop: 17,
  },

  inputWrapper: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E1E7EF',
    borderRadius: 14,
    paddingHorizontal: 14,
  },

  addressWrapper: {
    height: 78,
    alignItems: 'flex-start',
    paddingTop: 14,
  },

  addressInput: {
    textAlignVertical: 'top',
    paddingTop: 1,
  },

  icon: {
    fontSize: 17,
    width: 29,
    textAlign: 'center',
    marginRight: 5,
  },

  input: {
    flex: 1,
    height: '100%',
    color: '#172B4D',
    fontSize: 15,
  },

  showText: {
    color: '#1769AA',
    fontSize: 12,
    fontWeight: '700',
    paddingLeft: 8,
  },

  noticeBox: {
    flexDirection: 'row',
    backgroundColor: '#F1F7FC',
    borderRadius: 13,
    padding: 13,
    marginTop: 20,
  },

  noticeIcon: {
    fontSize: 17,
    marginRight: 9,
  },

  noticeText: {
    flex: 1,
    color: '#667085',
    fontSize: 11,
    lineHeight: 17,
  },

  registerButton: {
    height: 55,
    backgroundColor: '#1769AA',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    elevation: 5,
    shadowColor: '#1769AA',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.18,
    shadowRadius: 9,
  },

  disabledButton: {
    opacity: 0.7,
  },

  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  arrow: {
    color: '#FFFFFF',
    fontSize: 23,
    marginLeft: 10,
  },

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 21,
  },

  loginText: {
    color: '#667085',
    fontSize: 12,
  },

  loginLink: {
    color: '#1769AA',
    fontSize: 13,
    fontWeight: '800',
  },

  footer: {
    textAlign: 'center',
    color: '#98A2B3',
    fontSize: 11,
    marginTop: 23,
  },
});