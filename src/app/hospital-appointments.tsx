import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';

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

const API_URL = 'https://qcare-tisd.onrender.com';

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
  const [appointments, setAppointments] =
    useState<Appointment[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [hospitalName, setHospitalName] =
    useState('Hospital');

  const [total, setTotal] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [remaining, setRemaining] = useState(0);

  // ==================================================
  // LOAD APPOINTMENTS
  // ==================================================

  const loadAppointments = async () => {
    try {
      const loggedIn =
        await AsyncStorage.getItem('hospitalLoggedIn');

      const hospitalDataString =
        await AsyncStorage.getItem('currentHospital');

      if (
        loggedIn !== 'true' ||
        !hospitalDataString
      ) {
        router.replace('/hospital-login');
        return;
      }

      const hospitalData =
        JSON.parse(hospitalDataString);

      setHospitalName(
        hospitalData.name || 'Hospital'
      );

      const hospitalId = hospitalData.id;

      const appointmentResponse = await fetch(
        `${API_URL}/hospital-appointments/${hospitalId}`
      );

      const appointmentData =
        await appointmentResponse.json();

      if (appointmentData.success) {
        setAppointments(
          appointmentData.appointments || []
        );
      } else {
        Alert.alert(
          'Unable to Load Appointments',
          appointmentData.message ||
            'Unable to load appointments.'
        );
      }

      const summaryResponse = await fetch(
        `${API_URL}/hospital-appointment-summary/${hospitalId}`
      );

      const summaryData =
        await summaryResponse.json();

      if (summaryData.success) {
        setTotal(Number(summaryData.total) || 0);
        setCompleted(
          Number(summaryData.completed) || 0
        );
        setRemaining(
          Number(summaryData.remaining) || 0
        );
      }
    } catch (error) {
      console.log(
        'LOAD HOSPITAL APPOINTMENTS ERROR:',
        error
      );

      Alert.alert(
        'Connection Error',
        'Unable to connect to QCare server.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==================================================
  // INITIAL LOAD
  // ==================================================

  useEffect(() => {
    loadAppointments();
  }, []);

  // ==================================================
  // REFRESH
  // ==================================================

  const handleRefresh = () => {
    setRefreshing(true);
    loadAppointments();
  };

  // ==================================================
  // FORMAT DATE
  // ==================================================

  const formatAppointmentTime = (
    appointmentTime: string
  ) => {
    if (!appointmentTime) {
      return 'Not available';
    }

    try {
      const date = new Date(appointmentTime);

      if (isNaN(date.getTime())) {
        return appointmentTime;
      }

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

  // ==================================================
  // STATUS STYLE
  // ==================================================

  const getStatusStyle = (status: string) => {
    const normalized =
      status?.toLowerCase();

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

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <View style={styles.loadingIcon}>
            <Text style={styles.loadingIconText}>
              Q
            </Text>
          </View>

          <ActivityIndicator
            size="large"
            color="#2563EB"
          />

          <Text style={styles.loadingTitle}>
            Loading appointments
          </Text>

          <Text style={styles.loadingText}>
            Please wait while we load your hospital
            appointments.
          </Text>
        </View>
      </View>
    );
  }

  // ==================================================
  // MAIN SCREEN
  // ==================================================

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
            <Text style={styles.headerSmall}>
              HOSPITAL APPOINTMENTS
            </Text>

            <Text
              style={styles.headerTitle}
              numberOfLines={1}
            >
              {hospitalName}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.backArrow}>
              ‹
            </Text>

            <Text style={styles.backButtonText}>
              Back
            </Text>
          </TouchableOpacity>
        </View>

        {/* INTRO */}

        <View style={styles.introSection}>
          <View style={styles.introIcon}>
            <Text style={styles.introIconText}>
              A
            </Text>
          </View>

          <View style={styles.introTextArea}>
            <Text style={styles.pageTitle}>
              Appointment Management
            </Text>

            <Text style={styles.pageSubtitle}>
              View and monitor appointments registered
              at your hospital.
            </Text>
          </View>
        </View>

        {/* TODAY SUMMARY */}

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View>
              <Text style={styles.summaryTitle}>
                Today's Overview
              </Text>

              <Text style={styles.summarySubtitle}>
                Appointment activity for today
              </Text>
            </View>

            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />

              <Text style={styles.liveText}>
                TODAY
              </Text>
            </View>
          </View>

          <View style={styles.summaryRow}>

            <View style={styles.summaryItem}>
              <Text
                style={[
                  styles.summaryNumber,
                  styles.totalNumber,
                ]}
              >
                {total}
              </Text>

              <Text style={styles.summaryLabel}>
                Total
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <Text
                style={[
                  styles.summaryNumber,
                  styles.remainingNumber,
                ]}
              >
                {remaining}
              </Text>

              <Text style={styles.summaryLabel}>
                Remaining
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <Text
                style={[
                  styles.summaryNumber,
                  styles.completedNumber,
                ]}
              >
                {completed}
              </Text>

              <Text style={styles.summaryLabel}>
                Completed
              </Text>
            </View>

          </View>
        </View>

        {/* APPOINTMENT HEADER */}

        <View style={styles.appointmentHeader}>
          <View style={styles.appointmentHeaderText}>
            <Text style={styles.appointmentTitle}>
              All Appointments
            </Text>

            <Text style={styles.appointmentSubtitle}>
              Patient appointments registered at this
              hospital
            </Text>
          </View>

          <View style={styles.appointmentCountBadge}>
            <Text style={styles.appointmentCount}>
              {appointments.length}
            </Text>

            <Text style={styles.appointmentCountLabel}>
              {appointments.length === 1
                ? 'Patient'
                : 'Patients'}
            </Text>
          </View>
        </View>

        {/* EMPTY */}

        {appointments.length === 0 && (
          <View style={styles.emptyAppointmentCard}>
            <View
              style={
                styles.emptyAppointmentIconCircle
              }
            >
              <Text style={styles.emptyAppointmentIcon}>
                ✓
              </Text>
            </View>

            <Text style={styles.emptyAppointmentTitle}>
              No appointments found
            </Text>

            <Text style={styles.emptyAppointmentText}>
              There are currently no appointments
              registered for this hospital.
            </Text>
          </View>
        )}

        {/* APPOINTMENTS */}

        {appointments.map((appointment) => {
          const statusStyle =
            getStatusStyle(
              appointment.status
            );

          return (
            <View
              key={appointment.id}
              style={styles.appointmentCard}
            >

              <View style={styles.appointmentTop}>
                <View style={styles.tokenContainer}>
                  <Text style={styles.tokenLabel}>
                    TOKEN NUMBER
                  </Text>

                  <Text style={styles.tokenText}>
                    {appointment.token}
                  </Text>
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
                      ? appointment.patient_name
                          .charAt(0)
                          .toUpperCase()
                      : 'P'}
                  </Text>
                </View>

                <View style={styles.patientInfo}>
                  <Text
                    style={styles.patientNameLarge}
                    numberOfLines={1}
                  >
                    {appointment.patient_name ||
                      'Patient'}
                  </Text>

                  <Text style={styles.patientIdText}>
                    Appointment #{appointment.id}
                  </Text>
                </View>
              </View>

              <View style={styles.appointmentDetailsRow}>

                <View
                  style={styles.appointmentDetailBox}
                >
                  <Text
                    style={styles.appointmentDetailLabel}
                  >
                    DOCTOR
                  </Text>

                  <Text
                    style={styles.appointmentDetailValue}
                    numberOfLines={2}
                  >
                    {appointment.doctor}
                  </Text>
                </View>

                <View
                  style={styles.appointmentDetailBox}
                >
                  <Text
                    style={styles.appointmentDetailLabel}
                  >
                    DATE & TIME
                  </Text>

                  <Text
                    style={styles.appointmentDetailValue}
                    numberOfLines={2}
                  >
                    {formatAppointmentTime(
                      appointment.appointment_time
                    )}
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
// ==================================================
// STYLES
// ==================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 40,
  },

  // ==================================================
  // HEADER
  // ==================================================

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  headerLeft: {
    flex: 1,
    paddingRight: 12,
  },

  headerSmall: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#64748B',
    marginBottom: 5,
  },

  headerTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#0F172A',
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  backArrow: {
    fontSize: 24,
    lineHeight: 22,
    color: '#2563EB',
    marginRight: 3,
  },

  backButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },

  // ==================================================
  // INTRO
  // ==================================================

  introSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  introIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  introIconText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  introTextArea: {
    flex: 1,
  },

  pageTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },

  pageSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: '#64748B',
  },

  // ==================================================
  // SUMMARY
  // ==================================================

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 27,
    borderWidth: 1,
    borderColor: '#E8EDF5',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 3,
  },

  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },

  summarySubtitle: {
    fontSize: 12,
    color: '#64748B',
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginRight: 5,
  },

  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.5,
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },

  summaryNumber: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },

  totalNumber: {
    color: '#2563EB',
  },

  remainingNumber: {
    color: '#D97706',
  },

  completedNumber: {
    color: '#059669',
  },

  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },

  summaryDivider: {
    width: 1,
    height: 34,
    backgroundColor: '#E2E8F0',
  },

  // ==================================================
  // APPOINTMENT HEADER
  // ==================================================

  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  appointmentHeaderText: {
    flex: 1,
    paddingRight: 12,
  },

  appointmentTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },

  appointmentSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
  },

  appointmentCountBadge: {
    minWidth: 52,
    paddingHorizontal: 9,
    paddingVertical: 8,
    borderRadius: 13,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  appointmentCount: {
    fontSize: 17,
    fontWeight: '900',
    color: '#2563EB',
  },

  appointmentCountLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 1,
  },

  // ==================================================
  // APPOINTMENT CARD
  // ==================================================

  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 17,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#E8EDF5',
    shadowColor: '#0F172A',
    shadowOpacity: 0.045,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  appointmentTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  tokenContainer: {
    flex: 1,
  },

  tokenLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.7,
    marginBottom: 3,
  },

  tokenText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2563EB',
  },

  appointmentStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },

  appointmentStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  appointmentStatusText: {
    fontSize: 10,
    fontWeight: '800',
  },

  waitingBadge: {
    backgroundColor: '#FFF7ED',
  },

  waitingDot: {
    backgroundColor: '#F59E0B',
  },

  waitingText: {
    color: '#B45309',
  },

  consultationBadge: {
    backgroundColor: '#F5F3FF',
  },

  consultationDot: {
    backgroundColor: '#8B5CF6',
  },

  consultationText: {
    color: '#6D28D9',
  },

  completedBadge: {
    backgroundColor: '#ECFDF5',
  },

  completedDot: {
    backgroundColor: '#10B981',
  },

  completedText: {
    color: '#047857',
  },

  cancelledBadge: {
    backgroundColor: '#FEF2F2',
  },

  cancelledDot: {
    backgroundColor: '#EF4444',
  },

  cancelledText: {
    color: '#B91C1C',
  },

  // ==================================================
  // PATIENT
  // ==================================================

  patientSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  patientAvatar: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  patientAvatarText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2563EB',
  },

  patientInfo: {
    flex: 1,
  },

  patientNameLarge: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 3,
  },

  patientIdText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },

  // ==================================================
  // DETAILS
  // ==================================================

  appointmentDetailsRow: {
    flexDirection: 'row',
    gap: 9,
  },

  appointmentDetailBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },

  appointmentDetailLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 5,
  },

  appointmentDetailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    lineHeight: 17,
  },

  // ==================================================
  // EMPTY STATE
  // ==================================================

  emptyAppointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 38,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8EDF5',
  },

  emptyAppointmentIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  emptyAppointmentIcon: {
    fontSize: 27,
    fontWeight: '900',
    color: '#2563EB',
  },

  emptyAppointmentTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },

  emptyAppointmentText: {
    fontSize: 12,
    lineHeight: 19,
    color: '#64748B',
    textAlign: 'center',
  },

  // ==================================================
  // LOADING
  // ==================================================

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F7FB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  loadingCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 32,
    paddingHorizontal: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8EDF5',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 3,
  },

  loadingIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  loadingIconText: {
    fontSize: 25,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  loadingTitle: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },

  loadingText: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
    textAlign: 'center',
  },
});