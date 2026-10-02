import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudioPlayer } from 'expo-audio';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const API_URL = 'https://qcare-tisd.onrender.com';

export default function PatientDashboardScreen() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [patientInitial, setPatientInitial] = useState('P');
  const [hasUnreadNotification, setHasUnreadNotification] =
    useState(false);

  const lastPlayedNotificationRef = useRef('');

  const notificationPlayer = useAudioPlayer(
    require('../../assets/notification.mp3')
  );

  useEffect(() => {
    const checkSession = async () => {
      const patient =
        await AsyncStorage.getItem('currentPatient');

      if (!patient) {
        router.replace('/patient-login');
        return;
      }

      setCheckingSession(false);
    };

    checkSession();
  }, []);

  useEffect(() => {
    const loadPatientName = async () => {
      const storedPatient =
        await AsyncStorage.getItem('currentPatient');

      if (storedPatient) {
        const patient = JSON.parse(storedPatient);

        if (patient.name) {
          setPatientInitial(
            patient.name.trim().charAt(0).toUpperCase()
          );
        }
      }
    };

    loadPatientName();
  }, []);

  useFocusEffect(
  useCallback(() => {
    const checkNotification = async () => {
      try {
        const storedPatient =
          await AsyncStorage.getItem('currentPatient');

        if (!storedPatient) {
          setHasUnreadNotification(false);
          return;
        }

        const patient = JSON.parse(storedPatient);

        const response = await fetch(
  `${API_URL}/patient-notifications/${patient.id}?t=${Date.now()}`,
  {
    method: 'GET',
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
  }
);
        const data = await response.json();
        console.log(
  'DASHBOARD NOTIFICATIONS:',
  data.notifications
);

        if (
          !data.success ||
          !data.notifications ||
          data.notifications.length === 0
        ) {
          setHasUnreadNotification(false);
          return;
        }

        // Latest notification from MySQL
        const latestNotification =
          data.notifications[0];

          
        // MySQL is the single source of truth
        const isUnread =
          Number(latestNotification.is_read) === 0;

        if (isUnread) {
          setHasUnreadNotification(true);

          const notificationKey =
            String(latestNotification.id);

          // Play sound only once for this notification
          if (
            lastPlayedNotificationRef.current !==
            notificationKey
          ) {
            lastPlayedNotificationRef.current =
              notificationKey;

            notificationPlayer.seekTo(0);
            notificationPlayer.play();
          }
        } else {
          // Already viewed
          setHasUnreadNotification(false);
        }

      } catch (error) {
        console.log(
          'PATIENT NOTIFICATION CHECK ERROR:',
          error
        );
      }
    };

    checkNotification();
  }, [notificationPlayer])
);

  if (checkingSession) {
    return null;
  }

  const handleLogout = async () => {
    await AsyncStorage.removeItem('currentPatient');
    await AsyncStorage.removeItem('currentToken');

    router.replace('/role-section');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.smallText}>
            Welcome back
          </Text>

          <Text style={styles.title}>
            QCare
          </Text>
        </View>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={() =>
            router.push('/patient-profile')
          }
        >
          <Text style={styles.profileText}>
            {patientInitial}
          </Text>
        </TouchableOpacity>
      </View>

      {/* WELCOME CARD */}
      <View style={styles.welcomeCard}>
        <View style={styles.welcomeBadge}>
          <Text style={styles.welcomeBadgeText}>
            PATIENT
          </Text>
        </View>

        <Text style={styles.welcomeTitle}>
          Patient Dashboard
        </Text>

        <Text style={styles.welcomeText}>
          Manage your appointments, track your queue,
          and stay updated with QCare.
        </Text>
      </View>

      {/* QUICK ACTIONS */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Quick Actions
        </Text>

        <Text style={styles.sectionSubtitle}>
          Everything you need in one place
        </Text>
      </View>

      {/* BOOK APPOINTMENT */}
      <TouchableOpacity
        style={styles.actionCard}
        onPress={() =>
          router.push('/booking')
        }
        activeOpacity={0.8}
      >
        <View style={styles.iconBox}>
          <Text style={styles.actionIcon}>
            📅
          </Text>
        </View>

        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>
            Book Appointment
          </Text>

          <Text style={styles.actionText}>
            Find a hospital and book your token.
          </Text>
        </View>

        <Text style={styles.arrow}>
          ›
        </Text>
      </TouchableOpacity>

      {/* MY QUEUE */}
      <TouchableOpacity
        style={styles.actionCard}
        onPress={() =>
          router.push('/my-queue')
        }
        activeOpacity={0.8}
      >
        <View style={styles.iconBox}>
          <Text style={styles.actionIcon}>
            🎟️
          </Text>
        </View>

        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>
            My Queue
          </Text>

          <Text style={styles.actionText}>
            Check your current token and waiting status.
          </Text>
        </View>

        <Text style={styles.arrow}>
          ›
        </Text>
      </TouchableOpacity>

      {/* APPOINTMENT HISTORY */}
      <TouchableOpacity
        style={styles.actionCard}
        onPress={() =>
          router.push('/appointment-history')
        }
        activeOpacity={0.8}
      >
        <View style={styles.iconBox}>
          <Text style={styles.actionIcon}>
            📋
          </Text>
        </View>

        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>
            Appointment History
          </Text>

          <Text style={styles.actionText}>
            View your previous appointments.
          </Text>
        </View>

        <Text style={styles.arrow}>
          ›
        </Text>
      </TouchableOpacity>

      {/* NOTIFICATIONS */}
      <TouchableOpacity
        style={styles.actionCard}
        onPress={() =>
          router.push('/notifications')
        }
        activeOpacity={0.8}
      >
        <View style={styles.iconBox}>
          <Text style={styles.actionIcon}>
            🔔
          </Text>

          {hasUnreadNotification && (
            <View style={styles.notificationBadge}>
              <Text
                style={styles.notificationBadgeText}
              >
                1
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>
            Notifications
          </Text>

          <Text style={styles.actionText}>
            View updates about your appointment and queue.
          </Text>
        </View>

        <Text style={styles.arrow}>
          ›
        </Text>
      </TouchableOpacity>

      {/* PROFILE */}
      <TouchableOpacity
        style={styles.actionCard}
        onPress={() =>
          router.push('/patient-profile')
        }
        activeOpacity={0.8}
      >
        <View style={styles.iconBox}>
          <Text style={styles.actionIcon}>
            👤
          </Text>
        </View>

        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>
            My Profile
          </Text>

          <Text style={styles.actionText}>
            View and manage your patient details.
          </Text>
        </View>

        <Text style={styles.arrow}>
          ›
        </Text>
      </TouchableOpacity>

      {/* INFO CARD */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>
          QCare Smart Queue
        </Text>

        <Text style={styles.infoText}>
          Spend less time waiting. Track your hospital
          queue and appointment status from one place.
        </Text>
      </View>

      {/* LOGOUT */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Text style={styles.logoutText}>
          Logout
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
    paddingHorizontal: 20,
  },

  contentContainer: {
    paddingTop: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },

  smallText: {
    fontSize: 13,
    color: '#7A8491',
    marginBottom: 3,
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1769AA',
  },

  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1769AA',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },

  profileText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },

  welcomeCard: {
    backgroundColor: '#1769AA',
    borderRadius: 20,
    padding: 22,
    marginBottom: 28,
    elevation: 4,
  },

  welcomeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
  },

  welcomeBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1769AA',
    letterSpacing: 1,
  },

  welcomeTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  welcomeText: {
    color: '#EAF4FF',
    fontSize: 14,
    lineHeight: 21,
  },

  sectionHeader: {
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#263238',
  },

  sectionSubtitle: {
    fontSize: 12,
    color: '#8A949E',
    marginTop: 4,
  },

  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EAF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    position: 'relative',
  },

  actionIcon: {
    fontSize: 24,
  },

  notificationBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#D32F2F',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    elevation: 3,
  },

  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },

  actionContent: {
    flex: 1,
  },

  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#263238',
    marginBottom: 4,
  },

  actionText: {
    fontSize: 12,
    color: '#7A8491',
    lineHeight: 18,
  },

  arrow: {
    fontSize: 28,
    color: '#1769AA',
    marginLeft: 8,
  },

  infoCard: {
    backgroundColor: '#EAF4FF',
    borderRadius: 16,
    padding: 18,
    marginTop: 10,
    marginBottom: 20,
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1769AA',
    marginBottom: 7,
  },

  infoText: {
    fontSize: 13,
    color: '#59636E',
    lineHeight: 20,
  },

  logoutButton: {
    backgroundColor: '#D32F2F',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },

  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});