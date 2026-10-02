import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Patient = {
  name?: string;
  phone?: string;
  age?: number;
  gender?: string;
};

export default function PatientProfileScreen() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPatient = async () => {
    try {
      const storedPatient =
        await AsyncStorage.getItem('currentPatient');

      if (storedPatient) {
        setPatient(JSON.parse(storedPatient));
      }
    } catch (error) {
      console.log('PROFILE LOAD ERROR:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatient();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#1769AA"
        />

        <Text style={styles.loadingText}>
          Loading profile...
        </Text>
      </View>
    );
  }

  if (!patient) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Text style={styles.emptyIconText}>P</Text>
        </View>

        <Text style={styles.emptyTitle}>
          Patient details not found
        </Text>

        <Text style={styles.emptyText}>
          Please login again to view your profile.
        </Text>
      </View>
    );
  }

  const initial = patient.name
    ? patient.name.trim().charAt(0).toUpperCase()
    : 'P';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >

      {/* Top Header */}
      <View style={styles.topHeader}>
        <Text style={styles.pageTitle}>
          My Profile
        </Text>

        <Text style={styles.pageSubtitle}>
          Manage your QCare account information
        </Text>
      </View>

      {/* Profile Hero */}
      <View style={styles.profileCard}>
        <View style={styles.avatarOuter}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {initial}
            </Text>
          </View>
        </View>

        <Text style={styles.patientName}>
          {patient.name || 'Patient'}
        </Text>

        <View style={styles.patientBadge}>
          <View style={styles.activeDot} />

          <Text style={styles.patientBadgeText}>
            QCare Patient
          </Text>
        </View>
      </View>

      {/* Personal Information */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Personal Information
        </Text>

        <Text style={styles.sectionSubtitle}>
          Your registered account details
        </Text>
      </View>

      <View style={styles.detailsCard}>

        {/* Full Name */}
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Text style={styles.detailIconText}>
              N
            </Text>
          </View>

          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>
              FULL NAME
            </Text>

            <Text style={styles.detailValue}>
              {patient.name || '-'}
            </Text>
          </View>
        </View>

        <View style={styles.rowDivider} />

        {/* Phone */}
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Text style={styles.detailIconText}>
              P
            </Text>
          </View>

          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>
              PHONE NUMBER
            </Text>

            <Text style={styles.detailValue}>
              {patient.phone || '-'}
            </Text>
          </View>
        </View>

        <View style={styles.rowDivider} />

        {/* Age */}
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Text style={styles.detailIconText}>
              A
            </Text>
          </View>

          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>
              AGE
            </Text>

            <Text style={styles.detailValue}>
              {patient.age ?? '-'}
            </Text>
          </View>
        </View>

        <View style={styles.rowDivider} />

        {/* Gender */}
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Text style={styles.detailIconText}>
              G
            </Text>
          </View>

          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>
              GENDER
            </Text>

            <Text style={styles.detailValue}>
              {patient.gender || '-'}
            </Text>
          </View>
        </View>

      </View>

      {/* Account Card */}
      <View style={styles.accountCard}>
        <View style={styles.accountIcon}>
          <Text style={styles.accountIconText}>
            ✓
          </Text>
        </View>

        <View style={styles.accountContent}>
          <Text style={styles.accountTitle}>
            Account Information
          </Text>

          <Text style={styles.accountText}>
            Your information is securely displayed
            from your registered QCare account.
          </Text>
        </View>
      </View>

      {/* App Branding */}
      <View style={styles.branding}>
        <Text style={styles.brandingTitle}>
          QCare
        </Text>

        <Text style={styles.brandingText}>
          Smart Hospital Queue Management
        </Text>
      </View>

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
    paddingBottom: 45,
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

  emptyContainer: {
    flex: 1,
    backgroundColor: '#F4F7FB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },

  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
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

  topHeader: {
    marginBottom: 20,
  },

  pageTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1769AA',
  },

  pageSubtitle: {
    fontSize: 14,
    color: '#7A8491',
    marginTop: 5,
  },

  profileCard: {
    backgroundColor: '#1769AA',
    borderRadius: 24,
    paddingVertical: 28,
    alignItems: 'center',
    marginBottom: 28,
    elevation: 6,
  },

  avatarOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#EAF4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1769AA',
  },

  patientName: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  patientBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 10,
  },

  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#1769AA',
    marginRight: 6,
  },

  patientBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1769AA',
  },

  sectionHeader: {
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#252525',
  },

  sectionSubtitle: {
    fontSize: 13,
    color: '#8A94A6',
    marginTop: 3,
  },

  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 17,
    paddingVertical: 5,
    elevation: 4,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },

  detailIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EAF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  detailIconText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1769AA',
  },

  detailContent: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: '#8A94A6',
    marginBottom: 4,
  },

  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#252525',
  },

  rowDivider: {
    height: 1,
    backgroundColor: '#E8ECF1',
  },

  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF4FF',
    borderRadius: 19,
    padding: 17,
    marginTop: 20,
  },

  accountIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  accountIconText: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#1769AA',
  },

  accountContent: {
    flex: 1,
  },

  accountTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1769AA',
    marginBottom: 4,
  },

  accountText: {
    fontSize: 13,
    color: '#59636F',
    lineHeight: 19,
  },

  branding: {
    alignItems: 'center',
    marginTop: 30,
  },

  brandingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1769AA',
  },

  brandingText: {
    fontSize: 11,
    color: '#9AA3AD',
    marginTop: 4,
  },
});