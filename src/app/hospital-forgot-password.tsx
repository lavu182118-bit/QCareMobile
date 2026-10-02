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
    marginBottom: 27,
  },

  /* INPUT */

  label: {
    fontSize: 13,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 9,
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
    color: '#6B7280',
    marginRight: 11,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    paddingVertical: 0,
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

  /* SECURITY BOX */

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
export default function HospitalForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!email.trim()) {
      Alert.alert(
        'Missing Email',
        'Please enter your hospital email.'
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        Alert.alert(
          'Unable to Send OTP',
          data.message || 'Please try again.'
        );
        return;
      }

      Alert.alert(
        'OTP Sent',
        'An OTP has been sent. Please check your registered email ID.',
        [
          {
            text: 'Continue',
            onPress: () =>
              router.push({
                pathname: '/hospital-verify-otp',
                params: {
                  email: email.trim(),
                },
              }),
          },
        ]
      );
    } catch (error) {
      console.log('FORGOT PASSWORD ERROR:', error);

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
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* QCARE HEADER */}

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


        {/* FORGOT PASSWORD CARD */}

        <View style={styles.card}>

          <View style={styles.iconCircle}>
            <Text style={styles.icon}>
              🔐
            </Text>
          </View>

          <Text style={styles.title}>
            Forgot Password?
          </Text>

          <Text style={styles.subtitle}>
            Enter your registered hospital email
            to receive an OTP and securely reset
            your password.
          </Text>


          {/* EMAIL LABEL */}

          <Text style={styles.label}>
            Hospital Email
          </Text>


          {/* EMAIL INPUT */}

          <View style={styles.inputWrapper}>

            <Text style={styles.inputIcon}>
              ✉
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter registered email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

          </View>


          {/* SEND OTP */}

          <TouchableOpacity
            style={[
              styles.button,
              loading && styles.disabledButton,
            ]}
            onPress={handleSendOTP}
            disabled={loading}
            activeOpacity={0.8}
          >

            <Text style={styles.buttonText}>
              {loading
                ? 'Sending OTP...'
                : 'Send OTP'}
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
              ← Back to Hospital Login
            </Text>
          </TouchableOpacity>

        </View>


        {/* SECURITY INFORMATION */}

        <View style={styles.infoBox}>

          <Text style={styles.infoTitle}>
            🔒 Secure Password Recovery
          </Text>

          <Text style={styles.infoText}>
            Your registered hospital email is used
            to verify your account before changing
            the password.
          </Text>

        </View>


        {/* FOOTER */}

        <Text style={styles.footer}>
          © QCare • Making healthcare waiting simpler
        </Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}