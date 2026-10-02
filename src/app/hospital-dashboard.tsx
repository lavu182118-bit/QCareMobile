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

type HospitalData = {
  id?: number;
  hospital_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: string;
};

export default function HospitalDashboardScreen() {

  const [hospital, setHospital] =
    useState<HospitalData | null>(null);

  const [checkingSession, setCheckingSession] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [unreadNotifications, setUnreadNotifications] =
    useState(0);

  const [stats, setStats] = useState({
    patients: 0,
    waiting: 0,
    completed: 0,
    appointments: 0,
  });

  const loadHospital = async () => {

    try {

      const loggedIn =
        await AsyncStorage.getItem(
          'hospitalLoggedIn'
        );

      const storedHospital =
        await AsyncStorage.getItem(
          'currentHospital'
        );

      if (
        loggedIn !== 'true' ||
        !storedHospital
      ) {

        router.replace('/hospital-login');
        return;

      }

      const hospitalData =
        JSON.parse(storedHospital);

      setHospital(hospitalData);

      // LOAD UNREAD NOTIFICATION COUNT
      try {

        const notificationResponse =
          await fetch(
            `https://qcare-tisd.onrender.com/hospital-notifications/${hospitalData.id}`
          );

        const notificationData =
          await notificationResponse.json();

        if (
          notificationData.success &&
          Array.isArray(
            notificationData.notifications
          )
        ) {

          const unreadCount =
            notificationData.notifications.filter(
              (notification: any) =>
                !notification.is_read
            ).length;

          setUnreadNotifications(
            unreadCount
          );

        }

      } catch (error) {

        console.log(
          'NOTIFICATION COUNT ERROR:',
          error
        );

      }

      try {

        const response = await fetch(
  `https://qcare-tisd.onrender.com/hospital-stats/${hospitalData.id}`
);

        const data =
          await response.json();

        if (data.success) {

          setStats(data.stats);

        }

        const appointmentResponse =
  await fetch(
    `https://qcare-tisd.onrender.com/hospital-appointments-count/${hospitalData.id}`
  );

        const appointmentData =
          await appointmentResponse.json();

        if (appointmentData.success) {

          setStats((currentStats) => ({
            ...currentStats,

            appointments:
              appointmentData.appointments,
          }));

        }

      } catch (error) {

        console.log(
          'HOSPITAL STATS ERROR:',
          error
        );

      }

    } catch (error) {

      console.log(
        'HOSPITAL SESSION ERROR:',
        error
      );

      router.replace('/hospital-login');

    } finally {

      setCheckingSession(false);
      setRefreshing(false);

    }

  };

  useEffect(() => {

    loadHospital();

  }, []);

  const handleRefresh = () => {

    setRefreshing(true);

    loadHospital();

  };

  const handleLogout = async () => {

    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Logout',
          style: 'destructive',

          onPress: async () => {

            await AsyncStorage.removeItem(
              'hospitalLoggedIn'
            );

            await AsyncStorage.removeItem(
              'currentHospital'
            );

            router.replace('/role-section');

          },
        },
      ]
    );

  };

  const handleRequestReactivation =
    async () => {

      if (!hospital?.id) {

        Alert.alert(
          'Error',
          'Hospital information not found.'
        );

        return;

      }

      try {

        const response = await fetch(
  `https://qcare-tisd.onrender.com/hospital-request-reactivation/${hospital.id}`,
  {
    method: 'PUT',
  }
);

        const data =
          await response.json();

        if (!data.success) {

          Alert.alert(
            'Request Failed',
            data.message ||
              'Unable to send reactivation request.'
          );

          return;

        }

        Alert.alert(
          'Request Sent',
          'Your reactivation request has been sent to the Admin.'
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

      }

    };

  if (checkingSession) {

    return (
      <View style={styles.loadingScreen}>

        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text style={styles.loadingText}>
          Loading dashboard...
        </Text>

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

  const isActive =
    hospitalStatus === 'Active';

  return (

    <View style={styles.screen}>

      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.contentContainer
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <View style={styles.header}>

          <View style={styles.headerLeft}>

            <Text style={styles.greeting}>
              Welcome back
            </Text>

            <Text
              style={styles.hospitalName}
              numberOfLines={1}
            >
              {hospitalName}
            </Text>

          </View>

          <TouchableOpacity
            style={styles.profileCircle}
            onPress={() =>
              router.push(
                '/hospital-profile'
              )
            }
            activeOpacity={0.8}
          >

            <Text style={styles.profileText}>
              {hospitalInitial}
            </Text>

          </TouchableOpacity>

        </View>

        {/* ================================= */}
        {/* STATUS */}
        {/* ================================= */}

        <View
          style={[
            styles.statusCard,
            !isActive &&
              styles.inactiveStatusCard,
          ]}
        >

          <View
            style={[
              styles.statusIcon,
              !isActive &&
                styles.inactiveStatusIcon,
            ]}
          >

            <Text style={styles.statusIconText}>
              +
            </Text>

          </View>

          <View style={styles.statusContent}>

            <Text style={styles.statusTitle}>
              Hospital Account
            </Text>

            <View style={styles.statusRow}>

              <View
                style={[
                  styles.statusDot,
                  !isActive &&
                    styles.inactiveDot,
                ]}
              />

              <Text
                style={[
                  styles.statusText,
                  !isActive &&
                    styles.inactiveStatusText,
                ]}
              >
                {hospitalStatus}
              </Text>

            </View>

            {hospitalStatus.trim().toLowerCase() === 'deactivated' && (

              <TouchableOpacity
                style={
                  styles.reactivationButton
                }
                onPress={
                  handleRequestReactivation
                }
                activeOpacity={0.85}
              >

                <Text
                  style={
                    styles.reactivationButtonText
                  }
                >
                  Request Reactivation
                </Text>

              </TouchableOpacity>

            )}

          </View>

          <TouchableOpacity
            onPress={() =>
              router.push(
                '/hospital-profile'
              )
            }
          >

            <Text style={styles.viewText}>
              View
            </Text>

          </TouchableOpacity>

        </View>

        {/* ================================= */}
        {/* WELCOME BANNER */}
        {/* ================================= */}

        <View style={styles.heroCard}>

          <View style={styles.heroContent}>

            <Text style={styles.heroEyebrow}>
              QCARE HOSPITAL
            </Text>

            <Text style={styles.heroTitle}>
              Manage your hospital
              efficiently.
            </Text>

            <Text style={styles.heroDescription}>
              Patients, appointments and
              live queues — all in one place.
            </Text>

          </View>

          <View style={styles.heroDecoration}>

            <Text style={styles.heroPlus}>
              +
            </Text>

          </View>

        </View>

        {/* ================================= */}
        {/* TODAY'S OVERVIEW */}
        {/* ================================= */}

        <View style={styles.sectionHeader}>

          <View>

            <Text style={styles.sectionTitle}>
              Today's Overview
            </Text>

            <Text style={styles.sectionSubtitle}>
              Live hospital activity
            </Text>

          </View>

        </View>

        <View style={styles.statsGrid}>

          {/* PATIENTS */}

          <View style={styles.statCard}>

            <View
              style={[
                styles.statIcon,
                styles.blueIcon,
              ]}
            >

              <Text style={styles.statIconText}>
                P
              </Text>

            </View>

            <Text style={styles.statNumber}>
              {stats.patients}
            </Text>

            <Text style={styles.statLabel}>
              Patients
            </Text>

          </View>

          {/* WAITING */}

          <View style={styles.statCard}>

            <View
              style={[
                styles.statIcon,
                styles.orangeIcon,
              ]}
            >

              <Text style={styles.statIconText}>
                W
              </Text>

            </View>

            <Text style={styles.statNumber}>
              {stats.waiting}
            </Text>

            <Text style={styles.statLabel}>
              Waiting
            </Text>

          </View>

          {/* COMPLETED */}

          <View style={styles.statCard}>

            <View
              style={[
                styles.statIcon,
                styles.greenIcon,
              ]}
            >

              <Text style={styles.statIconText}>
                ✓
              </Text>

            </View>

            <Text style={styles.statNumber}>
              {stats.completed}
            </Text>

            <Text style={styles.statLabel}>
              Completed
            </Text>

          </View>

          {/* APPOINTMENTS */}

          <View style={styles.statCard}>

            <View
              style={[
                styles.statIcon,
                styles.purpleIcon,
              ]}
            >

              <Text style={styles.statIconText}>
                A
              </Text>

            </View>

            <Text style={styles.statNumber}>
              {stats.appointments}
            </Text>

            <Text style={styles.statLabel}>
              Appointments
            </Text>

          </View>

        </View>

        {/* ================================= */}
        {/* QUICK ACTION */}
        {/* ================================= */}

        <Text style={styles.sectionTitle}>
          Quick Action
        </Text>

        <TouchableOpacity
          style={styles.addPatientCard}
          onPress={() =>
            router.push('/add-patient')
          }
          activeOpacity={0.85}
        >

          <View style={styles.addPatientIcon}>

            <Text style={styles.addPatientPlus}>
              +
            </Text>

          </View>

          <View style={styles.addPatientContent}>

            <Text style={styles.addPatientTitle}>
              Add New Patient
            </Text>

            <Text
              style={styles.addPatientDescription}
            >
              Register a patient and generate
              a queue token.
            </Text>

          </View>

          <Text style={styles.arrow}>
            ›
          </Text>

        </TouchableOpacity>

        {/* ================================= */}
        {/* MANAGEMENT */}
        {/* ================================= */}

        <Text style={styles.sectionTitle}>
          Hospital Management
        </Text>

        {/* QUEUE */}

        <TouchableOpacity
          style={styles.managementCard}
          onPress={() =>
            router.push('/hospital-queue')
          }
          activeOpacity={0.8}
        >

          <View
            style={[
              styles.managementIcon,
              styles.queueIcon,
            ]}
          >

            <Text style={styles.managementIconText}>
              Q
            </Text>

          </View>

          <View style={styles.managementContent}>

            <Text style={styles.managementTitle}>
              Patient & Queue
            </Text>

            <Text
              style={styles.managementDescription}
            >
              Manage patients, tokens and
              live queues.
            </Text>

          </View>

          <Text style={styles.managementArrow}>
            ›
          </Text>

        </TouchableOpacity>

        {/* APPOINTMENTS */}

        <TouchableOpacity
          style={styles.managementCard}
          onPress={() =>
            router.push(
              '/hospital-appointments'
            )
          }
          activeOpacity={0.8}
        >

          <View
            style={[
              styles.managementIcon,
              styles.appointmentIcon,
            ]}
          >

            <Text style={styles.managementIconText}>
              A
            </Text>

          </View>

          <View style={styles.managementContent}>

            <Text style={styles.managementTitle}>
              Appointments
            </Text>

            <Text
              style={styles.managementDescription}
            >
              View and manage patient
              appointments.
            </Text>

          </View>

          <Text style={styles.managementArrow}>
            ›
          </Text>

        </TouchableOpacity>

        {/* NOTIFICATIONS */}

        <TouchableOpacity
          style={styles.managementCard}
          onPress={() =>
            router.push(
              '/hospital-notifications'
            )
          }
          activeOpacity={0.8}
        >

          <View
            style={[
              styles.managementIcon,
              styles.notificationIcon,
            ]}
          >

            <Text style={styles.managementIconText}>
              N
            </Text>

          </View>

          <View style={styles.managementContent}>

            <Text style={styles.managementTitle}>
              Notifications
            </Text>

            <Text
              style={styles.managementDescription}
            >
              View hospital alerts and
              important updates.
            </Text>

          </View>

          {unreadNotifications > 0 && (

            <View style={styles.notificationBadge}>

              <Text style={styles.notificationBadgeText}>
                {unreadNotifications > 99
                  ? '99+'
                  : unreadNotifications}
              </Text>

            </View>

          )}

          <Text style={styles.managementArrow}>
            ›
          </Text>

        </TouchableOpacity>

        {/* ================================= */}
        {/* LOGOUT */}
        {/* ================================= */}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >

          <Text style={styles.logoutText}>
            Log Out
          </Text>

        </TouchableOpacity>

        <Text style={styles.footer}>
          QCare • Smart Hospital Queue Management
        </Text>

      </ScrollView>

    </View>
  );
}
const styles = StyleSheet.create({

  screen: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },

  container: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 45,
  },

  loadingScreen: {
    flex: 1,
    backgroundColor: '#F5F7FB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 13,
  },

  /* HEADER */

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },

  headerLeft: {
    flex: 1,
    paddingRight: 15,
  },

  greeting: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 5,
  },

  hospitalName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
  },

  profileCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 4,
  },

  profileText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
  },

  /* STATUS */

  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  inactiveStatusCard: {
    borderColor: '#FECACA',
  },

  statusIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  inactiveStatusIcon: {
    backgroundColor: '#FEF2F2',
  },

  statusIconText: {
    color: '#2563EB',
    fontSize: 25,
    fontWeight: '800',
  },

  statusContent: {
    flex: 1,
  },

  statusTitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
    marginBottom: 4,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
    marginRight: 6,
  },

  inactiveDot: {
    backgroundColor: '#DC2626',
  },

  statusText: {
    color: '#15803D',
    fontSize: 13,
    fontWeight: '800',
  },

  inactiveStatusText: {
    color: '#DC2626',
  },

  reactivationButton: {
    marginTop: 12,
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },

  reactivationButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  viewText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '800',
  },

  /* HERO */

  heroCard: {
    backgroundColor: '#2563EB',
    borderRadius: 22,
    padding: 21,
    marginBottom: 25,
    minHeight: 145,
    overflow: 'hidden',
    flexDirection: 'row',
  },

  heroContent: {
    flex: 1,
    paddingRight: 10,
  },

  heroEyebrow: {
    color: '#BFDBFE',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 8,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
  },

  heroDescription: {
    color: '#DBEAFE',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
  },

  heroDecoration: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },

  heroPlus: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '300',
  },

  /* SECTION */

  sectionHeader: {
    marginBottom: 13,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 13,
  },

  sectionSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: -8,
    marginBottom: 13,
  },

  /* STATS */

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },

  statCard: {
    width: '48.3%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  blueIcon: {
    backgroundColor: '#EFF6FF',
  },

  orangeIcon: {
    backgroundColor: '#FFF7ED',
  },

  greenIcon: {
    backgroundColor: '#F0FDF4',
  },

  purpleIcon: {
    backgroundColor: '#F5F3FF',
  },

  statIconText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#2563EB',
  },

  statNumber: {
    fontSize: 25,
    fontWeight: '900',
    color: '#0F172A',
  },

  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },

  /* ADD PATIENT */

  addPatientCard: {
    backgroundColor: '#2563EB',
    borderRadius: 18,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },

  addPatientIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  addPatientPlus: {
    color: '#2563EB',
    fontSize: 29,
    fontWeight: '500',
  },

  addPatientContent: {
    flex: 1,
  },

  addPatientTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 4,
  },

  addPatientDescription: {
    color: '#DBEAFE',
    fontSize: 11,
    lineHeight: 17,
  },

  arrow: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    marginLeft: 8,
  },

  /* MANAGEMENT */

  managementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 11,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  managementIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  queueIcon: {
    backgroundColor: '#EFF6FF',
  },

  appointmentIcon: {
    backgroundColor: '#F5F3FF',
  },

  notificationIcon: {
    backgroundColor: '#FFF7ED',
  },

  notificationBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginRight: 8,
  },

  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  managementIconText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '900',
  },

  managementContent: {
    flex: 1,
  },

  managementTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 4,
  },

  managementDescription: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 17,
  },

  managementArrow: {
    color: '#94A3B8',
    fontSize: 25,
    fontWeight: '300',
    marginLeft: 8,
  },

  /* LOGOUT */

  logoutButton: {
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FFF7F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },

  logoutText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '800',
  },

  /* FOOTER */

  footer: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 22,
  },
});