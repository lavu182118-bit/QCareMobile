import { router, useLocalSearchParams } from 'expo-router';
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

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },

  container: {
    flex: 1,
  },

  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 40,
  },

  /* HEADER */

  header: {
    alignItems: 'center',
    marginBottom: 28,
  },

  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 11,

    shadowColor: '#2563EB',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 5,
  },

  logoText: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
  },

  logoTitle: {
    fontSize: 29,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.5,
  },

  tagline: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 5,
    textAlign: 'center',
  },

  /* MAIN CARD */

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 26,

    shadowColor: '#111827',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    elevation: 6,
  },

  iconCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 17,
  },

  icon: {
    fontSize: 30,
  },

  title: {
    fontSize: 25,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 9,
    marginBottom: 22,
  },

  /* EMAIL */

  emailBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 14,
    marginBottom: 22,

    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  emailLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '800',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  emailText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
  },

  /* PASSWORD */

  label: {
    fontSize: 13,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 9,
  },

  secondLabel: {
    marginTop: 19,
  },

  inputWrapper: {
    height: 54,
    borderWidth: 1,
    borderColor: '#DCE2EA',
    borderRadius: 15,
    backgroundColor: '#F9FAFB',

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 15,
  },

  inputIcon: {
    fontSize: 17,
    marginRight: 11,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    paddingVertical: 0,
  },

  passwordHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 9,
  },

  /* BUTTON */

  button: {
    height: 55,
    borderRadius: 15,
    backgroundColor: '#2563EB',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 23,

    shadowColor: '#2563EB',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 4,
  },

  disabledButton: {
    opacity: 0.65,
  },

  buttonText: {
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

  /* BACK */

  backButton: {
    alignItems: 'center',
    marginTop: 23,
    paddingVertical: 5,
  },

  backText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '800',
  },

  /* SECURITY */

  infoBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 17,
    padding: 17,
    marginTop: 22,
  },

  infoTitle: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 7,
  },

  infoText: {
    color: '#4B5563',
    fontSize: 13,
    lineHeight: 19,
  },

  /* FOOTER */

  footer: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 24,
  },
});
export default function HospitalResetPasswordScreen() {
  const { email } =
    useLocalSearchParams<{ email: string }>();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert(
        'Missing Details',
        'Please enter and confirm your new password.'
      );
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(
        'Weak Password',
        'Password must contain at least 8 characters.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        'Passwords Do Not Match',
        'Please make sure both passwords are the same.'
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        Alert.alert(
          'Reset Failed',
          data.message ||
            'Unable to reset password.'
        );
        return;
      }

      Alert.alert(
        'Password Updated',
        'Your hospital password has been successfully changed.',
        [
          {
            text: 'Go to Login',
            onPress: () =>
              router.replace('/hospital-login'),
          },
        ]
      );
    } catch (error) {
      console.log(
        'RESET PASSWORD ERROR:',
        error
      );

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
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.contentContainer
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* HEADER */}

        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>
              Q
            </Text>
          </View>

          <Text style={styles.logoTitle}>
            QCare
          </Text>

          <Text style={styles.tagline}>
            Smart Hospital Queue Management
          </Text>
        </View>


        {/* RESET PASSWORD CARD */}

        <View style={styles.card}>

          <View style={styles.iconCircle}>
            <Text style={styles.icon}>
              🔑
            </Text>
          </View>

          <Text style={styles.title}>
            Create New Password
          </Text>

          <Text style={styles.subtitle}>
            Set a new password for your hospital
            account.
          </Text>


          {/* EMAIL */}

          <View style={styles.emailBox}>

            <Text style={styles.emailLabel}>
              Hospital Email
            </Text>

            <Text style={styles.emailText}>
              {email || 'Hospital email'}
            </Text>

          </View>


          {/* NEW PASSWORD */}

          <Text style={styles.label}>
            New Password
          </Text>

          <View style={styles.inputWrapper}>

            <Text style={styles.inputIcon}>
              🔒
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter new password"
              placeholderTextColor="#9CA3AF"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

          </View>


          {/* CONFIRM PASSWORD */}

          <Text
            style={[
              styles.label,
              styles.secondLabel,
            ]}
          >
            Confirm New Password
          </Text>

          <View style={styles.inputWrapper}>

            <Text style={styles.inputIcon}>
              🔒
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

          </View>


          <Text style={styles.passwordHint}>
            Password must be at least 6 characters.
          </Text>


          {/* UPDATE PASSWORD */}

          <TouchableOpacity
            style={[
              styles.button,
              loading &&
                styles.disabledButton,
            ]}
            onPress={handleResetPassword}
            disabled={loading}
            activeOpacity={0.8}
          >

            <Text style={styles.buttonText}>
              {loading
                ? 'Updating Password...'
                : 'Update Password'}
            </Text>

            {!loading && (
              <Text style={styles.arrow}>
                →
              </Text>
            )}

          </TouchableOpacity>


          {/* BACK TO LOGIN */}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              router.replace('/hospital-login')
            }
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.backText}>
              ← Back to Login
            </Text>
          </TouchableOpacity>

        </View>


        {/* SECURITY INFORMATION */}

        <View style={styles.infoBox}>

          <Text style={styles.infoTitle}>
            🔒 Account Security
          </Text>

          <Text style={styles.infoText}>
            After changing your password, use the
            new password the next time you sign in.
          </Text>

        </View>


        {/* FOOTER */}

        <Text style={styles.footer}>
          © QCare • Making healthcare waiting
          simpler
        </Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}