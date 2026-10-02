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

import { router } from 'expo-router';
import { useState } from 'react';

const API_URL = 'http://10.248.142.112:3000';

export default function PatientRegisterScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !phone) {
      Alert.alert('Required', 'Please enter name and phone number.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/patient-register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          phone,
          age,
          gender,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          'Success',
          'Patient registered successfully.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Registration Failed', data.message);
      }
    } catch (error) {
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
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* Header */}
        <View style={styles.header}>

          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>Q</Text>
          </View>

          <Text style={styles.brand}>QCare</Text>

          <Text style={styles.tagline}>
            Smart Hospital Queue Management
          </Text>

        </View>

        {/* Registration Card */}
        <View style={styles.card}>

          <Text style={styles.title}>
            Create Account
          </Text>

          <Text style={styles.subtitle}>
            Register as a patient to book and manage appointments
          </Text>

          {/* Full Name */}
          <Text style={styles.label}>
            Full Name
          </Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.icon}>👤</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#9AA3AD"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          {/* Phone */}
          <Text style={styles.label}>
            Phone Number
          </Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.icon}>📱</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              placeholderTextColor="#9AA3AD"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          {/* Age */}
          <Text style={styles.label}>
            Age
          </Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.icon}>🎂</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your age"
              placeholderTextColor="#9AA3AD"
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
            />
          </View>

          {/* Gender */}
          <Text style={styles.label}>
            Gender
          </Text>

          <View style={styles.genderOptions}>

            <TouchableOpacity
              style={[
                styles.genderOption,
                gender === 'Male' &&
                  styles.genderOptionSelected,
              ]}
              onPress={() => setGender('Male')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.genderText,
                  gender === 'Male' &&
                    styles.genderTextSelected,
                ]}
              >
                Male
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderOption,
                gender === 'Female' &&
                  styles.genderOptionSelected,
              ]}
              onPress={() => setGender('Female')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.genderText,
                  gender === 'Female' &&
                    styles.genderTextSelected,
                ]}
              >
                Female
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderOption,
                gender === 'Other' &&
                  styles.genderOptionSelected,
              ]}
              onPress={() => setGender('Other')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.genderText,
                  gender === 'Other' &&
                    styles.genderTextSelected,
                ]}
              >
                Other
              </Text>
            </TouchableOpacity>

          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[
              styles.registerButton,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.registerButtonText}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>

            {!loading && (
              <Text style={styles.arrow}>
                →
              </Text>
            )}
          </TouchableOpacity>

          {/* Login */}
          <View style={styles.loginRow}>

            <Text style={styles.loginText}>
              Already have an account?
            </Text>

            <TouchableOpacity
              onPress={() => router.back()}
            >
              <Text style={styles.loginLink}>
                {' '}Login
              </Text>
            </TouchableOpacity>

          </View>

        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Your information is used to manage your QCare appointments.
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
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 28,
  },

  header: {
    alignItems: 'center',
    marginBottom: 22,
  },

  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1769AA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 5,
  },

  logoText: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
  },

  brand: {
    fontSize: 29,
    fontWeight: '800',
    color: '#1769AA',
  },

  tagline: {
    marginTop: 4,
    fontSize: 12,
    color: '#7B8794',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 6,
    },
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#18232E',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 13,
    color: '#7A8591',
    lineHeight: 19,
    marginBottom: 22,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#34404C',
    marginBottom: 7,
  },

  inputWrapper: {
    height: 52,
    backgroundColor: '#F8FAFD',
    borderWidth: 1,
    borderColor: '#E0E6EC',
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    marginBottom: 15,
  },

  icon: {
    fontSize: 16,
    marginRight: 9,
  },

  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#18232E',
  },

  genderOptions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },

  genderOption: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E6EC',
    backgroundColor: '#F8FAFD',
    justifyContent: 'center',
    alignItems: 'center',
  },

  genderOptionSelected: {
    backgroundColor: '#1769AA',
    borderColor: '#1769AA',
  },

  genderText: {
    color: '#65717D',
    fontSize: 14,
    fontWeight: '600',
  },

  genderTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  registerButton: {
    height: 54,
    backgroundColor: '#1769AA',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  arrow: {
    color: '#FFFFFF',
    fontSize: 22,
    marginLeft: 10,
  },

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },

  loginText: {
    color: '#7A8591',
    fontSize: 14,
  },

  loginLink: {
    color: '#1769AA',
    fontSize: 14,
    fontWeight: '800',
  },

  footer: {
    textAlign: 'center',
    color: '#8A949E',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 18,
    paddingHorizontal: 15,
  },
});