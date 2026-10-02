import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const SERVER_URL = 'https://qcare-tisd.onrender.com';

const DOCTORS = [
  'General Physician',
  'Cardiologist',
  'Orthopedic',
  'Dermatologist',
];

const GENDERS = ['Male', 'Female', 'Other'];

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },

  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 54 : 42,
    paddingBottom: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EDF4',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  backText: {
    fontSize: 31,
    color: '#2563EB',
    marginTop: -4,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },

  headerSubtitle: {
    fontSize: 12,
    color: '#7B8494',
    marginTop: 3,
  },

  headerBadge: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: 24,
  },

  container: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 90,
  },

  intro: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  introIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#E8F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  introIconText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2563EB',
  },

  introTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
  },

  introText: {
    fontSize: 12.5,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 18,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#EDF0F5',
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },

  sectionSub: {
    fontSize: 11.5,
    color: '#8A94A6',
    marginTop: 3,
  },

  label: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 7,
    marginTop: 15,
  },

  input: {
    height: 51,
    borderWidth: 1,
    borderColor: '#DCE2EA',
    borderRadius: 13,
    paddingHorizontal: 14,
    fontSize: 14.5,
    color: '#111827',
    backgroundColor: '#FBFCFE',
  },

  row: {
    flexDirection: 'row',
    gap: 11,
  },

  dropdown: {
    height: 51,
    borderWidth: 1,
    borderColor: '#DCE2EA',
    borderRadius: 13,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FBFCFE',
  },

  dropdownText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },

  placeholder: {
    color: '#9CA3AF',
  },

  arrow: {
    fontSize: 18,
    color: '#6B7280',
  },

  phoneBox: {
    height: 51,
    borderWidth: 1,
    borderColor: '#DCE2EA',
    borderRadius: 13,
    backgroundColor: '#FBFCFE',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },

  countryCode: {
    height: '100%',
    paddingHorizontal: 14,
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },

  countryText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#374151',
  },

  phoneInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 13,
    fontSize: 14.5,
    color: '#111827',
  },

  doctorBox: {
    height: 58,
    borderWidth: 1,
    borderColor: '#DCE2EA',
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBFCFE',
  },

  doctorIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  doctorIconText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },

  queueCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 17,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#D9E9FF',
  },

  queueIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  queueIconText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },

  queueTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1D4ED8',
    marginBottom: 5,
  },

  queueText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#526174',
  },

  addButton: {
    height: 55,
    borderRadius: 15,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },

  disabledButton: {
    opacity: 0.7,
  },

  plus: {
    color: '#FFFFFF',
    fontSize: 24,
    marginRight: 8,
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '800',
  },

  savingText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
    marginLeft: 10,
  },

  secureText: {
    textAlign: 'center',
    fontSize: 10.5,
    color: '#9CA3AF',
    marginTop: 11,
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.52)',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeText: {
    fontSize: 23,
    color: '#6B7280',
  },

  option: {
    minHeight: 53,
    borderRadius: 13,
    marginTop: 6,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#EEF0F4',
  },

  selectedOption: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },

  optionText: {
    fontSize: 13.5,
    color: '#374151',
    fontWeight: '600',
  },

  selectedOptionText: {
    color: '#2563EB',
    fontWeight: '800',
  },

  check: {
    fontSize: 19,
    color: '#2563EB',
    fontWeight: '800',
  },

  doctorOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  smallDoctorIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  smallDoctorText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
});
export default function AddPatientScreen() {
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [doctor, setDoctor] = useState('');

  const [showGender, setShowGender] = useState(false);
  const [showDoctors, setShowDoctors] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAddPatient = async () => {
    if (!patientName.trim()) {
      Alert.alert('Required', 'Patient name is required.');
      return;
    }

    if (!age.trim()) {
      Alert.alert('Required', 'Patient age is required.');
      return;
    }

    if (!gender) {
      Alert.alert('Required', 'Please select gender.');
      return;
    }

    if (!phone.trim()) {
      Alert.alert('Required', 'Phone number is required.');
      return;
    }

    if (!doctor) {
      Alert.alert('Required', 'Please select a doctor.');
      return;
    }

    const ageNumber = Number(age);
    const cleanPhone = phone.trim();

    if (
      !Number.isInteger(ageNumber) ||
      ageNumber < 1 ||
      ageNumber > 120
    ) {
      Alert.alert('Invalid Age', 'Please enter a valid age.');
      return;
    }

    if (!/^[6-9][0-9]{9}$/.test(cleanPhone)) {
      Alert.alert(
        'Invalid Phone',
        'Enter a valid 10-digit mobile number.'
      );
      return;
    }

    try {
      setSaving(true);

      const storedHospital =
        await AsyncStorage.getItem('currentHospital');

      if (!storedHospital) {
        Alert.alert(
          'Session Error',
          'Hospital information not found.'
        );

        router.replace('/hospital-login');
        return;
      }

      const hospital = JSON.parse(storedHospital);

      if (!hospital.id) {
        Alert.alert(
          'Error',
          'Hospital ID is not available.'
        );
        return;
      }

      const checkResponse = await fetch(
        `${SERVER_URL}/check-patient-phone/${cleanPhone}`
      );

      const checkData = await checkResponse.json();

      if (!checkResponse.ok || !checkData.success) {
        Alert.alert(
          'Unable to Check Patient',
          checkData.message ||
            'Unable to check phone number.'
        );
        return;
      }

      if (checkData.exists === true) {
        Alert.alert(
          'Phone Number Already Registered',
          'This phone number is already registered.'
        );
        return;
      }

      const patientResponse = await fetch(
        `${SERVER_URL}/patient-register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: patientName.trim(),
            phone: cleanPhone,
            age: ageNumber,
            gender: gender,
          }),
        }
      );

      const patientData =
        await patientResponse.json();

      if (
        !patientResponse.ok ||
        !patientData.success
      ) {
        Alert.alert(
          'Unable to Register Patient',
          patientData.message ||
            'Patient registration failed.'
        );
        return;
      }

      const patientId = patientData.patientId;

      if (!patientId) {
        Alert.alert(
          'Error',
          'Patient ID was not returned by the server.'
        );
        return;
      }

      const queueResponse = await fetch(
        `${SERVER_URL}/live-queue`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            hospitalId: hospital.id,
            patientId: patientId,
            patient: patientName.trim(),
            phone: cleanPhone,
            doctor: doctor,
          }),
        }
      );

      const queueData =
        await queueResponse.json();

      if (
        !queueResponse.ok ||
        !queueData.success
      ) {
        Alert.alert(
          'Unable to Add Patient',
          queueData.message ||
            'Patient could not be added to the queue.'
        );
        return;
      }

      const appointmentResponse = await fetch(
        `${SERVER_URL}/hospital-create-appointment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            patientId: patientId,
            hospitalId: hospital.id,
            doctor: doctor,
            token: queueData.token,
          }),
        }
      );

      const appointmentData =
        await appointmentResponse.json();

      if (
        !appointmentResponse.ok ||
        !appointmentData.success
      ) {
        Alert.alert(
          'Appointment Error',
          appointmentData.message ||
            'Unable to create appointment.'
        );
        return;
      }

      Alert.alert(
        'Patient Added Successfully',
        `Patient: ${patientName.trim()}\n` +
          `Age: ${ageNumber}\n` +
          `Gender: ${gender}\n` +
          `Doctor: ${doctor}\n` +
          `Token: ${queueData.token}`,
        [
          {
            text: 'OK',
            onPress: () =>
              router.replace('/hospital-dashboard'),
          },
        ]
      );
    } catch (error) {
      console.log(
        'ADD PATIENT ERROR:',
        error
      );

      Alert.alert(
        'Connection Error',
        'Unable to connect to QCare server.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.screen}>

      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>
            Add Patient
          </Text>

          <Text style={styles.headerSubtitle}>
            Register and add patient to queue
          </Text>
        </View>

        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>
            +
          </Text>
        </View>

      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >

        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >

          <View style={styles.intro}>

            <View style={styles.introIcon}>
              <Text style={styles.introIconText}>
                P
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.introTitle}>
                New Patient
              </Text>

              <Text style={styles.introText}>
                Enter the patient's details to create
                their appointment.
              </Text>
            </View>

          </View>

          <View style={styles.card}>

            <Text style={styles.sectionTitle}>
              Patient Information
            </Text>

            <Text style={styles.label}>
              Patient Name
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter patient name"
              placeholderTextColor="#9CA3AF"
              value={patientName}
              onChangeText={setPatientName}
              autoCapitalize="words"
            />

            <View style={styles.row}>

              <View style={{ flex: 1 }}>
                <Text style={styles.label}>
                  Age
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Age"
                  placeholderTextColor="#9CA3AF"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.label}>
                  Gender
                </Text>

                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() =>
                    setShowGender(true)
                  }
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      !gender &&
                        styles.placeholder,
                    ]}
                  >
                    {gender || 'Select'}
                  </Text>

                  <Text style={styles.arrow}>
                    ⌄
                  </Text>
                </TouchableOpacity>
              </View>

            </View>

            <Text style={styles.label}>
              Phone Number
            </Text>

            <View style={styles.phoneBox}>

              <View style={styles.countryCode}>
                <Text style={styles.countryText}>
                  +91
                </Text>
              </View>

              <TextInput
                style={styles.phoneInput}
                placeholder="10-digit mobile number"
                placeholderTextColor="#9CA3AF"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={10}
              />

            </View>

          </View>

          <View style={styles.card}>

            <Text style={styles.sectionTitle}>
              Consultation
            </Text>

            <Text style={styles.sectionSub}>
              Choose the consulting doctor
            </Text>

            <Text style={styles.label}>
              Select Doctor
            </Text>

            <TouchableOpacity
              style={styles.doctorBox}
              onPress={() =>
                setShowDoctors(true)
              }
            >

              <View style={styles.doctorIcon}>
                <Text style={styles.doctorIconText}>
                  Dr
                </Text>
              </View>

              <Text
                style={[
                  styles.dropdownText,
                  !doctor &&
                    styles.placeholder,
                  {
                    flex: 1,
                  },
                ]}
              >
                {doctor || 'Select a doctor'}
              </Text>

              <Text style={styles.arrow}>
                ⌄
              </Text>

            </TouchableOpacity>

          </View>
          <View style={styles.queueCard}>

            <View style={styles.queueIcon}>
              <Text style={styles.queueIconText}>
                ✓
              </Text>
            </View>

            <View style={{ flex: 1 }}>

              <Text style={styles.queueTitle}>
                Automatic Queue Management
              </Text>

              <Text style={styles.queueText}>
                QCare will automatically generate a
                token and add the patient to the
                selected doctor's live queue.
              </Text>

            </View>

          </View>

          <TouchableOpacity
            style={[
              styles.addButton,
              saving && styles.disabledButton,
            ]}
            onPress={handleAddPatient}
            disabled={saving}
          >

            {saving ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <Text style={styles.savingText}>
                  Adding Patient...
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.plus}>
                  +
                </Text>

                <Text style={styles.addButtonText}>
                  Add Patient
                </Text>
              </>
            )}

          </TouchableOpacity>

          <Text style={styles.secureText}>
            Patient information is securely processed
            through QCare.
          </Text>

        </ScrollView>

      </KeyboardAvoidingView>

      {/* GENDER MODAL */}

      <Modal
        visible={showGender}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowGender(false)
        }
      >

        <View style={styles.overlay}>

          <View style={styles.modal}>

            <View style={styles.modalHeader}>

              <Text style={styles.modalTitle}>
                Select Gender
              </Text>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() =>
                  setShowGender(false)
                }
              >
                <Text style={styles.closeText}>
                  ×
                </Text>
              </TouchableOpacity>

            </View>

            {GENDERS.map((item) => (

              <TouchableOpacity
                key={item}
                style={[
                  styles.option,
                  gender === item &&
                    styles.selectedOption,
                ]}
                onPress={() => {
                  setGender(item);
                  setShowGender(false);
                }}
              >

                <Text
                  style={[
                    styles.optionText,
                    gender === item &&
                      styles.selectedOptionText,
                  ]}
                >
                  {item}
                </Text>

                {gender === item && (
                  <Text style={styles.check}>
                    ✓
                  </Text>
                )}

              </TouchableOpacity>

            ))}

          </View>

        </View>

      </Modal>

      {/* DOCTOR MODAL */}

      <Modal
        visible={showDoctors}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowDoctors(false)
        }
      >

        <View style={styles.overlay}>

          <View style={styles.modal}>

            <View style={styles.modalHeader}>

              <Text style={styles.modalTitle}>
                Select Doctor
              </Text>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() =>
                  setShowDoctors(false)
                }
              >
                <Text style={styles.closeText}>
                  ×
                </Text>
              </TouchableOpacity>

            </View>

            {DOCTORS.map((item) => (

              <TouchableOpacity
                key={item}
                style={[
                  styles.option,
                  doctor === item &&
                    styles.selectedOption,
                ]}
                onPress={() => {
                  setDoctor(item);
                  setShowDoctors(false);
                }}
              >

                <View
                  style={styles.doctorOptionLeft}
                >

                  <View
                    style={styles.smallDoctorIcon}
                  >
                    <Text
                      style={styles.smallDoctorText}
                    >
                      Dr
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.optionText,
                      doctor === item &&
                        styles.selectedOptionText,
                    ]}
                  >
                    {item}
                  </Text>

                </View>

                {doctor === item && (
                  <Text style={styles.check}>
                    ✓
                  </Text>
                )}

              </TouchableOpacity>

            ))}

          </View>

        </View>

      </Modal>

    </View>
  );
}