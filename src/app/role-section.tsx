import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function RoleSelectionScreen() {
  const handlePatient = async () => {
    const patient = await AsyncStorage.getItem('currentPatient');

    if (patient) {
      router.push('/patient-dashboard');
    } else {
      router.push('/patient-login');
    }
  };

  const handleHospital = async () => {
    const hospital = await AsyncStorage.getItem('currentHospital');

    if (hospital) {
      router.push('/hospital-dashboard');
    } else {
      router.push('/hospital-login');
    }
  };
  return (
    <View style={styles.container}>

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

      {/* Main Content */}
      <View style={styles.content}>

        <Text style={styles.title}>
          Welcome
        </Text>

        <Text style={styles.subtitle}>
          Choose how you want to continue
        </Text>

        {/* Patient */}
        <TouchableOpacity
          style={styles.roleCard}
          onPress={handlePatient}
          activeOpacity={0.85}
        >
          <View style={styles.iconBox}>
            <Text style={styles.icon}>👤</Text>
          </View>

          <View style={styles.roleInfo}>
            <Text style={styles.roleTitle}>
              Patient
            </Text>

            <Text style={styles.roleSubtitle}>
              Book appointments & track your queue
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* Hospital */}
        <TouchableOpacity
          style={styles.roleCard}
          onPress={handleHospital}
          activeOpacity={0.85}
        >
          <View style={styles.iconBox}>
            <Text style={styles.icon}>🏥</Text>
          </View>

          <View style={styles.roleInfo}>
            <Text style={styles.roleTitle}>
              Hospital
            </Text>

            <Text style={styles.roleSubtitle}>
              Manage patients & hospital queues
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Making healthcare waiting simpler
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F7FC',
    paddingHorizontal: 22,
    justifyContent: 'center',
  },

  header: {
    alignItems: 'center',
    marginBottom: 42,
  },

  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#1769AA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 11,
    elevation: 5,
  },

  logoText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800',
  },

  brand: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1769AA',
  },

  tagline: {
    fontSize: 12,
    color: '#7B8794',
    marginTop: 4,
  },

  content: {
    width: '100%',
  },

  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#18232E',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 14,
    color: '#7A8591',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 25,
  },

  roleCard: {
    width: '100%',
    minHeight: 82,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 15,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: '#EAF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  icon: {
    fontSize: 25,
  },

  roleInfo: {
    flex: 1,
  },

  roleTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#18232E',
    marginBottom: 4,
  },

  roleSubtitle: {
    fontSize: 12,
    color: '#7A8591',
    lineHeight: 17,
  },

  arrow: {
    fontSize: 30,
    color: '#1769AA',
    marginLeft: 8,
  },

  footer: {
    textAlign: 'center',
    color: '#9AA3AD',
    fontSize: 12,
    marginTop: 28,
  },
});