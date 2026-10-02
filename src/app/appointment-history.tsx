import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const API_URL = 'https://qcare-tisd.onrender.com';

type Appointment = {
  id: number;
  doctor: string;
  token: string;
  status: string;
  appointment_time: string;
  hospital_name: string;
};

export default function AppointmentHistoryScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    try {
      const storedPatient =
        await AsyncStorage.getItem('currentPatient');

      if (!storedPatient) {
        setLoading(false);
        return;
      }

      const patient = JSON.parse(storedPatient);

      const response = await fetch(
        `${API_URL}/appointments/${patient.id}`
      );

      const data = await response.json();

      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.log('APPOINTMENT HISTORY ERROR:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1769AA" />

        <Text style={styles.loadingText}>
          Loading appointment history...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          Appointment History
        </Text>

        <Text style={styles.subtitle}>
          View your previous and current appointments.
        </Text>
      </View>

      {/* Empty State */}
      {appointments.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>H</Text>
          </View>

          <Text style={styles.emptyTitle}>
            No Appointments Yet
          </Text>

          <Text style={styles.emptyText}>
            Your completed and previous appointments
            will appear here.
          </Text>
        </View>
      ) : (
        appointments.map((appointment) => (
          <View
            key={appointment.id}
            style={styles.card}
          >
            {/* Hospital + Status */}
            <View style={styles.topRow}>
              <View style={styles.hospitalContainer}>
                <View style={styles.hospitalIcon}>
                  <Text style={styles.hospitalIconText}>
                    H
                  </Text>
                </View>

                <View style={styles.hospitalTextContainer}>
                  <Text style={styles.smallLabel}>
                    HOSPITAL
                  </Text>

                  <Text
                    style={styles.hospitalName}
                    numberOfLines={2}
                  >
                    {appointment.hospital_name}
                  </Text>
                </View>
              </View>

              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {appointment.status}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Doctor */}
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Text style={styles.infoIconText}>
                  D
                </Text>
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.label}>
                  Doctor
                </Text>

                <Text style={styles.value}>
                  {appointment.doctor}
                </Text>
              </View>
            </View>

            {/* Token */}
            <View style={styles.tokenBox}>
              <View>
                <Text style={styles.tokenLabel}>
                  TOKEN
                </Text>

                <Text style={styles.token}>
                  {appointment.token}
                </Text>
              </View>

              <View style={styles.tokenSide}>
                <Text style={styles.tokenSideLabel}>
                  STATUS
                </Text>

                <Text style={styles.tokenSideValue}>
                  {appointment.status}
                </Text>
              </View>
            </View>

            {/* Appointment Time */}
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>
                Appointment Time
              </Text>

              <Text style={styles.timeValue}>
                {appointment.appointment_time}
              </Text>
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

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F4F7FB',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#777777',
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

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
    elevation: 4,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  hospitalContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },

  hospitalIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#EAF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  hospitalIconText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1769AA',
  },

  hospitalTextContainer: {
    flex: 1,
  },

  smallLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    color: '#8A94A6',
    marginBottom: 3,
  },

  hospitalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#252525',
  },

  statusBadge: {
    backgroundColor: '#EAF4FF',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },

  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1769AA',
  },

  divider: {
    height: 1,
    backgroundColor: '#E8ECF1',
    marginVertical: 17,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 17,
  },

  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#F1F6FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  infoIconText: {
    fontSize: 14,
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

  tokenBox: {
    backgroundColor: '#F4F8FC',
    borderRadius: 15,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  tokenLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    color: '#8A94A6',
  },

  token: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#1769AA',
    marginTop: 3,
  },

  tokenSide: {
    alignItems: 'flex-end',
  },

  tokenSideLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    color: '#8A94A6',
  },

  tokenSideValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1769AA',
    marginTop: 4,
  },

  timeRow: {
    borderTopWidth: 1,
    borderTopColor: '#E8ECF1',
    paddingTop: 13,
  },

  timeLabel: {
    fontSize: 12,
    color: '#8A94A6',
    marginBottom: 4,
  },

  timeValue: {
    fontSize: 14,
    color: '#444444',
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
});