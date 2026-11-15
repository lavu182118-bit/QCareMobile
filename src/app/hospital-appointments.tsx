import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const API_URL = 'https://qcare-backend-o8za.onrender.com';

type Appointment = {
  id: number;
  patient_id: number;
  hospital_id: number;
  patient_name: string;
  doctor: string;
  token: string;
  status: string;
  appointment_time: string;
};

export default function HospitalAppointmentsScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hospitalName, setHospitalName] = useState('Hospital');
  const [total, setTotal] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [remaining, setRemaining] = useState(0);

  // SAFE RESPONSE PARSER
  const readResponse = async (response: Response) => {
    const text = await response.text();

    try {
      return text ? JSON.parse(text) : {};
    } catch {
      return {};
    }
  };

  // LOAD APPOINTMENTS
  const loadAppointments = useCallback(async () => {
    try {
      const loggedIn = await AsyncStorage.getItem('hospitalLoggedIn');
      const hospitalDataString = await AsyncStorage.getItem('currentHospital');

      if (loggedIn !== 'true' || !hospitalDataString) {
        router.replace('/hospital-login');
        return;
      }

      const hospitalData = JSON.parse(hospitalDataString);

      if (!hospitalData?.id) {
        Alert.alert(
          'Hospital Error',
          'Hospital information is missing. Please login again.'
        );
        router.replace('/hospital-login');
        return;
      }

      setHospitalName(hospitalData.name || 'Hospital');

      const hospitalId = hospitalData.id;

      // APPOINTMENTS
      const appointmentResponse = await fetch(
        `${API_URL}/hospital-appointments/${hospitalId}`
      );

      const appointmentData = await readResponse(appointmentResponse);

      if (!appointmentResponse.ok || !appointmentData.success) {
        Alert.alert(
          'Unable to Load Appointments',
          appointmentData.message || 'Unable to load appointments.'
        );
      } else {
        setAppointments(
          Array.isArray(appointmentData.appointments)
            ? appointmentData.appointments
            : []
        );
      }

      // SUMMARY
      const summaryResponse = await fetch(
        `${API_URL}/hospital-appointment-summary/${hospitalId}`
      );

      const summaryData = await readResponse(summaryResponse);

      if (summaryResponse.ok && summaryData.success) {
        setTotal(Number(summaryData.total) || 0);
        setCompleted(Number(summaryData.completed) || 0);
        setRemaining(Number(summaryData.remaining) || 0);
      }
    } catch (error) {
      console.log('LOAD HOSPITAL APPOINTMENTS ERROR:', error);

      Alert.alert(
        'Connection Error',
        'Unable to connect to QCare server.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // INITIAL LOAD
  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // REFRESH
  const handleRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    loadAppointments();
  };

  // FORMAT DATE
  const formatAppointmentTime = (appointmentTime: string) => {
    if (!appointmentTime) return 'Not available';

    try {
      const date = new Date(appointmentTime);

      if (isNaN(date.getTime())) return appointmentTime;

      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return appointmentTime;
    }
  };

  // STATUS STYLE
  const getStatusStyle = (status: string) => {
    const normalized = status?.toLowerCase();

    if (normalized === 'completed') {
      return {
        badge: styles.completedBadge,
        dot: styles.completedDot,
        text: styles.completedText,
      };
    }

    if (
      normalized === 'in consultation' ||
      normalized === 'consulting'
    ) {
      return {
        badge: styles.consultationBadge,
        dot: styles.consultationDot,
        text: styles.consultationText,
      };
    }

    if (normalized === 'cancelled') {
      return {
        badge: styles.cancelledBadge,
        dot: styles.cancelledDot,
        text: styles.cancelledText,
      };
    }

    return {
      badge: styles.waitingBadge,
      dot: styles.waitingDot,
      text: styles.waitingText,
    };
  };

  // LOADING
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <View style={styles.loadingIcon}>
            <Text style={styles.loadingIconText}>Q</Text>
          </View>

          <ActivityIndicator size="large" color="#2563EB" />

          <Text style={styles.loadingTitle}>Loading appointments</Text>

          <Text style={styles.loadingText}>
            Please wait while we load your hospital appointments.
          </Text>
        </View>
      </View>
    );
  }

  // MAIN SCREEN
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#2563EB"
          />
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerSmall}>HOSPITAL APPOINTMENTS</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {hospitalName}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.backArrow}>‹</Text>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>

        {/* INTRO */}
        <View style={styles.introSection}>
          <View style={styles.introIcon}>
            <Text style={styles.introIconText}>A</Text>
          </View>

          <View style={styles.introTextArea}>
            <Text style={styles.pageTitle}>Appointment Management</Text>
            <Text style={styles.pageSubtitle}>
              View and monitor appointments registered at your hospital.
            </Text>
          </View>
        </View>

        {/* TODAY SUMMARY */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View>
              <Text style={styles.summaryTitle}>Today's Overview</Text>
              <Text style={styles.summarySubtitle}>
                Appointment activity for today
              </Text>
            </View>

            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>TODAY</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, styles.totalNumber]}>
                {total}
              </Text>
              <Text style={styles.summaryLabel}>Total</Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, styles.remainingNumber]}>
                {remaining}
              </Text>
              <Text style={styles.summaryLabel}>Remaining</Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, styles.completedNumber]}>
                {completed}
              </Text>
              <Text style={styles.summaryLabel}>Completed</Text>
            </View>
          </View>
        </View>

        {/* APPOINTMENT HEADER */}
        <View style={styles.appointmentHeader}>
          <View style={styles.appointmentHeaderText}>
            <Text style={styles.appointmentTitle}>All Appointments</Text>
            <Text style={styles.appointmentSubtitle}>
              Patient appointments registered at this hospital
            </Text>
          </View>

          <View style={styles.appointmentCountBadge}>
            <Text style={styles.appointmentCount}>{appointments.length}</Text>
            <Text style={styles.appointmentCountLabel}>
              {appointments.length === 1 ? 'Patient' : 'Patients'}
            </Text>
          </View>
        </View>

        {/* EMPTY */}
        {appointments.length === 0 && (
          <View style={styles.emptyAppointmentCard}>
            <View style={styles.emptyAppointmentIconCircle}>
              <Text style={styles.emptyAppointmentIcon}>✓</Text>
            </View>

            <Text style={styles.emptyAppointmentTitle}>
              No appointments found
            </Text>

            <Text style={styles.emptyAppointmentText}>
              There are currently no appointments registered for this hospital.
            </Text>
          </View>
        )}

        {/* APPOINTMENTS */}
        {appointments.map((appointment) => {
          const statusStyle = getStatusStyle(appointment.status);

          return (
            <View key={appointment.id} style={styles.appointmentCard}>
              <View style={styles.appointmentTop}>
                <View style={styles.tokenContainer}>
                  <Text style={styles.tokenLabel}>TOKEN NUMBER</Text>
                  <Text style={styles.tokenText}>{appointment.token}</Text>
                </View>

                <View
                  style={[
                    styles.appointmentStatusBadge,
                    statusStyle.badge,
                  ]}
                >
                  <View
                    style={[
                      styles.appointmentStatusDot,
                      statusStyle.dot,
                    ]}
                  />

                  <Text
                    style={[
                      styles.appointmentStatusText,
                      statusStyle.text,
                    ]}
                  >
                    {appointment.status}
                  </Text>
                </View>
              </View>

              <View style={styles.patientSection}>
                <View style={styles.patientAvatar}>
                  <Text style={styles.patientAvatarText}>
                    {appointment.patient_name
                      ? appointment.patient_name.charAt(0).toUpperCase()
                      : 'P'}
                  </Text>
                </View>

                <View style={styles.patientInfo}>
                  <Text style={styles.patientNameLarge} numberOfLines={1}>
                    {appointment.patient_name || 'Patient'}
                  </Text>
                  <Text style={styles.patientIdText}>
                    Appointment #{appointment.id}
                  </Text>
                </View>
              </View>

              <View style={styles.appointmentDetailsRow}>
                <View style={styles.appointmentDetailBox}>
                  <Text style={styles.appointmentDetailLabel}>DOCTOR</Text>
                  <Text style={styles.appointmentDetailValue} numberOfLines={2}>
                    {appointment.doctor}
                  </Text>
                </View>

                <View style={styles.appointmentDetailBox}>
                  <Text style={styles.appointmentDetailLabel}>DATE & TIME</Text>
                  <Text style={styles.appointmentDetailValue} numberOfLines={2}>
                    {formatAppointmentTime(appointment.appointment_time)}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FC',
  },

  scrollContent: {
    paddingBottom: 40,
  },

  // LOADING
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F6F8FC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingCard: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },

  // HEADER
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 52,
    paddingHorizontal: 18,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEFF5',
  },

  headerLeft: {
    flex: 1,
    paddingRight: 12,
  },

  headerSmall: {
    color: '#2563EB',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 5,
  },

  headerTitle: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '800',
  },

  backButton: {
    height: 42,
    paddingHorizontal: 13,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backArrow: {
    color: '#0F172A',
    fontSize: 25,
    lineHeight: 26,
    marginRight: 4,
    marginTop: -2,
  },

  backButtonText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '800',
  },

  // INTRO
  introSection: {
    marginHorizontal: 18,
    marginTop: 20,
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9EEF5',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  introIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  introIconText: {
    color: '#2563EB',
    fontSize: 21,
    fontWeight: '900',
  },

  introTextArea: {
    flex: 1,
  },

  pageTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '800',
  },

  pageSubtitle: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 17,
  },

  // SECTION HEADER
  sectionHeader: {
    marginTop: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
  },

  sectionHint: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },

  // DOCTOR FILTER
  doctorFilterContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 3,
  },

  doctorFilter: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 14,
    marginRight: 8,
  },

  doctorFilterSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },

  doctorFilterText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
  },

  doctorFilterTextSelected: {
    color: '#FFFFFF',
  },

  // SUMMARY
  summaryCard: {
    marginHorizontal: 18,
    marginTop: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E9EEF5',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 17,
  },

  summaryTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },

  summarySubtitle: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 3,
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF3',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#16A34A',
    marginRight: 5,
  },

  liveText: {
    color: '#15803D',
    fontSize: 9,
    fontWeight: '900',
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },

  summaryDivider: {
    width: 1,
    height: 34,
    backgroundColor: '#EAEFF5',
  },

  summaryNumber: {
    fontSize: 21,
    fontWeight: '900',
  },

  totalNumber: {
    color: '#0F172A',
  },

  waitingNumber: {
    color: '#D97706',
  },

  consultationNumber: {
    color: '#2563EB',
  },

  completedNumber: {
    color: '#16A34A',
  },

  summaryLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 4,
  },

  // QUEUE HEADER
  queueHeader: {
    marginHorizontal: 20,
    marginTop: 25,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  queueTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '800',
  },

  queueSubtitle: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 3,
  },

  queueCountBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },

  queueCount: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '900',
  },

  queueCountLabel: {
    color: '#64748B',
    fontSize: 8,
    fontWeight: '700',
    marginTop: 1,
  },

  // EMPTY
  emptyCard: {
    marginHorizontal: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 25,
    paddingVertical: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9EEF5',
  },

  emptyIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#ECFDF3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  emptyIcon: {
    color: '#16A34A',
    fontSize: 25,
    fontWeight: '900',
  },

  emptyTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },

  emptyText: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },

  // PATIENT CARD
  patientCard: {
    marginHorizontal: 18,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E7ECF3',
    shadowColor: '#0F172A',
    shadowOpacity: 0.035,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  patientTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  tokenContainer: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },

  tokenLabel: {
    color: '#64748B',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.7,
  },

  tokenText: {
    color: '#2563EB',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },

  // STATUS
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },

  waitingBadge: {
    backgroundColor: '#FEF3C7',
  },

  consultationBadge: {
    backgroundColor: '#DBEAFE',
  },

  completedBadge: {
    backgroundColor: '#DCFCE7',
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  waitingDot: {
    backgroundColor: '#D97706',
  },

  consultationDot: {
    backgroundColor: '#2563EB',
  },

  completedDot: {
    backgroundColor: '#16A34A',
  },

  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },

  waitingText: {
    color: '#B45309',
  },

  consultationText: {
    color: '#1D4ED8',
  },

  completedText: {
    color: '#15803D',
  },

  // PATIENT
  patientName: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 16,
  },

  patientDetails: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },

  detailBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 11,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },

  detailLabel: {
    color: '#94A3B8',
    fontSize: 8,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 0.5,
  },

  detailValue: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '700',
  },

  // BUTTONS
  callButton: {
    height: 48,
    width: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },

  callIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginRight: 7,
  },

  callButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  completeButton: {
    height: 48,
    width: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 13,
  },

  completeIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginRight: 7,
  },

  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  disabledButton: {
    opacity: 0.65,
  },

  // COMPLETED
  completedMessage: {
    width: '100%',
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 13,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },

  completedMessageText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '800',
  },

  // ADD MISSING APPOINTMENT STYLES

  loadingIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  loadingIconText: {
    color: '#2563EB',
    fontSize: 28,
    fontWeight: '900',
  },

  loadingTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 15,
  },

  remainingNumber: {
    color: '#D97706',
  },

  appointmentHeader: {
    marginHorizontal: 18,
    marginTop: 25,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  appointmentHeaderText: {
    flex: 1,
    paddingRight: 10,
  },

  appointmentTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '800',
  },

  appointmentSubtitle: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 3,
  },

  appointmentCountBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },

  appointmentCount: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '900',
  },

  appointmentCountLabel: {
    color: '#64748B',
    fontSize: 8,
    fontWeight: '700',
  },

  emptyAppointmentCard: {
    marginHorizontal: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9EEF5',
  },

  emptyAppointmentIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#ECFDF3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  emptyAppointmentIcon: {
    color: '#16A34A',
    fontSize: 25,
    fontWeight: '900',
  },

  emptyAppointmentTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },

  emptyAppointmentText: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },

  appointmentCard: {
    marginHorizontal: 18,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E7ECF3',
    elevation: 2,
  },

  appointmentTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  appointmentStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },

  appointmentStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  appointmentStatusText: {
    fontSize: 9,
    fontWeight: '800',
  },

  cancelledBadge: {
    backgroundColor: '#FEE2E2',
  },

  cancelledDot: {
    backgroundColor: '#DC2626',
  },

  cancelledText: {
    color: '#B91C1C',
  },

  patientSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },

  patientAvatar: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  patientAvatarText: {
    color: '#2563EB',
    fontSize: 18,
    fontWeight: '900',
  },

  patientInfo: {
    flex: 1,
  },

  patientNameLarge: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
  },

  patientIdText: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 4,
  },

  appointmentDetailsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },

  appointmentDetailBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 11,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },

  appointmentDetailLabel: {
    color: '#94A3B8',
    fontSize: 8,
    fontWeight: '800',
    marginBottom: 4,
  },

  appointmentDetailValue: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '700',
  },
});