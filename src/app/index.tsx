import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoText}>Q</Text>
      </View>

      <Text style={styles.title}>QCare</Text>

      <Text style={styles.subtitle}>
        Smart Hospital Queue Management
      </Text>

      <Text style={styles.description}>
        Check hospital queues, book appointments,
        and manage your waiting time easily.
      </Text>

      <TouchableOpacity
  style={styles.button}
  onPress={() => router.push('/role-section')}
>
  <Text style={styles.buttonText}>Get Started</Text>
</TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
  },

  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1769AA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  logoText: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: 'bold',
  },

  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1769AA',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 15,
  },

  description: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 23,
    maxWidth: 330,
    marginBottom: 35,
  },

  button: {
    backgroundColor: '#1769AA',
    paddingVertical: 14,
    paddingHorizontal: 55,
    borderRadius: 10,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});