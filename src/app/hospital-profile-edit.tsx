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

type HospitalData = {
  id?: number;
  hospital_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: string;
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 45,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F4F7FB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* HEADER */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 26,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  backText: {
    fontSize: 30,
    color: '#111827',
    marginTop: -3,
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },

  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
  },

  headerSpace: {
    width: 44,
  },

  /* PROFILE INTRO */

  introCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E8ECF2',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  introTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#E8F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  profileIconText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2563EB',
  },

  introText: {
    flex: 1,
  },

  introTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },

  introDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 17,
  },

  /* HOSPITAL ID */

  idCard: {
    backgroundColor: '#EEF4FF',
    borderRadius: 18,
    padding: 17,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#D9E6FF',
  },

  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  idLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },

  idValue: {
    fontSize: 15,
    color: '#1D4ED8',
    fontWeight: '800',
  },

  /* SECTION */

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 5,
  },

  sectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 14,
  },

  /* FORM */

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E8ECF2',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  fieldContainer: {
    marginBottom: 17,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#D9DEE7',
    borderRadius: 14,
    backgroundColor: '#FAFBFD',
    paddingHorizontal: 14,
  },

  inputIcon: {
    width: 28,
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '800',
  },

  input: {
    flex: 1,
    minHeight: 50,
    fontSize: 14,
    color: '#111827',
    paddingVertical: 10,
  },

  addressWrapper: {
    alignItems: 'flex-start',
    minHeight: 110,
    paddingTop: 4,
  },

  addressInput: {
    minHeight: 100,
    paddingTop: 10,
    paddingBottom: 10,
  },

  /* SAVE */

  saveButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#2563EB',
    shadowOpacity: 0.22,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 4,
  },

  disabledButton: {
    opacity: 0.7,
  },

  saveText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  /* CANCEL */

  cancelButton: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D7DCE4',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },

  cancelText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '700',
  },

  footer: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 25,
  },
});
export default function HospitalProfileEditScreen() {
  const [hospital, setHospital] =
    useState<HospitalData | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadHospital = async () => {
      try {
        const storedHospital =
          await AsyncStorage.getItem('currentHospital');

        if (!storedHospital) {
          router.replace('/hospital-login');
          return;
        }

        const hospitalData =
          JSON.parse(storedHospital);

        console.log(
          'CURRENT HOSPITAL:',
          JSON.stringify(hospitalData)
        );

        setHospital(hospitalData);

        setName(hospitalData.name || '');
        setEmail(hospitalData.email || '');
        setPhone(hospitalData.phone || '');
        setAddress(hospitalData.address || '');

      } catch (error) {
        console.log(
          'HOSPITAL PROFILE EDIT ERROR:',
          error
        );

        Alert.alert(
          'Error',
          'Unable to load hospital information.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadHospital();
  }, []);

  const handleSave = async () => {
    // -------------------------------
    // VALIDATION
    // -------------------------------

    if (!name.trim()) {
      Alert.alert(
        'Required',
        'Hospital name is required.'
      );
      return;
    }

    if (!email.trim()) {
      Alert.alert(
        'Required',
        'Email is required.'
      );
      return;
    }

    if (!phone.trim()) {
      Alert.alert(
        'Required',
        'Phone number is required.'
      );
      return;
    }

    if (!address.trim()) {
      Alert.alert(
        'Required',
        'Address is required.'
      );
      return;
    }

    // -------------------------------
    // CHECK HOSPITAL DATABASE ID
    // -------------------------------

    if (!hospital?.id) {
      Alert.alert(
        'Error',
        'Hospital database ID is not available.'
      );

      console.log(
        'HOSPITAL ID MISSING:',
        JSON.stringify(hospital)
      );

      return;
    }

    try {
      setSaving(true);

      console.log(
        'UPDATING HOSPITAL ID:',
        hospital.id
      );

      console.log(
        'UPDATE DATA:',
        JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
        })
      );

      // -------------------------------
      // UPDATE MYSQL THROUGH SERVER
      // -------------------------------

      const response = await fetch(
        `https://qcare-tisd.onrender.com/hospital-profile/${hospital.id}`,
        {
          method: 'PUT',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            address: address.trim(),
          }),
        }
      );

      // -------------------------------
      // READ SERVER RESPONSE
      // -------------------------------

      const responseText =
        await response.text();

      console.log(
        'HOSPITAL PROFILE STATUS:',
        response.status
      );

      console.log(
        'HOSPITAL PROFILE RESPONSE:',
        responseText
      );

      // -------------------------------
      // CONVERT RESPONSE TO JSON
      // -------------------------------

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.log(
          'HOSPITAL PROFILE JSON ERROR:',
          error
        );

        Alert.alert(
          'Server Response',
          responseText ||
            'Server returned an empty response.'
        );

        return;
      }

      // -------------------------------
      // SERVER ERROR
      // -------------------------------

      if (!response.ok || !data.success) {
        Alert.alert(
          'Update Failed',
          data.message ||
            'Unable to update hospital information.'
        );

        return;
      }

      // -------------------------------
      // UPDATED HOSPITAL DATA
      // -------------------------------

      const updatedHospital: HospitalData = {
        ...hospital,
        ...data.hospital,
      };

      console.log(
        'UPDATED HOSPITAL:',
        JSON.stringify(updatedHospital)
      );

      // -------------------------------
      // UPDATE LOCAL STORAGE
      // -------------------------------

      await AsyncStorage.setItem(
        'currentHospital',
        JSON.stringify(updatedHospital)
      );

      setHospital(updatedHospital);

      // -------------------------------
      // SUCCESS
      // -------------------------------

      Alert.alert(
        'Saved',
        'Hospital information updated successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/hospital-profile');
            },
          },
        ]
      );

    } catch (error) {
      console.log(
        'SAVE HOSPITAL PROFILE ERROR:',
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

  // -------------------------------
  // LOADING SCREEN
  // -------------------------------

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />
      </View>
    );
  }

  // -------------------------------
  // EDIT SCREEN
  // -------------------------------

  return (
    <View style={styles.screen}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.container}
      >

        {/* HEADER */}

        <View style={styles.header}>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={saving}
          >
            <Text style={styles.backText}>
              ‹
            </Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              Edit Profile
            </Text>

            <Text style={styles.headerSubtitle}>
              Update hospital information
            </Text>
          </View>

          <View style={styles.headerSpace} />

        </View>

        {/* PROFILE INTRO */}

        <View style={styles.introCard}>

          <View style={styles.introTop}>

            <View style={styles.profileIcon}>
              <Text style={styles.profileIconText}>
                H
              </Text>
            </View>

            <View style={styles.introText}>
              <Text style={styles.introTitle}>
                Hospital Profile
              </Text>

              <Text style={styles.introDescription}>
                Keep your hospital details accurate
                and up to date.
              </Text>
            </View>

          </View>

        </View>

        {/* HOSPITAL ID */}

        <View style={styles.idCard}>

          <View style={styles.idRow}>

            <View>
              <Text style={styles.idLabel}>
                Hospital ID
              </Text>

              <Text style={styles.idValue}>
                {hospital?.hospital_id ||
                  'Not available'}
              </Text>
            </View>

            <Text style={{ fontSize: 22 }}>
              #
            </Text>

          </View>

        </View>

        {/* FORM TITLE */}

        <Text style={styles.sectionTitle}>
          Hospital Information
        </Text>

        <Text style={styles.sectionSubtitle}>
          Edit the details shown on your hospital
          profile.
        </Text>

        {/* FORM */}

        <View style={styles.formCard}>

          {/* HOSPITAL NAME */}

          <View style={styles.fieldContainer}>

            <Text style={styles.label}>
              Hospital Name
            </Text>

            <View style={styles.inputWrapper}>

              <Text style={styles.inputIcon}>
                H
              </Text>

              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter hospital name"
                placeholderTextColor="#9CA3AF"
                editable={!saving}
              />

            </View>

          </View>

          {/* EMAIL */}

          <View style={styles.fieldContainer}>

            <Text style={styles.label}>
              Email
            </Text>

            <View style={styles.inputWrapper}>

              <Text style={styles.inputIcon}>
                @
              </Text>

              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!saving}
              />

            </View>

          </View>

          {/* PHONE */}

          <View style={styles.fieldContainer}>

            <Text style={styles.label}>
              Phone Number
            </Text>

            <View style={styles.inputWrapper}>

              <Text style={styles.inputIcon}>
                ☎
              </Text>

              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter phone number"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                maxLength={10}
                editable={!saving}
              />

            </View>

          </View>

          {/* ADDRESS */}

          <View style={{ marginBottom: 2 }}>

            <Text style={styles.label}>
              Address
            </Text>

            <View
              style={[
                styles.inputWrapper,
                styles.addressWrapper,
              ]}
            >

              <Text style={styles.inputIcon}>
                ⌖
              </Text>

              <TextInput
                style={[
                  styles.input,
                  styles.addressInput,
                ]}
                value={address}
                onChangeText={setAddress}
                placeholder="Enter hospital address"
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
                editable={!saving}
              />

            </View>

          </View>

        </View>

        {/* SAVE BUTTON */}

        <TouchableOpacity
          style={[
            styles.saveButton,
            saving && styles.disabledButton,
          ]}
          onPress={handleSave}
          disabled={saving}
        >

          {saving ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <Text style={styles.saveText}>
              Save Changes
            </Text>
          )}

        </TouchableOpacity>

        {/* CANCEL BUTTON */}

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={saving}
        >

          <Text style={styles.cancelText}>
            Cancel
          </Text>

        </TouchableOpacity>

        {/* FOOTER */}

        <Text style={styles.footer}>
          © QCare • Smart Hospital Queue Management
        </Text>

      </ScrollView>

    </View>
  );
}