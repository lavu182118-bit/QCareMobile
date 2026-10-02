import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

const API_URL = 'https://qcare-tisd.onrender.com';

type HospitalDetails = {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
};

type QueueItem = {
  id?: number;
  token?: string;
  patient_name?: string;
  doctor?: string;
  status?: string;
};

type DoctorAvailability = {
  id?: number;
  hospital_id?: number;
  doctor: string;
  status?: string;
  expected_arrival_time?: string | null;
  updated_at?: string;
};

export default function HospitalDetailsScreen() {
  const { hospitalId } = useLocalSearchParams();

  const [hospital, setHospital] =
    useState<HospitalDetails | null>(null);

  const [queueData, setQueueData] =
    useState<QueueItem[]>([]);

  const [doctorAvailability, setDoctorAvailability] =
    useState<DoctorAvailability[]>([]);

  const [loading, setLoading] = useState(true);
  const [queueLoading, setQueueLoading] = useState(true);

  const loadHospitalDetails = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/hospital-profile/${hospitalId}`
      );

      const data = await response.json();

      if (data.success && data.hospital) {
        setHospital(data.hospital);
      } else {
        setHospital(null);
      }
    } catch (error) {
      console.log(
        'HOSPITAL DETAILS LOAD ERROR:',
        error
      );

      setHospital(null);
    } finally {
      setLoading(false);
    }
  };

  const loadQueue = async () => {
    try {
      setQueueLoading(true);

      const response = await fetch(
        `${API_URL}/live-queue/${hospitalId}`
      );

      const data = await response.json();

      if (data.success && data.queue) {
        setQueueData(data.queue);
      } else {
        setQueueData([]);
      }
    } catch (error) {
      console.log(
        'HOSPITAL QUEUE LOAD ERROR:',
        error
      );

      setQueueData([]);
    } finally {
      setQueueLoading(false);
    }
  };

  const loadDoctorAvailability = async () => {
    try {
      const response = await fetch(
        `${API_URL}/doctor-availability/${hospitalId}`
      );

      const data = await response.json();

      if (data.success && data.doctors) {
        setDoctorAvailability(data.doctors);
      } else {
        setDoctorAvailability([]);
      }
    } catch (error) {
      console.log(
        'DOCTOR AVAILABILITY LOAD ERROR:',
        error
      );

      setDoctorAvailability([]);
    }
  };

  useEffect(() => {
    if (!hospitalId) return;

    loadHospitalDetails();
    loadQueue();
    loadDoctorAvailability();
  }, [hospitalId]);

  const handleContinue = () => {
    if (!hospitalId) {
      Alert.alert(
        'Error',
        'Hospital information is unavailable.'
      );
      return;
    }

    router.push({
      pathname: '/booking',
      params: {
        hospitalId: String(hospitalId),
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingIcon}>
          <Text style={styles.loadingEmoji}>
            🏥
          </Text>
        </View>

        <ActivityIndicator
          size="small"
          color="#2563EB"
        />

        <Text style={styles.loadingText}>
          Loading hospital details...
        </Text>
      </View>
    );
  }

  if (!hospital) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingIcon}>
          <Text style={styles.loadingEmoji}>
            🏥
          </Text>
        </View>

        <Text style={styles.errorTitle}>
          Hospital details unavailable
        </Text>

        <Text style={styles.errorText}>
          Unable to load this hospital right now.
        </Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const waitingPatients = queueData.filter(
    (item) =>
      item.status !== 'Completed'
  );

  const getDoctorWaitingCount = (
    doctorName: string
  ) => {
    return waitingPatients.filter(
      (item) => item.doctor === doctorName
    ).length;
  };

  const getDoctorAvailability = (
    doctorName: string
  ) => {
    return doctorAvailability.find(
      (item) => item.doctor === doctorName
    );
  };

  const doctors = [
    'General Physician',
    'Cardiologist',
    'Orthopedic',
    'Dermatologist',
  ];

  const getDoctorQueue = (
    doctorName: string
  ) => {
    return waitingPatients.filter(
      (item) => item.doctor === doctorName
    );
  };

  const getDoctorCurrentToken = (
    doctorName: string
  ) => {
    const doctorQueue =
      getDoctorQueue(doctorName);

    return doctorQueue.length > 0
      ? doctorQueue[0].token || '--'
      : '--';
  };

  const getDoctorEstimatedWait = (
    doctorName: string
  ) => {
    const count =
      getDoctorQueue(doctorName).length;

    return count > 0
      ? `${count * 10}–${count * 15} min`
      : 'No waiting time';
  };

  return (
    <View style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* HEADER */}

        <View style={styles.header}>

          <TouchableOpacity
            style={styles.backCircle}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.backIcon}>
              ‹
            </Text>
          </TouchableOpacity>

          <View style={styles.headerText}>

            <Text style={styles.brand}>
              QCARE
            </Text>

            <Text style={styles.headerTitle}>
              Hospital Details
            </Text>

          </View>

          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>
              LIVE
            </Text>
          </View>

        </View>

        {/* HOSPITAL HERO CARD */}

        <View style={styles.hospitalCard}>

          <View style={styles.heroTopRow}>

            <View style={styles.hospitalIcon}>
              <Text style={styles.hospitalEmoji}>
                🏥
              </Text>
            </View>

            <View style={styles.activePill}>

              <View style={styles.activeDot} />

              <Text style={styles.activeText}>
                ACTIVE
              </Text>

            </View>

          </View>

          <Text style={styles.hospitalName}>
            {hospital.name}
          </Text>

          <View style={styles.heroAddressRow}>

            <Text style={styles.heroAddressIcon}>
              📍
            </Text>

            <Text style={styles.heroAddress}>
              {hospital.address ||
                'Address not available'}
            </Text>

          </View>

        </View>

        {/* QUICK INFORMATION */}

        <View style={styles.quickRow}>

          <View style={styles.quickCard}>

            <View style={styles.quickIcon}>
              <Text>📞</Text>
            </View>

            <Text style={styles.quickLabel}>
              PHONE
            </Text>

            <Text
              style={styles.quickValue}
              numberOfLines={1}
            >
              {hospital.phone || '--'}
            </Text>

          </View>

          <View style={styles.quickCard}>

            <View style={styles.quickIcon}>
              <Text>✉️</Text>
            </View>

            <Text style={styles.quickLabel}>
              EMAIL
            </Text>

            <Text
              style={styles.quickValue}
              numberOfLines={1}
            >
              {hospital.email || '--'}
            </Text>

          </View>

        </View>
        {/* HOSPITAL INFORMATION */}

        <View style={styles.sectionHeader}>

          <View style={styles.sectionTitleBlock}>

            <Text style={styles.sectionTitle}>
              Hospital Information
            </Text>

            <Text style={styles.sectionSubtitle}>
              Contact details and location
            </Text>

          </View>

        </View>

        <View style={styles.infoCard}>

          <View style={styles.infoRow}>

            <View style={styles.infoIconBox}>
              <Text style={styles.infoIcon}>
                📍
              </Text>
            </View>

            <View style={styles.infoContent}>

              <Text style={styles.infoLabel}>
                ADDRESS
              </Text>

              <Text style={styles.infoValue}>
                {hospital.address ||
                  'Address not available'}
              </Text>

            </View>

          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>

            <View style={styles.infoIconBox}>
              <Text style={styles.infoIcon}>
                📞
              </Text>
            </View>

            <View style={styles.infoContent}>

              <Text style={styles.infoLabel}>
                PHONE
              </Text>

              <Text style={styles.infoValue}>
                {hospital.phone ||
                  'Phone number not available'}
              </Text>

            </View>

          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>

            <View style={styles.infoIconBox}>
              <Text style={styles.infoIcon}>
                ✉️
              </Text>
            </View>

            <View style={styles.infoContent}>

              <Text style={styles.infoLabel}>
                EMAIL
              </Text>

              <Text style={styles.infoValue}>
                {hospital.email ||
                  'Email not available'}
              </Text>

            </View>

          </View>

        </View>


        {/* LIVE QUEUE HEADER */}

        <View style={styles.sectionHeader}>

          <View style={styles.sectionTitleBlock}>

            <Text style={styles.sectionTitle}>
              Live Queue
            </Text>

            <Text style={styles.sectionSubtitle}>
              Current doctor-wise queue status
            </Text>

          </View>

          <View style={styles.livePill}>

            <View style={styles.liveDot} />

            <Text style={styles.liveText}>
              LIVE
            </Text>

          </View>

        </View>


        {/* LIVE QUEUE */}

        {queueLoading ? (

          <View style={styles.queueCard}>

            <View style={styles.queueLoading}>

              <ActivityIndicator
                size="small"
                color="#2563EB"
              />

              <Text style={styles.queueLoadingText}>
                Loading live queue...
              </Text>

            </View>

          </View>

        ) : (

          <>

            {doctors.map((doctorName) => {

              const doctorQueue =
                getDoctorQueue(doctorName);

              const doctorToken =
                getDoctorCurrentToken(
                  doctorName
                );

              const doctorWait =
                getDoctorEstimatedWait(
                  doctorName
                );

              return (

                <View
                  key={doctorName}
                  style={styles.queueCard}
                >

                  <View style={styles.queueCardHeader}>

                    <View style={styles.doctorMiniIcon}>

                      <Text style={styles.doctorMiniEmoji}>
                        {doctorName ===
                        'General Physician'
                          ? '🩺'
                          : doctorName ===
                            'Cardiologist'
                          ? '❤️'
                          : doctorName ===
                            'Orthopedic'
                          ? '🦴'
                          : '🧴'}
                      </Text>

                    </View>

                    <View style={styles.doctorMiniContent}>

                      <Text
                        style={styles.doctorQueueName}
                        numberOfLines={1}
                      >
                        {doctorName}
                      </Text>

                      <View style={styles.queueLiveRow}>

                        <View
                          style={
                            styles.queueStatusDot
                          }
                        />

                        <Text
                          style={
                            styles.queueStatusSmall
                          }
                        >
                          {doctorQueue.length > 0
                            ? 'Patients waiting'
                            : 'No patients waiting'}
                        </Text>

                      </View>

                    </View>

                  </View>


                  <View style={styles.queueStatRow}>

                    <View style={styles.queueStat}>

                      <Text
                        style={
                          styles.queueStatNumber
                        }
                      >
                        {doctorQueue.length}
                      </Text>

                      <Text
                        style={
                          styles.queueStatLabel
                        }
                      >
                        Waiting
                      </Text>

                    </View>


                    <View
                      style={styles.queueDivider}
                    />


                    <View style={styles.queueStat}>

                      <Text
                        style={
                          styles.queueStatNumber
                        }
                      >
                        {doctorToken}
                      </Text>

                      <Text
                        style={
                          styles.queueStatLabel
                        }
                      >
                        Current Token
                      </Text>

                    </View>

                  </View>


                  <View style={styles.queueStatus}>

                    <View
                      style={styles.queueStatusIcon}
                    >
                      <Text>⏱️</Text>
                    </View>

                    <View
                      style={
                        styles.queueStatusContent
                      }
                    >

                      <Text
                        style={
                          styles.queueStatusTitle
                        }
                      >
                        Estimated Wait
                      </Text>

                      <Text
                        style={
                          styles.queueStatusValue
                        }
                      >
                        {doctorWait}
                      </Text>

                    </View>

                  </View>

                </View>

              );

            })}

          </>

        )}


        {/* TOTAL WAITING TIME */}

        <View style={styles.waitCard}>

          <View style={styles.waitIcon}>

            <Text style={styles.waitEmoji}>
              ⏱️
            </Text>

          </View>

          <View style={styles.waitContent}>

            <Text style={styles.waitTitle}>
              Total Estimated Waiting Time
            </Text>

            <Text style={styles.waitValue}>
              {waitingPatients.length > 0
                ? `${waitingPatients.length * 10}–${
                    waitingPatients.length * 15
                  } min`
                : 'No waiting time'}
            </Text>

          </View>

        </View>


        {/* DOCTOR AVAILABILITY HEADER */}

        <View style={styles.sectionHeader}>

          <View style={styles.sectionTitleBlock}>

            <Text style={styles.sectionTitle}>
              Doctor Availability
            </Text>

            <Text style={styles.sectionSubtitle}>
              Current availability and waiting status
            </Text>

          </View>

        </View>


        {/* GENERAL PHYSICIAN */}

        <View style={styles.doctorCard}>

          <View style={styles.doctorIcon}>

            <Text style={styles.doctorEmoji}>
              🩺
            </Text>

          </View>

          <View style={styles.doctorContent}>

            <Text style={styles.doctorName}>
              General Physician
            </Text>

            <View style={styles.availableRow}>

              <View style={styles.availableDot} />

              <Text style={styles.availableText}>
                {getDoctorAvailability(
                  'General Physician'
                )?.status ||
                  'Status not updated'}
              </Text>

            </View>

            {getDoctorAvailability(
              'General Physician'
            )?.expected_arrival_time && (

              <Text
                style={styles.doctorArrivalText}
              >
                Expected: {
                  getDoctorAvailability(
                    'General Physician'
                  )?.expected_arrival_time
                }
              </Text>

            )}

            <Text
              style={styles.doctorWaitingText}
            >
              {getDoctorWaitingCount(
                'General Physician'
              )}{' '}
              patients waiting
            </Text>

          </View>

        </View>


        {/* CARDIOLOGIST */}

        <View style={styles.doctorCard}>

          <View style={styles.doctorIcon}>

            <Text style={styles.doctorEmoji}>
              ❤️
            </Text>

          </View>

          <View style={styles.doctorContent}>

            <Text style={styles.doctorName}>
              Cardiologist
            </Text>

            <View style={styles.availableRow}>

              <View style={styles.availableDot} />

              <Text style={styles.availableText}>
                {getDoctorAvailability(
                  'Cardiologist'
                )?.status ||
                  'Status not updated'}
              </Text>

            </View>

            {getDoctorAvailability(
              'Cardiologist'
            )?.expected_arrival_time && (

              <Text
                style={styles.doctorArrivalText}
              >
                Expected: {
                  getDoctorAvailability(
                    'Cardiologist'
                  )?.expected_arrival_time
                }
              </Text>

            )}

            <Text
              style={styles.doctorWaitingText}
            >
              {getDoctorWaitingCount(
                'Cardiologist'
              )}{' '}
              patients waiting
            </Text>

          </View>

        </View>
        {/* ORTHOPEDIC */}

        <View style={styles.doctorCard}>

          <View style={styles.doctorIcon}>

            <Text style={styles.doctorEmoji}>
              🦴
            </Text>

          </View>

          <View style={styles.doctorContent}>

            <Text style={styles.doctorName}>
              Orthopedic
            </Text>

            <View style={styles.availableRow}>

              <View style={styles.availableDot} />

              <Text style={styles.availableText}>
                {getDoctorAvailability(
                  'Orthopedic'
                )?.status ||
                  'Status not updated'}
              </Text>

            </View>

            {getDoctorAvailability(
              'Orthopedic'
            )?.expected_arrival_time && (

              <Text
                style={styles.doctorArrivalText}
              >
                Expected: {
                  getDoctorAvailability(
                    'Orthopedic'
                  )?.expected_arrival_time
                }
              </Text>

            )}

            <Text
              style={styles.doctorWaitingText}
            >
              {getDoctorWaitingCount(
                'Orthopedic'
              )}{' '}
              patients waiting
            </Text>

          </View>

        </View>


        {/* DERMATOLOGIST */}

        <View style={styles.doctorCard}>

          <View style={styles.doctorIcon}>

            <Text style={styles.doctorEmoji}>
              🧴
            </Text>

          </View>

          <View style={styles.doctorContent}>

            <Text style={styles.doctorName}>
              Dermatologist
            </Text>

            <View style={styles.availableRow}>

              <View style={styles.availableDot} />

              <Text style={styles.availableText}>
                {getDoctorAvailability(
                  'Dermatologist'
                )?.status ||
                  'Status not updated'}
              </Text>

            </View>

            {getDoctorAvailability(
              'Dermatologist'
            )?.expected_arrival_time && (

              <Text
                style={styles.doctorArrivalText}
              >
                Expected: {
                  getDoctorAvailability(
                    'Dermatologist'
                  )?.expected_arrival_time
                }
              </Text>

            )}

            <Text
              style={styles.doctorWaitingText}
            >
              {getDoctorWaitingCount(
                'Dermatologist'
              )}{' '}
              patients waiting
            </Text>

          </View>

        </View>


        {/* BOOKING ACTION */}

        <View style={styles.bookingCard}>

          <View style={styles.bookingIcon}>

            <Text style={styles.bookingEmoji}>
              📅
            </Text>

          </View>

          <View style={styles.bookingContent}>

            <Text style={styles.bookingTitle}>
              Ready to book?
            </Text>

            <Text style={styles.bookingSubtitle}>
              Choose your doctor and get your
              appointment token.
            </Text>

          </View>

        </View>


        {/* CONTINUE BUTTON */}

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.85}
        >

          <Text style={styles.continueButtonText}>
            Continue to Booking
          </Text>

          <Text style={styles.continueArrow}>
            →
          </Text>

        </TouchableOpacity>

        <Text style={styles.bottomNote}>
          Your existing QCare appointment booking
          process will continue from here.
        </Text>

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F5F8FC',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 45,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F8FC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },

  loadingIcon: {
    width: 76,
    height: 76,
    borderRadius: 25,
    backgroundColor: '#EAF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },

  loadingEmoji: {
    fontSize: 32,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#667085',
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#172B4D',
    marginTop: 15,
  },

  errorText: {
    fontSize: 13,
    color: '#7A8796',
    textAlign: 'center',
    marginTop: 8,
  },

  backButton: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingHorizontal: 25,
    paddingVertical: 13,
    marginTop: 22,
  },

  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  backCircle: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
    elevation: 3,
    shadowColor: '#172B4D',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  backIcon: {
    fontSize: 31,
    color: '#2563EB',
    marginTop: -3,
  },

  headerText: {
    flex: 1,
  },

  brand: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2.5,
    color: '#2563EB',
    marginBottom: 3,
  },

  headerTitle: {
    fontSize: 23,
    fontWeight: '900',
    color: '#172B4D',
  },

  headerBadge: {
    backgroundColor: '#EAF8F0',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },

  headerBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#198754',
    letterSpacing: 0.7,
  },

  hospitalCard: {
    backgroundColor: '#2563EB',
    borderRadius: 26,
    padding: 22,
    marginBottom: 16,
    elevation: 5,
    shadowColor: '#2563EB',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
  },

  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  hospitalIcon: {
    width: 66,
    height: 66,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  hospitalEmoji: {
    fontSize: 31,
  },

  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },

  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#8EF0B5',
    marginRight: 6,
  },

  activeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  hospitalName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 18,
    lineHeight: 28,
  },

  heroAddressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
  },

  heroAddressIcon: {
    fontSize: 14,
    marginRight: 6,
  },

  heroAddress: {
    flex: 1,
    color: 'rgba(255,255,255,0.86)',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },

  quickRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 27,
  },

  quickCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    elevation: 2,
    shadowColor: '#172B4D',
    shadowOpacity: 0.05,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  quickIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#EEF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 9,
  },

  quickLabel: {
    fontSize: 9,
    color: '#98A2B3',
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  quickValue: {
    fontSize: 11,
    color: '#344054',
    fontWeight: '700',
    marginTop: 4,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
    marginTop: 5,
  },

  sectionTitleBlock: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#172B4D',
  },

  sectionSubtitle: {
    fontSize: 11,
    color: '#8A94A6',
    marginTop: 4,
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 17,
    marginBottom: 26,
    elevation: 2,
    shadowColor: '#172B4D',
    shadowOpacity: 0.04,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EEF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  infoIcon: {
    fontSize: 19,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#98A2B3',
    letterSpacing: 0.7,
  },

  infoValue: {
    fontSize: 13,
    color: '#344054',
    fontWeight: '600',
    marginTop: 4,
    lineHeight: 19,
  },

  divider: {
    height: 1,
    backgroundColor: '#EEF1F4',
    marginVertical: 15,
  },

  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#198754',
    marginRight: 5,
  },

  liveText: {
    color: '#198754',
    fontSize: 9,
    fontWeight: '900',
  },

  queueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 17,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#172B4D',
    shadowOpacity: 0.04,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  queueLoading: {
    alignItems: 'center',
    paddingVertical: 15,
  },

  queueLoadingText: {
    fontSize: 12,
    color: '#7A8796',
    marginTop: 9,
  },

  queueCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  doctorMiniIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EEF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  doctorMiniEmoji: {
    fontSize: 21,
  },

  doctorMiniContent: {
    flex: 1,
  },

  doctorQueueName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#172B4D',
  },

  queueLiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  queueStatusSmall: {
    fontSize: 10,
    color: '#7A8796',
    fontWeight: '600',
  },

  queueStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  queueStat: {
    flex: 1,
    alignItems: 'center',
  },

  queueStatNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#2563EB',
  },

  queueStatLabel: {
    fontSize: 10,
    color: '#8A94A6',
    marginTop: 4,
  },

  queueDivider: {
    width: 1,
    height: 42,
    backgroundColor: '#E7ECF1',
  },

  queueStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F9FD',
    borderRadius: 13,
    padding: 11,
    marginTop: 15,
  },

  queueStatusIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },

  queueStatusContent: {
    flex: 1,
  },

  queueStatusTitle: {
    fontSize: 9,
    color: '#98A2B3',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  queueStatusValue: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '900',
    marginTop: 2,
  },

  queueStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#198754',
    marginRight: 6,
  },
  waitCard: {
    backgroundColor: '#EEF5FF',
    borderRadius: 18,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 27,
  },

  waitIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  waitEmoji: {
    fontSize: 22,
  },

  waitContent: {
    flex: 1,
  },

  waitTitle: {
    fontSize: 11,
    color: '#667085',
    fontWeight: '700',
  },

  waitValue: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '900',
    marginTop: 3,
  },

  doctorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#172B4D',
    shadowOpacity: 0.04,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    marginBottom: 13,
  },

  doctorIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: '#EEF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  doctorEmoji: {
    fontSize: 25,
  },

  doctorContent: {
    flex: 1,
  },

  doctorName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#172B4D',
  },

  availableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  availableDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#198754',
    marginRight: 6,
  },

  availableText: {
    fontSize: 11,
    color: '#198754',
    fontWeight: '700',
  },

  doctorArrivalText: {
    fontSize: 11,
    color: '#667085',
    fontWeight: '600',
    marginTop: 5,
  },

  doctorWaitingText: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '700',
    marginTop: 5,
  },

  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E7EEF8',
  },

  bookingIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#EEF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  bookingEmoji: {
    fontSize: 23,
  },

  bookingContent: {
    flex: 1,
  },

  bookingTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#172B4D',
  },

  bookingSubtitle: {
    fontSize: 11,
    color: '#7A8796',
    lineHeight: 17,
    marginTop: 4,
  },

  continueButton: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#2563EB',
    shadowOpacity: 0.2,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },

  continueArrow: {
    color: '#FFFFFF',
    fontSize: 22,
    marginLeft: 10,
    marginTop: -2,
  },

  bottomNote: {
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 16,
    color: '#98A2B3',
    marginTop: 12,
  },

});