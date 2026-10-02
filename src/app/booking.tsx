import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

const API_URL = 'https://qcare-tisd.onrender.com';

type Hospital = {
  id: number;
  name: string;
};

type DoctorAvailability = {
  doctor: string;
  status: string;
  expected_arrival_time?: string | null;
};

export default function BookingScreen() {
  const { hospitalId } = useLocalSearchParams();

  const [hospitals, setHospitals] =
    useState<Hospital[]>([]);

  const [selectedHospital, setSelectedHospital] =
    useState<number | null>(null);

  useEffect(() => {
    if (hospitalId) {
      const id = Number(hospitalId);

      setSelectedHospital(id);
      loadDoctorAvailability(id);
    }
  }, [hospitalId]);

  const [selectedDoctor, setSelectedDoctor] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [doctorAvailability, setDoctorAvailability] =
    useState<DoctorAvailability[]>([]);

  const [patientName, setPatientName] =
    useState('');

  const [patientPhone, setPatientPhone] =
    useState('');

  const [searchText, setSearchText] =
    useState('');

  const loadHospitals = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/hospitals`
      );

      if (!response.ok) {
        throw new Error(
          'Unable to fetch hospitals.'
        );
      }

      const data = await response.json();

      if (data.success && data.hospitals) {
        setHospitals(data.hospitals);
      } else {
        setHospitals([]);
      }
    } catch (error) {
      Alert.alert(
        'Connection Error',
        'Unable to load hospitals from QCare server.'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadPatient = async () => {
    try {
      const storedPatient =
        await AsyncStorage.getItem(
          'currentPatient'
        );

      if (storedPatient) {
        const patient =
          JSON.parse(storedPatient);

        setPatientName(
          patient.name || ''
        );

        setPatientPhone(
          patient.phone || ''
        );
      }
    } catch (error) {
      console.log(
        'PATIENT LOAD ERROR:',
        error
      );
    }
  };

  const loadDoctorAvailability = async (
    hospitalIdValue: number
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/doctor-availability/${hospitalIdValue}`
      );

      const data =
        await response.json();

      if (
        data.success &&
        data.doctors
      ) {
        setDoctorAvailability(
          data.doctors
        );
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

  const isDoctorAvailable = (
    doctorName: string
  ) => {
    const doctor =
      doctorAvailability.find(
        (item) =>
          item.doctor === doctorName
      );

    if (!doctor) {
      return true;
    }

    return doctor.status === 'Available';
  };

  const getDoctorStatus = (
    doctorName: string
  ) => {
    const doctor =
      doctorAvailability.find(
        (item) =>
          item.doctor === doctorName
      );

    if (!doctor) {
      return 'Available';
    }

    return doctor.status;
  };

  const getDoctorArrivalTime = (
    doctorName: string
  ) => {
    const doctor =
      doctorAvailability.find(
        (item) =>
          item.doctor === doctorName
      );

    if (
      !doctor ||
      doctor.status !== 'Unavailable' ||
      !doctor.expected_arrival_time
    ) {
      return '';
    }

    return doctor.expected_arrival_time;
  };

  const handleBookAppointment = async () => {
    if (
      !selectedHospital ||
      !selectedDoctor
    ) {
      Alert.alert(
        'Required',
        'Please select a hospital and doctor.'
      );
      return;
    }

    if (
      !isDoctorAvailable(
        selectedDoctor
      )
    ) {
      Alert.alert(
        'Doctor Unavailable',
        `${selectedDoctor} is currently unavailable. Please choose another doctor.`
      );
      return;
    }

    if (
      !patientName ||
      !patientPhone
    ) {
      Alert.alert(
        'Patient Details Missing',
        'Please login again before booking.'
      );
      return;
    }

    try {
      const storedPatient =
        await AsyncStorage.getItem(
          'currentPatient'
        );

      if (!storedPatient) {
        Alert.alert(
          'Patient Details Missing',
          'Please login again before booking.'
        );
        return;
      }

      const patient =
        JSON.parse(storedPatient);

      if (selectedHospital) {
        const availabilityResponse =
          await fetch(
            `${API_URL}/doctor-availability/${selectedHospital}`
          );

        const availabilityData =
          await availabilityResponse.json();

        if (
          availabilityData.success
        ) {
          const latestDoctor =
            availabilityData.doctors.find(
              (
                item: DoctorAvailability
              ) =>
                item.doctor ===
                selectedDoctor
            );

          if (
            latestDoctor &&
            latestDoctor.status !==
              'Available'
          ) {
            Alert.alert(
              'Doctor Unavailable',
              `${selectedDoctor} is currently unavailable. Please choose another doctor.`
            );

            setSelectedDoctor('');
            return;
          }
        }
      }

      const response = await fetch(
        `${API_URL}/live-queue`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            hospitalId:
              selectedHospital,
            patientId:
              patient.id,
            patient:
              patientName,
            phone:
              patientPhone,
            doctor:
              selectedDoctor,
          }),
        }
      );

      const data =
        await response.json();

      if (!data.success) {
        Alert.alert(
          'Booking Failed',
          data.message ||
            'Unable to book appointment.'
        );
        return;
      }

      await AsyncStorage.setItem(
        'currentToken',
        data.token
      );

      console.log(
        'SAVED TOKEN:',
        data.token
      );

      const appointmentResponse =
        await fetch(
          `${API_URL}/appointments`,
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              patient_id:
                patient.id,
              hospital_id:
                selectedHospital,
              doctor:
                selectedDoctor,
              token:
                data.token,
            }),
          }
        );

      const appointmentData =
        await appointmentResponse.json();

      if (
        !appointmentData.success
      ) {
        console.log(
          'APPOINTMENT SAVE ERROR:',
          appointmentData.message
        );
      }

      Alert.alert(
        'Appointment Booked',
        `Your token is ${data.token}`,
        [
          {
            text: 'OK',
            onPress: () =>
              router.replace(
                '/patient-dashboard'
              ),
          },
        ]
      );
    } catch (error) {
      console.log(
        'BOOKING ERROR:',
        error
      );

      Alert.alert(
        'Connection Error',
        'Unable to connect to QCare server.'
      );
    }
  };

  useEffect(() => {
    loadHospitals();
    loadPatient();
  }, []);

  // SEARCH FILTER

  const filteredHospitals =
    hospitals.filter(
      (hospital) =>
        hospital.name
          .toLowerCase()
          .includes(
            searchText
              .trim()
              .toLowerCase()
          )
    );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.contentContainer
      }
      showsVerticalScrollIndicator={
        false
      }
    >

      {/* HEADER */}

      <View style={styles.headerRow}>

        <TouchableOpacity
          style={styles.backButton}
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

          <Text style={styles.title}>
            Book Appointment
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Text style={styles.headerEmoji}>
            📅
          </Text>
        </View>

      </View>

      <Text style={styles.subtitle}>
        Choose a hospital and doctor to
        join the queue.
      </Text>

      {/* HOSPITAL SECTION */}

      <View style={styles.sectionHeader}>

        <View>
          <Text style={styles.sectionTitle}>
            Select Hospital
          </Text>

          <Text style={styles.sectionHint}>
            Search and choose an active hospital
          </Text>
        </View>

      </View>

      {/* SEARCH BOX */}

      <View style={styles.searchBox}>

        <View style={styles.searchIconBox}>
          <Text style={styles.searchIcon}>
            🔍
          </Text>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Search hospital"
          placeholderTextColor="#98A2B3"
          value={searchText}
          onChangeText={setSearchText}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {searchText.length > 0 && (
          <TouchableOpacity
            onPress={() =>
              setSearchText('')
            }
            style={styles.clearButton}
          >
            <Text style={styles.clearText}>
              ×
            </Text>
          </TouchableOpacity>
        )}

      </View>

      {loading ? (

        <View style={styles.statusCard}>

          <View style={styles.statusIcon}>
            <Text>🏥</Text>
          </View>

          <Text style={styles.statusTitle}>
            Loading hospitals
          </Text>

          <Text style={styles.infoText}>
            Please wait while QCare loads
            available hospitals.
          </Text>

        </View>

      ) : filteredHospitals.length === 0 ? (

        <View style={styles.statusCard}>

          <View style={styles.statusIcon}>
            <Text>🔎</Text>
          </View>

          <Text style={styles.noHospitalTitle}>
            No hospital found
          </Text>

          <Text style={styles.infoText}>
            Try searching with a different
            hospital name.
          </Text>

        </View>

      ) : (

        <View>
          {filteredHospitals.map(
            (hospital) => (
              <TouchableOpacity
                key={hospital.id}
                style={[
                  styles.optionCard,
                  selectedHospital ===
                    hospital.id &&
                    styles.optionCardSelected,
                ]}
                onPress={() =>
                  router.push({
                    pathname:
                      '/hospital-details',
                    params: {
                      hospitalId:
                        String(
                          hospital.id
                        ),
                    },
                  })
                }
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.optionIcon,
                    selectedHospital ===
                      hospital.id &&
                      styles.optionIconSelected,
                  ]}
                >
                  <Text
                    style={
                      styles.optionIconText
                    }
                  >
                    🏥
                  </Text>
                </View>

                <View
                  style={
                    styles.optionContent
                  }
                >
                  <Text
                    style={[
                      styles.optionTitle,
                      selectedHospital ===
                        hospital.id &&
                        styles.optionTitleSelected,
                    ]}
                  >
                    {hospital.name}
                  </Text>

                  
                </View>

                <View
                  style={[
                    styles.radio,
                    selectedHospital ===
                      hospital.id &&
                      styles.radioSelected,
                  ]}
                >
                  {selectedHospital ===
                    hospital.id && (
                    <View
                      style={
                        styles.radioInner
                      }
                    />
                  )}
                </View>
              </TouchableOpacity>
            )
          )}
        </View>

      )}
      {/* DOCTOR SECTION */}

      <View style={styles.sectionHeader}>

        <View>
          <Text style={styles.sectionTitle}>
            Select Doctor
          </Text>

          <Text style={styles.sectionHint}>
            Choose your preferred specialist
          </Text>
        </View>

      </View>


      {/* GENERAL PHYSICIAN */}

      <TouchableOpacity
        style={[
          styles.doctorCard,
          selectedDoctor ===
            'General Physician' &&
            styles.doctorCardSelected,
        ]}
        onPress={() => {
          if (
            !isDoctorAvailable(
              'General Physician'
            )
          ) {
            Alert.alert(
              'Doctor Unavailable',
              'General Physician is currently unavailable.'
            );
            return;
          }

          setSelectedDoctor(
            'General Physician'
          );
        }}
        activeOpacity={0.8}
      >

        <View style={styles.doctorIcon}>
          <Text style={styles.doctorIconText}>
            🩺
          </Text>
        </View>

        <View style={styles.doctorInfo}>

          <Text
            style={[
              styles.doctorText,
              selectedDoctor ===
                'General Physician' &&
                styles.doctorTextSelected,
            ]}
          >
            General Physician
          </Text>

          <View style={styles.doctorStatusRow}>

            <View
              style={[
                styles.doctorStatusDot,
                {
                  backgroundColor:
                    isDoctorAvailable(
                      'General Physician'
                    )
                      ? '#16A34A'
                      : '#DC2626',
                },
              ]}
            />

            <Text
              style={[
                styles.doctorStatusText,
                {
                  color:
                    isDoctorAvailable(
                      'General Physician'
                    )
                      ? '#16A34A'
                      : '#DC2626',
                },
              ]}
            >
              {getDoctorStatus(
                'General Physician'
              )}
            </Text>

          </View>

          {!isDoctorAvailable(
            'General Physician'
          ) &&
            getDoctorArrivalTime(
              'General Physician'
            ) !== '' && (

              <Text
                style={styles.arrivalText}
              >
                Expected arrival:{' '}
                {getDoctorArrivalTime(
                  'General Physician'
                )}
              </Text>

            )}

        </View>

        <View
          style={[
            styles.radio,
            selectedDoctor ===
              'General Physician' &&
              styles.radioSelected,
          ]}
        >
          {selectedDoctor ===
            'General Physician' && (
            <View
              style={styles.radioInner}
            />
          )}
        </View>

      </TouchableOpacity>


      {/* CARDIOLOGIST */}

      <TouchableOpacity
        style={[
          styles.doctorCard,
          selectedDoctor ===
            'Cardiologist' &&
            styles.doctorCardSelected,
        ]}
        onPress={() => {
          if (
            !isDoctorAvailable(
              'Cardiologist'
            )
          ) {
            Alert.alert(
              'Doctor Unavailable',
              'Cardiologist is currently unavailable.'
            );
            return;
          }

          setSelectedDoctor(
            'Cardiologist'
          );
        }}
        activeOpacity={0.8}
      >

        <View style={styles.doctorIcon}>
          <Text style={styles.doctorIconText}>
            ❤️
          </Text>
        </View>

        <View style={styles.doctorInfo}>

          <Text
            style={[
              styles.doctorText,
              selectedDoctor ===
                'Cardiologist' &&
                styles.doctorTextSelected,
            ]}
          >
            Cardiologist
          </Text>

          <View style={styles.doctorStatusRow}>

            <View
              style={[
                styles.doctorStatusDot,
                {
                  backgroundColor:
                    isDoctorAvailable(
                      'Cardiologist'
                    )
                      ? '#16A34A'
                      : '#DC2626',
                },
              ]}
            />

            <Text
              style={[
                styles.doctorStatusText,
                {
                  color:
                    isDoctorAvailable(
                      'Cardiologist'
                    )
                      ? '#16A34A'
                      : '#DC2626',
                },
              ]}
            >
              {getDoctorStatus(
                'Cardiologist'
              )}
            </Text>

          </View>

          {!isDoctorAvailable(
            'Cardiologist'
          ) &&
            getDoctorArrivalTime(
              'Cardiologist'
            ) !== '' && (

              <Text
                style={styles.arrivalText}
              >
                Expected arrival:{' '}
                {getDoctorArrivalTime(
                  'Cardiologist'
                )}
              </Text>

            )}

        </View>

        <View
          style={[
            styles.radio,
            selectedDoctor ===
              'Cardiologist' &&
              styles.radioSelected,
          ]}
        >
          {selectedDoctor ===
            'Cardiologist' && (
            <View
              style={styles.radioInner}
            />
          )}
        </View>

      </TouchableOpacity>


      {/* ORTHOPEDIC */}

      <TouchableOpacity
        style={[
          styles.doctorCard,
          selectedDoctor ===
            'Orthopedic' &&
            styles.doctorCardSelected,
        ]}
        onPress={() => {
          if (
            !isDoctorAvailable(
              'Orthopedic'
            )
          ) {
            Alert.alert(
              'Doctor Unavailable',
              'Orthopedic is currently unavailable.'
            );
            return;
          }

          setSelectedDoctor(
            'Orthopedic'
          );
        }}
        activeOpacity={0.8}
      >

        <View style={styles.doctorIcon}>
          <Text style={styles.doctorIconText}>
            🦴
          </Text>
        </View>

        <View style={styles.doctorInfo}>

          <Text
            style={[
              styles.doctorText,
              selectedDoctor ===
                'Orthopedic' &&
                styles.doctorTextSelected,
            ]}
          >
            Orthopedic
          </Text>

          <View style={styles.doctorStatusRow}>

            <View
              style={[
                styles.doctorStatusDot,
                {
                  backgroundColor:
                    isDoctorAvailable(
                      'Orthopedic'
                    )
                      ? '#16A34A'
                      : '#DC2626',
                },
              ]}
            />

            <Text
              style={[
                styles.doctorStatusText,
                {
                  color:
                    isDoctorAvailable(
                      'Orthopedic'
                    )
                      ? '#16A34A'
                      : '#DC2626',
                },
              ]}
            >
              {getDoctorStatus(
                'Orthopedic'
              )}
            </Text>

          </View>

          {!isDoctorAvailable(
            'Orthopedic'
          ) &&
            getDoctorArrivalTime(
              'Orthopedic'
            ) !== '' && (

              <Text
                style={styles.arrivalText}
              >
                Expected arrival:{' '}
                {getDoctorArrivalTime(
                  'Orthopedic'
                )}
              </Text>

            )}

        </View>

        <View
          style={[
            styles.radio,
            selectedDoctor ===
              'Orthopedic' &&
              styles.radioSelected,
          ]}
        >
          {selectedDoctor ===
            'Orthopedic' && (
            <View
              style={styles.radioInner}
            />
          )}
        </View>

      </TouchableOpacity>


      {/* DERMATOLOGIST */}

      <TouchableOpacity
        style={[
          styles.doctorCard,
          selectedDoctor ===
            'Dermatologist' &&
            styles.doctorCardSelected,
        ]}
        onPress={() => {
          if (
            !isDoctorAvailable(
              'Dermatologist'
            )
          ) {
            Alert.alert(
              'Doctor Unavailable',
              'Dermatologist is currently unavailable.'
            );
            return;
          }

          setSelectedDoctor(
            'Dermatologist'
          );
        }}
        activeOpacity={0.8}
      >

        <View style={styles.doctorIcon}>
          <Text style={styles.doctorIconText}>
            ✨
          </Text>
        </View>

        <View style={styles.doctorInfo}>

          <Text
            style={[
              styles.doctorText,
              selectedDoctor ===
                'Dermatologist' &&
                styles.doctorTextSelected,
            ]}
          >
            Dermatologist
          </Text>

          <View style={styles.doctorStatusRow}>

            <View
              style={[
                styles.doctorStatusDot,
                {
                  backgroundColor:
                    isDoctorAvailable(
                      'Dermatologist'
                    )
                      ? '#16A34A'
                      : '#DC2626',
                },
              ]}
            />

            <Text
              style={[
                styles.doctorStatusText,
                {
                  color:
                    isDoctorAvailable(
                      'Dermatologist'
                    )
                      ? '#16A34A'
                      : '#DC2626',
                },
              ]}
            >
              {getDoctorStatus(
                'Dermatologist'
              )}
            </Text>

          </View>

          {!isDoctorAvailable(
            'Dermatologist'
          ) &&
            getDoctorArrivalTime(
              'Dermatologist'
            ) !== '' && (

              <Text
                style={styles.arrivalText}
              >
                Expected arrival:{' '}
                {getDoctorArrivalTime(
                  'Dermatologist'
                )}
              </Text>

            )}

        </View>

        <View
          style={[
            styles.radio,
            selectedDoctor ===
              'Dermatologist' &&
              styles.radioSelected,
          ]}
        >
          {selectedDoctor ===
            'Dermatologist' && (
            <View
              style={styles.radioInner}
            />
          )}
        </View>

      </TouchableOpacity>


      {/* BOOKING INFORMATION */}

      <View style={styles.bookingInfoCard}>

        <View style={styles.bookingInfoIcon}>
          <Text style={styles.bookingInfoEmoji}>
            🎫
          </Text>
        </View>

        <View style={styles.bookingInfoContent}>

          <Text style={styles.bookingInfoTitle}>
            Ready to join the queue?
          </Text>

          <Text style={styles.bookingInfoText}>
            Select an available doctor and
            book your appointment token.
          </Text>

        </View>

      </View>


      {/* BOOK BUTTON */}

      <TouchableOpacity
        style={styles.bookButton}
        onPress={handleBookAppointment}
        activeOpacity={0.85}
      >

        <Text style={styles.bookButtonText}>
          Book Appointment
        </Text>

        <Text style={styles.bookArrow}>
          →
        </Text>

      </TouchableOpacity></ScrollView>
  );
}

const styles = StyleSheet.create({

  /* MAIN SCREEN */

  container: {
    flex: 1,
    backgroundColor: '#F5F8FC',
    paddingHorizontal: 18,
  },

  contentContainer: {
    paddingTop: 18,
    paddingBottom: 45,
  },


  /* HEADER */

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5EAF0',
    elevation: 2,
  },

  backIcon: {
    fontSize: 30,
    color: '#1769AA',
    lineHeight: 32,
    marginTop: -3,
  },

  headerText: {
    flex: 1,
  },

  brand: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1769AA',
    letterSpacing: 1.5,
    marginBottom: 2,
  },

  title: {
    fontSize: 25,
    fontWeight: '800',
    color: '#172B4D',
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#EAF4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerEmoji: {
    fontSize: 22,
  },

  subtitle: {
    fontSize: 13,
    color: '#718096',
    lineHeight: 20,
    marginBottom: 25,
    paddingRight: 25,
  },


  /* SECTION HEADERS */

  sectionHeader: {
    marginTop: 5,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#172B4D',
  },

  sectionHint: {
    fontSize: 11,
    color: '#8A96A6',
    marginTop: 4,
  },


  /* SEARCH */

  searchBox: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 15,
    elevation: 2,
  },

  searchIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F0F6FC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },

  searchIcon: {
    fontSize: 16,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#172B4D',
  },

  clearButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },

  clearText: {
    fontSize: 25,
    color: '#98A2B3',
    lineHeight: 26,
  },


  /* STATUS CARD */

  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6EBF1',
    elevation: 2,
  },

  statusIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#EAF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 11,
  },

  statusIconText: {
    fontSize: 22,
  },

  statusTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#263238',
    marginBottom: 5,
  },

  noHospitalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#263238',
    marginBottom: 5,
  },

  infoText: {
    color: '#7A8491',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },


  /* HOSPITAL CARD */

  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 14,
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
  },

  optionCardSelected: {
    backgroundColor: '#EAF4FF',
    borderColor: '#1769AA',
    borderWidth: 1.5,
  },

  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EAF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  optionIconSelected: {
    backgroundColor: '#1769AA',
  },

  optionIconText: {
    fontSize: 22,
  },

  optionContent: {
    flex: 1,
  },

  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#263238',
  },

  optionTitleSelected: {
    color: '#1769AA',
  },

  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#16A34A',
    marginRight: 6,
  },

  optionSubtext: {
    fontSize: 11,
    color: '#8A949E',
  },

  optionSubtextSelected: {
    color: '#5289B4',
  },


  /* RADIO */

  radio: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#C7D0D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  radioSelected: {
    borderColor: '#1769AA',
  },

  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#1769AA',
  },


  /* DOCTOR CARDS */

  doctorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 14,
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
  },

  doctorCardSelected: {
    backgroundColor: '#EAF4FF',
    borderColor: '#1769AA',
    borderWidth: 1.5,
  },

  doctorIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F0F6FC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  doctorIconText: {
    fontSize: 21,
  },

  doctorInfo: {
    flex: 1,
  },

  doctorText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#263238',
  },

  doctorTextSelected: {
    color: '#1769AA',
    fontWeight: '800',
  },

  doctorStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  doctorStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  doctorStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },

  arrivalText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 3,
  },


  /* BOOKING INFO */

  bookingInfoCard: {
    backgroundColor: '#EEF6FF',
    borderRadius: 17,
    padding: 14,
    marginTop: 7,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D7E9FA',
  },

  bookingInfoIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  bookingInfoEmoji: {
    fontSize: 19,
  },

  bookingInfoContent: {
    flex: 1,
  },

  bookingInfoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1769AA',
    marginBottom: 3,
  },

  bookingInfoText: {
    fontSize: 11,
    color: '#607D9A',
    lineHeight: 17,
  },
  /* BOOK BUTTON */

  bookButton: {
    backgroundColor: '#1769AA',
    borderRadius: 16,
    minHeight: 54,
    paddingHorizontal: 18,
    marginTop: 5,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  bookArrow: {
    color: '#FFFFFF',
    fontSize: 22,
    marginLeft: 10,
    marginTop: -2,
    fontWeight: '500',
  },

});