import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const API_URL = 'https://qcare-tisd.onrender.com';

type QueueItem = {
  id: number;
  patient_id: number;
  hospital_id: number;
  patient_name: string;
  phone: string;
  doctor: string;
  token: string;
  status: string;
  appointment_time: string;
};

export default function MyQueueScreen() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadQueue = async () => {
    try {
      const storedPatient = await AsyncStorage.getItem('currentPatient');

      if (!storedPatient) {
        Alert.alert('Login Required', 'Please login again.');
        return;
      }

      const patient = JSON.parse(storedPatient);

      const response = await fetch(
        `${API_URL}/patient-live-queue/${patient.id}`
      );

      const data = await response.json();

      if (data.success) {
        setQueue(data.queue || []);
      } else {
        setQueue([]);
      }
    } catch (error) {
      console.log('QUEUE ERROR:', error);
      Alert.alert(
        'Connection Error',
        'Unable to load your queue.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Queue</Text>

        <Text style={styles.subtitle}>
          Track your current appointment and queue status.
        </Text>
      </View>

      {/* Loading */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#1769AA"
          />

          <Text style={styles.loadingText}>
            Loading your queue...
          </Text>
        </View>
      ) : queue.length === 0 ? (
        /* Empty State */
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>Q</Text>
          </View>

          <Text style={styles.emptyTitle}>
            No Active Queue
          </Text>

          <Text style={styles.emptyText}>
            You don't have an active appointment right now.
          </Text>
        </View>
      ) : (
        /* Queue Cards */
        queue.map((item) => (
          <View key={item.id} style={styles.queueCard}>

            {/* Card Header */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderTitle}>
                Current Appointment
              </Text>

              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />

                <Text style={styles.statusBadgeText}>
                  {item.status}
                </Text>
              </View>
            </View>

            {/* Token Section */}
            <View style={styles.tokenSection}>
              <Text style={styles.tokenLabel}>
                YOUR TOKEN
              </Text>

              <Text style={styles.token}>
                {item.token}
              </Text>

              <Text style={styles.tokenInfo}>
                Please wait for your token to be called.
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Doctor */}
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Text style={styles.infoIconText}>D</Text>
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.label}>
                  Doctor
                </Text>

                <Text style={styles.value}>
                  {item.doctor}
                </Text>
              </View>
            </View>

            {/* Status */}
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Text style={styles.infoIconText}>S</Text>
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.label}>
                  Queue Status
                </Text>

                <Text style={styles.statusValue}>
                  {item.status}
                </Text>
              </View>
            </View>

          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },

  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 25,
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1769AA',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: '#667085',
    lineHeight: 21,
  },

  loadingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 40,
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#777777',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    elevation: 3,
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EAF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },

  emptyIconText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1769AA',
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 21,
  },

  queueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    marginBottom: 18,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF4FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#1769AA',
    marginRight: 6,
  },

  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1769AA',
  },

  tokenSection: {
    alignItems: 'center',
    paddingVertical: 25,
  },

  tokenLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    color: '#8A94A6',
  },

  token: {
    fontSize: 46,
    fontWeight: 'bold',
    color: '#1769AA',
    marginTop: 5,
  },

  tokenInfo: {
    fontSize: 12,
    color: '#8A94A6',
    marginTop: 4,
    textAlign: 'center',
  },

  divider: {
    height: 1,
    backgroundColor: '#E8ECF1',
    marginBottom: 8,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },

  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EAF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  infoIconText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1769AA',
  },

  infoContent: {
    flex: 1,
  },

  label: {
    fontSize: 12,
    color: '#8A94A6',
    marginBottom: 3,
  },

  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#252525',
  },

  statusValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1769AA',
  },
});