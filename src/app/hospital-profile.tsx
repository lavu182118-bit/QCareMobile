import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';

import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const API_URL = 'https://qcare-tisd.onrender.com';

type HospitalData = {
  id?: number;
  hospital_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: string;
  reactivation_status?: string | null;
};

type DoctorAvailability = {
  doctor: string;
  status: string;
  expectedArrivalTime: string;
};

const DOCTORS = [
  {
    name: 'General Physician',
    icon: '🩺',
  },
  {
    name: 'Cardiologist',
    icon: '❤️',
  },
  {
    name: 'Orthopedic',
    icon: '🦴',
  },
  {
    name: 'Dermatologist',
    icon: '🧴',
  },
];

export default function HospitalProfileScreen() {

  const [hospital, setHospital] =
    useState<HospitalData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [doctorAvailability, setDoctorAvailability] =
    useState<DoctorAvailability[]>(
      DOCTORS.map((doctor) => ({
        doctor: doctor.name,
        status: '',
        expectedArrivalTime: '',
      }))
    );

  const [savingDoctor, setSavingDoctor] =
    useState<string | null>(null);

  // ==========================================
  // LOAD HOSPITAL
  // ==========================================

  useEffect(() => {

    const loadHospital = async () => {

      try {

        const storedHospital =
          await AsyncStorage.getItem(
            'currentHospital'
          );

        if (!storedHospital) {
          router.replace('/hospital-login');
          return;
        }

        const hospitalData =
          JSON.parse(storedHospital);

        setHospital(hospitalData);

        if (hospitalData.id) {
          loadDoctorAvailability(
            hospitalData.id
          );
        }

      } catch (error) {

        console.log(
          'HOSPITAL PROFILE ERROR:',
          error
        );

      } finally {

        setLoading(false);

      }
    };

    loadHospital();

  }, []);

  // ==========================================
  // LOAD DOCTOR AVAILABILITY
  // ==========================================

  const loadDoctorAvailability = async (
    hospitalId: number
  ) => {

    try {

      const response =
        await fetch(
          `${API_URL}/doctor-availability/${hospitalId}`
        );

      const data =
        await response.json();

      if (
        data.success &&
        Array.isArray(data.doctors)
      ) {

        setDoctorAvailability(
          DOCTORS.map((doctor) => {

            const savedDoctor =
              data.doctors.find(
                (item: any) =>
                  item.doctor === doctor.name
              );

            return {
              doctor: doctor.name,
              status:
                savedDoctor?.status || '',
              expectedArrivalTime:
                savedDoctor?.expected_arrival_time
                  ? String(
                      savedDoctor.expected_arrival_time
                    )
                  : '',
            };

          })
        );

      }

    } catch (error) {

      console.log(
        'DOCTOR AVAILABILITY LOAD ERROR:',
        error
      );

    }

  };

  // ==========================================
  // UPDATE LOCAL DOCTOR STATUS
  // ==========================================

  const updateDoctorStatus = (
    doctorName: string,
    status: string
  ) => {

    setDoctorAvailability(
      (current) =>
        current.map((doctor) =>
          doctor.doctor === doctorName
            ? {
                ...doctor,
                status,
              }
            : doctor
        )
    );

  };

  // ==========================================
  // UPDATE LOCAL ARRIVAL TIME
  // ==========================================

  const updateArrivalTime = (
    doctorName: string,
    time: string
  ) => {

    setDoctorAvailability(
      (current) =>
        current.map((doctor) =>
          doctor.doctor === doctorName
            ? {
                ...doctor,
                expectedArrivalTime: time,
              }
            : doctor
        )
    );

  };

  // ==========================================
  // SAVE DOCTOR AVAILABILITY
  // ==========================================

  const saveDoctorAvailability = async (
    doctor: DoctorAvailability
  ) => {

    if (!hospital?.id) {

      Alert.alert(
        'Error',
        'Hospital information is not available.'
      );

      return;
    }

    if (!doctor.status) {

      Alert.alert(
        'Select Status',
        `Please select Available or Unavailable for ${doctor.doctor}.`
      );

      return;
    }

    try {

      setSavingDoctor(doctor.doctor);

      const response =
        await fetch(
          `${API_URL}/doctor-availability`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              hospitalId: hospital.id,
              doctor: doctor.doctor,
              status: doctor.status,
              expectedArrivalTime:
                doctor.expectedArrivalTime.trim() ||
                null,
            }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {

        Alert.alert(
          'Update Failed',
          data.message ||
            'Unable to update doctor availability.'
        );

        return;
      }

      Alert.alert(
        'Updated Successfully',
        `${doctor.doctor} availability has been updated.`
      );

      // Refresh from database
      await loadDoctorAvailability(
        hospital.id
      );

    } catch (error) {

      console.log(
        'DOCTOR AVAILABILITY SAVE ERROR:',
        error
      );

      Alert.alert(
        'Connection Error',
        'Unable to connect to QCare server.'
      );

    } finally {

      setSavingDoctor(null);

    }

  };

  // ==========================================
  // DEACTIVATE HOSPITAL
  // ==========================================

  const deactivateHospital = () => {

    if (!hospital?.id) {

      Alert.alert(
        'Error',
        'Hospital information not available.'
      );

      return;
    }

    Alert.alert(
      'Deactivate Hospital',
      'Are you sure you want to deactivate your hospital account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Deactivate',
          style: 'destructive',

          onPress: async () => {

            try {

              setActionLoading(true);

              const response =
                await fetch(
                  `${API_URL}/hospital-deactivate/${hospital.id}`,
                  {
                    method: 'PUT',
                  }
                );

              const data =
                await response.json();

              if (
                !response.ok ||
                !data.success
              ) {

                Alert.alert(
                  'Unable to Deactivate',
                  data.message ||
                    'Unable to deactivate hospital.'
                );

                return;
              }

              const updatedHospital = {
                ...hospital,
                status: 'Deactivated',
                reactivation_status: null,
              };

              setHospital(
                updatedHospital
              );

              await AsyncStorage.setItem(
                'currentHospital',
                JSON.stringify(
                  updatedHospital
                )
              );

              Alert.alert(
                'Hospital Deactivated',
                'Your hospital account has been deactivated.'
              );

            } catch (error) {

              console.log(
                'DEACTIVATE ERROR:',
                error
              );

              Alert.alert(
                'Connection Error',
                'Unable to connect to QCare server.'
              );

            } finally {

              setActionLoading(false);

            }

          },
        },
      ]
    );
  };

  // ==========================================
  // REQUEST REACTIVATION
  // ==========================================

  const requestReactivation = () => {

    if (!hospital?.id) {

      Alert.alert(
        'Error',
        'Hospital information not available.'
      );

      return;
    }

    Alert.alert(
      'Request Reactivation',
      'Your request will be sent to the Admin for approval.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Send Request',

          onPress: async () => {

            try {

              setActionLoading(true);

              const response =
                await fetch(
                  `${API_URL}/hospital-request-reactivation/${hospital.id}`,
                  {
                    method: 'PUT',
                  }
                );

              const data =
                await response.json();

              if (
                !response.ok ||
                !data.success
              ) {

                Alert.alert(
                  'Unable to Send Request',
                  data.message ||
                    'Unable to submit reactivation request.'
                );

                return;
              }

              const updatedHospital = {
                ...hospital,
                reactivation_status: 'Pending',
              };

              setHospital(
                updatedHospital
              );

              await AsyncStorage.setItem(
                'currentHospital',
                JSON.stringify(
                  updatedHospital
                )
              );

              Alert.alert(
                'Request Submitted',
                'Your reactivation request has been sent to Admin.'
              );

            } catch (error) {

              console.log(
                'REACTIVATION REQUEST ERROR:',
                error
              );

              Alert.alert(
                'Connection Error',
                'Unable to connect to QCare server.'
              );

            } finally {

              setActionLoading(false);

            }

          },
        },
      ]
    );
  };
  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (loading) {

    return (
      <View style={styles.loadingContainer}>

        <View style={styles.loadingCard}>

          <ActivityIndicator
            size="large"
            color="#2563EB"
          />

          <Text style={styles.loadingText}>
            Loading profile...
          </Text>

        </View>

      </View>
    );
  }

  const hospitalName =
    hospital?.name || 'Hospital';

  const hospitalInitial =
    hospitalName
      .trim()
      .charAt(0)
      .toUpperCase() || 'H';

  const hospitalStatus =
    hospital?.status || 'Active';

  const reactivationStatus =
    hospital?.reactivation_status || null;

  const isDeactivated =
    hospitalStatus === 'Deactivated';

  return (
    <View style={styles.screen}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.container
        }
      >

        {/* =====================================
            HEADER
        ===================================== */}

        <View style={styles.header}>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >

            <Text style={styles.backText}>
              ‹
            </Text>

          </TouchableOpacity>

          <View style={styles.headerCenter}>

            <Text style={styles.headerTitle}>
              Hospital Profile
            </Text>

            <Text style={styles.headerSubtitle}>
              Manage your hospital account
            </Text>

          </View>

          <View style={styles.headerSpace} />

        </View>


        {/* =====================================
            PROFILE HERO
        ===================================== */}

        <View style={styles.profileCard}>

          <View style={styles.profileCircle}>

            <Text style={styles.profileInitial}>
              {hospitalInitial}
            </Text>

          </View>

          <Text style={styles.hospitalName}>
            {hospitalName}
          </Text>

          <Text style={styles.hospitalId}>
            ID: {hospital?.hospital_id || 'Not available'}
          </Text>

          <View
            style={[
              styles.statusBadge,
              isDeactivated &&
                styles.deactivatedBadge,
            ]}
          >

            <View
              style={[
                styles.statusDot,
                isDeactivated &&
                  styles.deactivatedDot,
              ]}
            />

            <Text
              style={[
                styles.statusText,
                isDeactivated &&
                  styles.deactivatedText,
              ]}
            >
              {hospitalStatus}
            </Text>

          </View>

        </View>


        {/* =====================================
            HOSPITAL INFORMATION
        ===================================== */}

        <View style={styles.sectionHeader}>

          <View>

            <Text style={styles.sectionTitle}>
              Hospital Information
            </Text>

            <Text style={styles.sectionSubtitle}>
              Registered hospital details
            </Text>

          </View>

        </View>

        <View style={styles.infoCard}>

          <InfoRow
            icon="ID"
            label="Hospital ID"
            value={hospital?.hospital_id}
          />

          <InfoRow
            icon="H"
            label="Hospital Name"
            value={hospital?.name}
          />

          <InfoRow
            icon="@"
            label="Email"
            value={hospital?.email}
          />

          <InfoRow
            icon="☎"
            label="Phone"
            value={hospital?.phone}
          />

          <InfoRow
            icon="⌂"
            label="Address"
            value={hospital?.address}
            last
          />

        </View>


        {/* =====================================
            EDIT HOSPITAL INFORMATION
        ===================================== */}

        <TouchableOpacity
          style={[
            styles.editButton,
            isDeactivated &&
              styles.disabledButton,
          ]}
          onPress={() =>
            router.push(
              '/hospital-profile-edit'
            )
          }
          disabled={isDeactivated}
          activeOpacity={0.85}
        >

          <Text style={styles.editIcon}>
            ✎
          </Text>

          <Text style={styles.editButtonText}>
            Edit Hospital Information
          </Text>

        </TouchableOpacity>


        {/* =====================================
            DOCTOR AVAILABILITY
        ===================================== */}

        <View style={styles.doctorSectionHeader}>

          <View style={styles.doctorHeaderText}>

            <Text style={styles.sectionTitle}>
              Doctor Availability
            </Text>

            <Text style={styles.sectionSubtitle}>
              Update doctor status and expected arrival
            </Text>

          </View>

          <View style={styles.liveAvailabilityBadge}>

            <View style={styles.liveAvailabilityDot} />

            <Text style={styles.liveAvailabilityText}>
              LIVE
            </Text>

          </View>

        </View>


        {/* =====================================
            DOCTOR CARDS
        ===================================== */}

        {doctorAvailability.map(
          (doctor) => {

            const doctorInfo =
              DOCTORS.find(
                (item) =>
                  item.name === doctor.doctor
              );

            const isAvailable =
              doctor.status === 'Available';

            const isUnavailable =
              doctor.status === 'Unavailable';

            const isSaving =
              savingDoctor === doctor.doctor;

            return (

              <View
                key={doctor.doctor}
                style={styles.doctorAvailabilityCard}
              >

                {/* DOCTOR HEADER */}

                <View style={styles.doctorTopRow}>

                  <View
                    style={[
                      styles.doctorIconBox,
                      isAvailable &&
                        styles.doctorIconAvailable,
                      isUnavailable &&
                        styles.doctorIconUnavailable,
                    ]}
                  >

                    <Text style={styles.doctorIcon}>
                      {doctorInfo?.icon || '🩺'}
                    </Text>

                  </View>

                  <View style={styles.doctorTitleArea}>

                    <Text style={styles.doctorName}>
                      {doctor.doctor}
                    </Text>

                    <Text style={styles.doctorHint}>
                      Patient-facing availability
                    </Text>

                  </View>

                  {doctor.status ? (

                    <View
                      style={[
                        styles.doctorStatusBadge,
                        isAvailable &&
                          styles.availableBadge,
                        isUnavailable &&
                          styles.unavailableBadge,
                      ]}
                    >

                      <View
                        style={[
                          styles.doctorStatusDot,
                          isAvailable &&
                            styles.availableDot,
                          isUnavailable &&
                            styles.unavailableDot,
                        ]}
                      />

                      <Text
                        style={[
                          styles.doctorStatusText,
                          isAvailable &&
                            styles.availableStatusText,
                          isUnavailable &&
                            styles.unavailableStatusText,
                        ]}
                      >
                        {doctor.status}
                      </Text>

                    </View>

                  ) : (

                    <View style={styles.notUpdatedBadge}>

                      <Text style={styles.notUpdatedText}>
                        Not updated
                      </Text>

                    </View>

                  )}

                </View>


                {/* STATUS SELECTOR */}

                <Text style={styles.fieldLabel}>
                  Doctor Status
                </Text>

                <View style={styles.statusSelectorRow}>

                  <TouchableOpacity
                    style={[
                      styles.statusOption,
                      isAvailable &&
                        styles.statusOptionAvailable,
                    ]}
                    onPress={() =>
                      updateDoctorStatus(
                        doctor.doctor,
                        'Available'
                      )
                    }
                    activeOpacity={0.8}
                    disabled={isDeactivated}
                  >

                    <View
                      style={[
                        styles.radioOuter,
                        isAvailable &&
                          styles.radioOuterAvailable,
                      ]}
                    >

                      {isAvailable && (
                        <View
                          style={
                            styles.radioInnerAvailable
                          }
                        />
                      )}

                    </View>

                    <Text
                      style={[
                        styles.statusOptionText,
                        isAvailable &&
                          styles.statusOptionTextActive,
                      ]}
                    >
                      Available
                    </Text>

                  </TouchableOpacity>


                  <TouchableOpacity
                    style={[
                      styles.statusOption,
                      isUnavailable &&
                        styles.statusOptionUnavailable,
                    ]}
                    onPress={() =>
                      updateDoctorStatus(
                        doctor.doctor,
                        'Unavailable'
                      )
                    }
                    activeOpacity={0.8}
                    disabled={isDeactivated}
                  >

                    <View
                      style={[
                        styles.radioOuter,
                        isUnavailable &&
                          styles.radioOuterUnavailable,
                      ]}
                    >

                      {isUnavailable && (
                        <View
                          style={
                            styles.radioInnerUnavailable
                          }
                        />
                      )}

                    </View>

                    <Text
                      style={[
                        styles.statusOptionText,
                        isUnavailable &&
                          styles.statusOptionTextUnavailable,
                      ]}
                    >
                      Unavailable
                    </Text>

                  </TouchableOpacity>

                </View>


                {/* EXPECTED ARRIVAL */}

                <Text style={styles.fieldLabel}>
                  Expected Arrival Time
                </Text>

                <TextInput
                  style={styles.arrivalInput}
                  value={
                    doctor.expectedArrivalTime
                  }
                  onChangeText={(text) =>
                    updateArrivalTime(
                      doctor.doctor,
                      text
                    )
                  }
                  placeholder="Example: 10:30 AM"
                  placeholderTextColor="#A0AEC0"
                  editable={!isDeactivated}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />


                {/* SAVE */}

                <TouchableOpacity
                  style={[
                    styles.saveDoctorButton,
                    isDeactivated &&
                      styles.disabledButton,
                  ]}
                  onPress={() =>
                    saveDoctorAvailability(
                      doctor
                    )
                  }
                  disabled={
                    isDeactivated ||
                    isSaving
                  }
                  activeOpacity={0.85}
                >

                  {isSaving ? (

                    <ActivityIndicator
                      color="#FFFFFF"
                      size="small"
                    />

                  ) : (

                    <>
                      <Text
                        style={
                          styles.saveDoctorIcon
                        }
                      >
                        ✓
                      </Text>

                      <Text
                        style={
                          styles.saveDoctorText
                        }
                      >
                        Save Update
                      </Text>
                    </>

                  )}

                </TouchableOpacity>

              </View>

            );

          }
        )}


        {/* =====================================
            ACCOUNT STATUS
        ===================================== */}

        <View style={styles.sectionHeader}>

          <View>

            <Text style={styles.sectionTitle}>
              Account Status
            </Text>

            <Text style={styles.sectionSubtitle}>
              Manage hospital account access
            </Text>

          </View>

        </View>

        <View style={styles.accountCard}>

          <View style={styles.accountTopRow}>

            <View
              style={[
                styles.accountIcon,
                isDeactivated &&
                  styles.accountIconRed,
              ]}
            >

              <Text style={styles.accountIconText}>
                {isDeactivated ? '!' : '✓'}
              </Text>

            </View>

            <View style={styles.accountTitleArea}>

              <Text style={styles.accountTitle}>
                Hospital Account
              </Text>

              <Text style={styles.accountStatusText}>
                {hospitalStatus}
              </Text>

            </View>

          </View>

          <Text style={styles.accountDescription}>
            {hospitalStatus === 'Active'
              ? 'Your hospital account is currently active and available for managing patients and appointments.'
              : 'Your hospital account is currently deactivated. You can request reactivation from Admin.'}
          </Text>


          {/* ACTIVE */}

          {hospitalStatus === 'Active' && (

            <TouchableOpacity
              style={styles.deactivateButton}
              onPress={deactivateHospital}
              disabled={actionLoading}
              activeOpacity={0.85}
            >

              {actionLoading ? (

                <ActivityIndicator
                  color="#FFFFFF"
                />

              ) : (

                <>
                  <Text style={styles.deactivateIcon}>
                    !
                  </Text>

                  <Text
                    style={
                      styles.deactivateButtonText
                    }
                  >
                    Deactivate Hospital
                  </Text>
                </>

              )}

            </TouchableOpacity>

          )}


          {/* DEACTIVATED */}

          {hospitalStatus === 'Deactivated' && (

            <>
              {reactivationStatus === 'Pending' ? (

                <View style={styles.pendingBox}>

                  <View style={styles.pendingIcon}>

                    <Text
                      style={
                        styles.pendingIconText
                      }
                    >
                      ⏳
                    </Text>

                  </View>

                  <View style={styles.pendingContent}>

                    <Text
                      style={
                        styles.pendingTitle
                      }
                    >
                      Reactivation Request Pending
                    </Text>

                    <Text
                      style={
                        styles.pendingText
                      }
                    >
                      Your request is waiting for Admin approval.
                    </Text>

                  </View>

                </View>

              ) : (

                <TouchableOpacity
                  style={
                    styles.reactivateButton
                  }
                  onPress={
                    requestReactivation
                  }
                  disabled={actionLoading}
                  activeOpacity={0.85}
                >

                  {actionLoading ? (

                    <ActivityIndicator
                      color="#FFFFFF"
                    />

                  ) : (

                    <>
                      <Text
                        style={
                          styles.reactivateIcon
                        }
                      >
                        ↻
                      </Text>

                      <Text
                        style={
                          styles.reactivateButtonText
                        }
                      >
                        Request Reactivation
                      </Text>
                    </>

                  )}

                </TouchableOpacity>

              )}
            </>

          )}


        </View>


        {/* =====================================
            FOOTER
        ===================================== */}

        <Text style={styles.footer}>
          QCare • Smart Hospital Queue Management
        </Text>

      </ScrollView>

    </View>
  );
}

type InfoRowProps = {
  icon: string;
  label: string;
  value?: string;
  last?: boolean;
};

function InfoRow({
  icon,
  label,
  value,
  last,
}: InfoRowProps) {

  return (
    <View
      style={[
        styles.infoRow,
        last && styles.lastInfoRow,
      ]}
    >

      <View style={styles.infoIcon}>

        <Text style={styles.infoIconText}>
          {icon}
        </Text>

      </View>

      <View style={styles.infoTextArea}>

        <Text style={styles.infoLabel}>
          {label}
        </Text>

        <Text style={styles.infoValue}>
          {value || 'Not available'}
        </Text>

      </View>

    </View>
  );
}
const styles = StyleSheet.create({

  screen: {
    flex: 1,
    backgroundColor: '#F6F8FC',
  },

  container: {
    paddingHorizontal: 18,
    paddingTop: 48,
    paddingBottom: 45,
  },

  /* =====================================
     LOADING
  ===================================== */

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F6F8FC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingCard: {
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },

  /* =====================================
     HEADER
  ===================================== */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8ECF3',
    elevation: 2,
  },

  backText: {
    fontSize: 32,
    color: '#0F172A',
    marginTop: -4,
  },

  headerCenter: {
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
  },

  headerSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 3,
    fontWeight: '500',
  },

  headerSpace: {
    width: 44,
  },

  /* =====================================
     PROFILE
  ===================================== */

  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#EDF0F5',
    elevation: 3,
  },

  profileCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  profileInitial: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
  },

  hospitalName: {
    fontSize: 21,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },

  hospitalId: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 5,
    fontWeight: '600',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF3',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 12,
  },

  deactivatedBadge: {
    backgroundColor: '#FEF2F2',
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
    marginRight: 7,
  },

  deactivatedDot: {
    backgroundColor: '#DC2626',
  },

  statusText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '800',
  },

  deactivatedText: {
    color: '#DC2626',
  },

  /* =====================================
     SECTIONS
  ===================================== */

  sectionHeader: {
    marginBottom: 12,
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },

  sectionSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 3,
  },

  doctorSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 13,
  },

  doctorHeaderText: {
    flex: 1,
  },

  liveAvailabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF3',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 10,
  },

  liveAvailabilityDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#16A34A',
    marginRight: 5,
  },

  liveAvailabilityText: {
    color: '#15803D',
    fontSize: 9,
    fontWeight: '900',
  },

  /* =====================================
     INFORMATION
  ===================================== */

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EDF0F5',
    elevation: 2,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F5',
  },

  lastInfoRow: {
    borderBottomWidth: 0,
  },

  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  infoIconText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '800',
  },

  infoTextArea: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 4,
    fontWeight: '600',
  },

  infoValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '700',
  },

  /* =====================================
     EDIT BUTTON
  ===================================== */

  editButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 28,
    elevation: 3,
  },

  disabledButton: {
    backgroundColor: '#CBD5E1',
    elevation: 0,
  },

  editIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },

  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  /* =====================================
     DOCTOR AVAILABILITY
  ===================================== */

  doctorAvailabilityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 17,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E9EEF5',
    elevation: 2,
  },

  doctorTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 17,
  },

  doctorIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  doctorIconAvailable: {
    backgroundColor: '#ECFDF3',
  },

  doctorIconUnavailable: {
    backgroundColor: '#FEF2F2',
  },

  doctorIcon: {
    fontSize: 25,
  },

  doctorTitleArea: {
    flex: 1,
  },

  doctorName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },

  doctorHint: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },

  doctorStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
  },

  availableBadge: {
    backgroundColor: '#ECFDF3',
  },

  unavailableBadge: {
    backgroundColor: '#FEF2F2',
  },

  doctorStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  availableDot: {
    backgroundColor: '#16A34A',
  },

  unavailableDot: {
    backgroundColor: '#DC2626',
  },

  doctorStatusText: {
    fontSize: 9,
    fontWeight: '800',
  },

  availableStatusText: {
    color: '#15803D',
  },

  unavailableStatusText: {
    color: '#DC2626',
  },

  notUpdatedBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
  },

  notUpdatedText: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
  },

  fieldLabel: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '700',
    marginBottom: 8,
  },

  statusSelectorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },

  statusOption: {
    flex: 1,
    height: 45,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusOptionAvailable: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },

  statusOptionUnavailable: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },

  radioOuter: {
    width: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  radioOuterAvailable: {
    borderColor: '#16A34A',
  },

  radioOuterUnavailable: {
    borderColor: '#DC2626',
  },

  radioInnerAvailable: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },

  radioInnerUnavailable: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
  },

  statusOptionText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
  },

  statusOptionTextActive: {
    color: '#15803D',
  },

  statusOptionTextUnavailable: {
    color: '#DC2626',
  },

  arrivalInput: {
    height: 48,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    color: '#1E293B',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 13,
  },

  saveDoctorButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },

  saveDoctorIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginRight: 7,
  },

  saveDoctorText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  /* =====================================
     ACCOUNT
  ===================================== */

  accountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EDF0F5',
    elevation: 2,
  },

  accountTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  accountIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#ECFDF3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  accountIconRed: {
    backgroundColor: '#FEF2F2',
  },

  accountIconText: {
    color: '#16A34A',
    fontSize: 18,
    fontWeight: '900',
  },

  accountTitleArea: {
    flex: 1,
  },

  accountTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },

  accountStatusText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '600',
  },

  accountDescription: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 19,
    marginTop: 14,
  },

  /* =====================================
     DEACTIVATE
  ===================================== */

  deactivateButton: {
    height: 50,
    borderRadius: 15,
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 17,
  },

  deactivateIcon: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    marginRight: 7,
  },

  deactivateButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  /* =====================================
     REACTIVATE
  ===================================== */

  reactivateButton: {
    height: 50,
    borderRadius: 15,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 17,
  },

  reactivateIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginRight: 7,
  },

  reactivateButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  /* =====================================
     PENDING
  ===================================== */

  pendingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 15,
    padding: 14,
    marginTop: 17,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },

  pendingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  pendingIconText: {
    fontSize: 17,
  },

  pendingContent: {
    flex: 1,
  },

  pendingTitle: {
    color: '#92400E',
    fontSize: 13,
    fontWeight: '800',
  },

  pendingText: {
    color: '#A16207',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 3,
  },

  /* =====================================
     FOOTER
  ===================================== */

  footer: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 25,
    fontWeight: '500',
  },

});