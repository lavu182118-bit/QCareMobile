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

type QueuePatient = {
  id: number;
  hospital_id: number;
  patient_name: string;
  phone: string;
  doctor: string;
  token: string;
  status: string;
  appointment_time: string;
};

const doctors = [
  'All Doctors',
  'General Physician',
  'Cardiologist',
  'Orthopedic',
  'Dermatologist',
];

export default function HospitalQueueScreen() {
  const [queue, setQueue] = useState<QueuePatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [callingPatient, setCallingPatient] =
    useState(false);

  const [completingPatient, setCompletingPatient] =
    useState(false);

  const [hospitalName, setHospitalName] =
    useState('Hospital');

  const [selectedDoctor, setSelectedDoctor] =
    useState('All Doctors');

  // LOAD QUEUE
  const loadQueue = async () => {
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

      const response = await fetch(
        `${API_URL}/live-queue/${hospitalData.id}`
      );

      const data = await response.json();

      if (data.success) {
        setQueue(data.queue || []);
      } else {
        Alert.alert(
          'Unable to Load Queue',
          data.message || 'Unable to load queue.'
        );
      }
    } catch (error) {
      console.log(
        'LOAD QUEUE ERROR:',
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

  useEffect(() => {
    loadQueue();
  }, []);

  // REFRESH
  const handleRefresh = () => {
    setRefreshing(true);
    loadQueue();
  };

  // CALL NEXT PATIENT
  const handleCallNext = async (
    patient: QueuePatient
  ) => {
    try {
      setCallingPatient(true);

      const response = await fetch(
        `${API_URL}/live-queue/call-next`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            hospitalId: patient.hospital_id,
            doctor: patient.doctor,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          'Patient Called',
          data.message
        );

        await loadQueue();
      } else {
        Alert.alert(
          'Unable to Call',
          data.message
        );
      }
    } catch (error) {
      console.log(
        'CALL NEXT ERROR:',
        error
      );

      Alert.alert(
        'Connection Error',
        'Unable to connect to QCare server.'
      );
    } finally {
      setCallingPatient(false);
    }
  };

  // COMPLETE CONSULTATION
  const handleCompleteConsultation = async (
    patient: QueuePatient
  ) => {
    try {
      setCompletingPatient(true);

      const response = await fetch(
        `${API_URL}/live-queue/complete`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            hospitalId: patient.hospital_id,
            doctor: patient.doctor,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          'Consultation Completed',
          data.message
        );

        await loadQueue();
      } else {
        Alert.alert(
          'Unable to Complete',
          data.message
        );
      }
    } catch (error) {
      console.log(
        'COMPLETE CONSULTATION ERROR:',
        error
      );

      Alert.alert(
        'Connection Error',
        'Unable to connect to QCare server.'
      );
    } finally {
      setCompletingPatient(false);
    }
  };

  // DOCTOR FILTER
  const filteredQueue =
    selectedDoctor === 'All Doctors'
      ? queue
      : queue.filter(
          (patient) =>
            patient.doctor === selectedDoctor
        );

  // COUNTS
  const waitingCount =
    filteredQueue.filter(
      (patient) =>
        patient.status === 'Waiting'
    ).length;

  const consultationCount =
    filteredQueue.filter(
      (patient) =>
        patient.status === 'In Consultation'
    ).length;

  const completedCount =
    filteredQueue.filter(
      (patient) =>
        patient.status === 'Completed'
    ).length;

  // LOADING SCREEN
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator
            size="large"
            color="#2563EB"
          />

          <Text style={styles.loadingText}>
            Loading hospital queue...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
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
              HOSPITAL QUEUE
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

        {/* MAIN INTRO */}

        <View style={styles.introSection}>
          <View style={styles.introIcon}>
            <Text style={styles.introIconText}>
              Q
            </Text>
          </View>

          <View style={styles.introTextArea}>
            <Text style={styles.pageTitle}>
              Patient & Queue Management
            </Text>

            <Text style={styles.pageSubtitle}>
              Manage today's patients and
              doctor-wise queues
            </Text>
          </View>
        </View>

        {/* DOCTOR FILTER */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Doctor-wise Queue
          </Text>

          <Text style={styles.sectionHint}>
            Filter
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.doctorFilterContainer
          }
        >
          {doctors.map((doctor) => {
            const isSelected =
              selectedDoctor === doctor;

            return (
              <TouchableOpacity
                key={doctor}
                style={[
                  styles.doctorFilter,
                  isSelected &&
                    styles.doctorFilterSelected,
                ]}
                onPress={() =>
                  setSelectedDoctor(doctor)
                }
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.doctorFilterText,
                    isSelected &&
                      styles.doctorFilterTextSelected,
                  ]}
                >
                  {doctor}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* SUMMARY */}

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View>
              <Text style={styles.summaryTitle}>
                Queue Overview
              </Text>

              <Text style={styles.summarySubtitle}>
                Current status of today's queue
              </Text>
            </View>

            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>
                LIVE
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
                {filteredQueue.length}
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
                  styles.waitingNumber,
                ]}
              >
                {waitingCount}
              </Text>

              <Text style={styles.summaryLabel}>
                Waiting
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <Text
                style={[
                  styles.summaryNumber,
                  styles.consultationNumber,
                ]}
              >
                {consultationCount}
              </Text>

              <Text style={styles.summaryLabel}>
                Consulting
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
                {completedCount}
              </Text>

              <Text style={styles.summaryLabel}>
                Completed
              </Text>
            </View>
          </View>
        </View>

        {/* QUEUE HEADER */}

        <View style={styles.queueHeader}>
          <View>
            <Text style={styles.queueTitle}>
              Today's Queue
            </Text>

            <Text style={styles.queueSubtitle}>
              Patients currently in the system
            </Text>
          </View>

          <View style={styles.queueCountBadge}>
            <Text style={styles.queueCount}>
              {filteredQueue.length}
            </Text>

            <Text style={styles.queueCountLabel}>
              {filteredQueue.length === 1
                ? 'Patient'
                : 'Patients'}
            </Text>
          </View>
        </View>

        {/* EMPTY QUEUE */}

        {filteredQueue.length === 0 && (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Text style={styles.emptyIcon}>
                ✓
              </Text>
            </View>

            <Text style={styles.emptyTitle}>
              No patients in this queue
            </Text>

            <Text style={styles.emptyText}>
              There are currently no patients
              for the selected doctor.
            </Text>
          </View>
        )}

        {/* PATIENT CARDS */}

        {filteredQueue.map((patient) => (
          <View
            key={patient.id}
            style={styles.patientCard}
          >

            {/* PATIENT TOP */}

            <View style={styles.patientTop}>
              <View style={styles.tokenContainer}>
                <Text style={styles.tokenLabel}>
                  TOKEN NUMBER
                </Text>

                <Text style={styles.tokenText}>
                  {patient.token}
                </Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  patient.status === 'Waiting' &&
                    styles.waitingBadge,
                  patient.status ===
                    'In Consultation' &&
                    styles.consultationBadge,
                  patient.status === 'Completed' &&
                    styles.completedBadge,
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    patient.status === 'Waiting' &&
                      styles.waitingDot,
                    patient.status ===
                      'In Consultation' &&
                      styles.consultationDot,
                    patient.status === 'Completed' &&
                      styles.completedDot,
                  ]}
                />

                <Text
                  style={[
                    styles.statusText,
                    patient.status === 'Waiting' &&
                      styles.waitingText,
                    patient.status ===
                      'In Consultation' &&
                      styles.consultationText,
                    patient.status === 'Completed' &&
                      styles.completedText,
                  ]}
                >
                  {patient.status}
                </Text>
              </View>
            </View>

            {/* PATIENT NAME */}

            <Text style={styles.patientName}>
              {patient.patient_name}
            </Text>

            {/* PATIENT DETAILS */}

            <View style={styles.patientDetails}>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>
                  DOCTOR
                </Text>

                <Text
                  style={styles.detailValue}
                  numberOfLines={1}
                >
                  {patient.doctor}
                </Text>
              </View>

              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>
                  PHONE
                </Text>

                <Text style={styles.detailValue}>
                  {patient.phone}
                </Text>
              </View>
            </View>

            {/* CALL NEXT */}

            {patient.status === 'Waiting' && (
              <TouchableOpacity
                style={[
                  styles.callButton,
                  callingPatient &&
                    styles.disabledButton,
                ]}
                onPress={() =>
                  handleCallNext(patient)
                }
                disabled={callingPatient}
                activeOpacity={0.85}
              >
                <Text style={styles.callIcon}>
                  →
                </Text>

                <Text style={styles.callButtonText}>
                  {callingPatient
                    ? 'Calling...'
                    : 'Call Next Patient'}
                </Text>
              </TouchableOpacity>
            )}

            {/* COMPLETE CONSULTATION */}

            {patient.status ===
              'In Consultation' && (
              <TouchableOpacity
                style={[
                  styles.completeButton,
                  completingPatient &&
                    styles.disabledButton,
                ]}
                onPress={() =>
                  handleCompleteConsultation(
                    patient
                  )
                }
                disabled={completingPatient}
                activeOpacity={0.85}
              >
                <Text style={styles.completeIcon}>
                  ✓
                </Text>

                <Text
                  style={
                    styles.completeButtonText
                  }
                >
                  {completingPatient
                    ? 'Completing...'
                    : 'Complete Consultation'}
                </Text>
              </TouchableOpacity>
            )}

            {/* COMPLETED */}

            {patient.status === 'Completed' && (
              <View
                style={styles.completedMessage}
              >
                <Text
                  style={
                    styles.completedMessageText
                  }
                >
                  ✓ Consultation completed
                </Text>
              </View>
            )}
          </View>
        ))}
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
});