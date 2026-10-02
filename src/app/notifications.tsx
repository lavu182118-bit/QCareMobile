import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const API_URL = 'https://qcare-tisd.onrender.com';

type NotificationData = {
  id: number;
  patient_id: number;
  token: string;
  title: string;
  message: string;
  type: string;
  is_read: number;
  created_at: string;
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] =
    useState<NotificationData[]>([]);

  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const storedPatient =
        await AsyncStorage.getItem('currentPatient');

      if (!storedPatient) {
        setLoading(false);
        return;
      }

      const patient = JSON.parse(storedPatient);

      const response = await fetch(
        `${API_URL}/patient-notifications/${patient.id}`
      );

      const data = await response.json();

      if (data.success && data.notifications) {
        setNotifications(data.notifications);

        if (data.notifications.length > 0) {

  for (const notification of data.notifications) {

    try {
      await fetch(
        `${API_URL}/patient-notifications/${notification.id}/read`,
        {
          method: 'PUT',
        }
      );
    } catch (error) {
      console.log(
        'MARK NOTIFICATION READ ERROR:',
        error
      );
    }

  }

}
        // Keep existing read system
        if (data.notifications.length > 0) {
          const latest = data.notifications[0];

          const notificationCreatedAt =
  latest.created_at || '';

const readKey =
  `patientNotificationRead_${latest.token}_${notificationCreatedAt}`;

await AsyncStorage.setItem(
  readKey,
  'true'
);

// Also store the ISO version used by Dashboard
try {
  const isoCreatedAt =
    new Date(notificationCreatedAt).toISOString();

  const isoReadKey =
    `patientNotificationRead_${latest.token}_${isoCreatedAt}`;

  await AsyncStorage.setItem(
    isoReadKey,
    'true'
  );
} catch (error) {
  console.log(
    'READ KEY FORMAT ERROR:',
    error
  );
}
        }
      }
    } catch (error) {
      console.log(
        'NOTIFICATION HISTORY LOAD ERROR:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>

        <View style={styles.loadingCircle}>
          <Text style={styles.loadingBell}>
            🔔
          </Text>
        </View>

        <ActivityIndicator
          size="small"
          color="#1769AA"
        />

        <Text style={styles.loadingText}>
          Loading your notifications...
        </Text>

      </View>
    );
  }

  return (
    <View style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* HEADER */}

        <View style={styles.header}>

          <View style={styles.headerRow}>

            <View style={styles.headerTextArea}>

              <Text style={styles.brand}>
                QCARE
              </Text>

              <Text style={styles.title}>
                Notifications
              </Text>

              <Text style={styles.subtitle}>
                Important updates about your
                appointments and consultations.
              </Text>

            </View>

            <View style={styles.headerIconBox}>
              <Text style={styles.headerIcon}>
                🔔
              </Text>

              {notifications.length > 0 && (
                <View style={styles.headerDot} />
              )}
            </View>

          </View>

        </View>


        {/* SUMMARY CARD */}

        {notifications.length > 0 && (
          <View style={styles.summaryCard}>

            <View style={styles.summaryIcon}>
              <Text style={styles.summaryIconText}>
                ✓
              </Text>
            </View>

            <View style={styles.summaryText}>
              <Text style={styles.summaryTitle}>
                You're up to date
              </Text>

              <Text style={styles.summarySubtitle}>
                {notifications.length} notification
                {notifications.length > 1 ? 's' : ''} in your history
              </Text>
            </View>

            <View style={styles.summaryCount}>
              <Text style={styles.summaryCountText}>
                {notifications.length}
              </Text>
            </View>

          </View>
        )}


        {/* SECTION TITLE */}

        {notifications.length > 0 && (
          <View style={styles.sectionHeader}>

            <View>
              <Text style={styles.sectionTitle}>
                Recent Activity
              </Text>

              <Text style={styles.sectionSubtitle}>
                Your latest QCare updates
              </Text>
            </View>

          </View>
        )}


        {/* NOTIFICATIONS */}

        {notifications.length > 0 ? (

          notifications.map((item, index) => {

            const isConsultation =
              item.type === 'consultation';

            return (
              <View
                key={item.id}
                style={[
                  styles.notificationCard,
                  index === 0 && styles.latestCard,
                ]}
              >

                {/* TOP LABEL */}

                {index === 0 && (
                  <View style={styles.latestLabel}>

                    <View style={styles.latestLabelDot} />

                    <Text style={styles.latestLabelText}>
                      LATEST UPDATE
                    </Text>

                  </View>
                )}


                {/* ICON + TITLE */}

                <View style={styles.cardHeader}>

                  <View
                    style={[
                      styles.notificationIcon,
                      isConsultation
                        ? styles.consultationIcon
                        : styles.bookingIcon,
                    ]}
                  >
                    <Text style={styles.notificationIconText}>
                      {isConsultation ? '✓' : '＋'}
                    </Text>
                  </View>


                  <View style={styles.cardTitleContainer}>

                    <Text style={styles.notificationTitle}>
                      {item.title}
                    </Text>

                    <View style={styles.tokenPill}>
                      <Text style={styles.tokenLabel}>
                        TOKEN
                      </Text>

                      <Text style={styles.tokenValue}>
                        {item.token}
                      </Text>
                    </View>

                  </View>

                </View>


                {/* MESSAGE */}

                <View
                  style={[
                    styles.messageContainer,
                    isConsultation
                      ? styles.completedMessage
                      : styles.bookingMessage,
                  ]}
                >

                  <Text style={styles.messageText}>
                    {item.message}
                  </Text>

                </View>


                {/* FOOTER */}

                <View style={styles.cardFooter}>

                  <View style={styles.timeContainer}>

                    <Text style={styles.timeIcon}>
                      ◷
                    </Text>

                    <Text style={styles.timeText}>
                      {item.created_at}
                    </Text>

                  </View>

                  <View
                    style={[
                      styles.statusPill,
                      isConsultation
                        ? styles.completedStatus
                        : styles.bookingStatus,
                    ]}
                  >

                    <Text
                      style={[
                        styles.statusText,
                        isConsultation
                          ? styles.completedStatusText
                          : styles.bookingStatusText,
                      ]}
                    >
                      {isConsultation
                        ? 'COMPLETED'
                        : 'BOOKED'}
                    </Text>

                  </View>

                </View>

              </View>
            );
          })

        ) : (

          /* EMPTY STATE */

          <View style={styles.emptyCard}>

            <View style={styles.emptyIconCircle}>
              <Text style={styles.emptyBell}>
                🔔
              </Text>
            </View>

            <Text style={styles.emptyTitle}>
              No Notifications Yet
            </Text>

            <Text style={styles.emptyDescription}>
              Your appointment bookings and
              consultation updates will appear
              here automatically.
            </Text>

            <View style={styles.emptyInfo}>

              <View style={styles.emptyInfoDot} />

              <Text style={styles.emptyInfoText}>
                We'll keep you updated
              </Text>

            </View>

          </View>

        )}

      </ScrollView>

    </View>
  );
}
const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F4F8FC',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 45,
  },

  /* LOADING */

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F4F8FC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  loadingCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#E8F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },

  loadingBell: {
    fontSize: 28,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#667085',
  },

  /* HEADER */

  header: {
    marginBottom: 22,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  headerTextArea: {
    flex: 1,
    paddingRight: 15,
  },

  brand: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2.5,
    color: '#1769AA',
    marginBottom: 6,
  },

  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#142B4A',
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: '#7A8798',
    marginTop: 8,
  },

  headerIconBox: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    position: 'relative',
  },

  headerIcon: {
    fontSize: 25,
  },

  headerDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#D32F2F',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  /* SUMMARY */

  summaryCard: {
    backgroundColor: '#1769AA',
    borderRadius: 22,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 27,
    elevation: 5,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  summaryIcon: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  summaryIconText: {
    fontSize: 21,
    fontWeight: '900',
    color: '#1769AA',
  },

  summaryText: {
    flex: 1,
  },

  summaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  summarySubtitle: {
    fontSize: 11,
    color: '#DCEEFF',
    marginTop: 4,
  },

  summaryCount: {
    minWidth: 38,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 9,
  },

  summaryCountText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  /* SECTION */

  sectionHeader: {
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#172B4D',
  },

  sectionSubtitle: {
    fontSize: 12,
    color: '#8A94A6',
    marginTop: 4,
  },

  /* CARD */

  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 23,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  latestCard: {
    borderWidth: 1,
    borderColor: '#CFE5F8',
  },

  latestLabel: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF7FF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 15,
  },

  latestLabelDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#1769AA',
    marginRight: 6,
  },

  latestLabelText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#1769AA',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  notificationIcon: {
    width: 53,
    height: 53,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  bookingIcon: {
    backgroundColor: '#EAF4FF',
  },

  consultationIcon: {
    backgroundColor: '#EAF8F0',
  },

  notificationIconText: {
    fontSize: 23,
    fontWeight: '900',
    color: '#1769AA',
  },

  cardTitleContainer: {
    flex: 1,
  },

  notificationTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#172B4D',
    marginBottom: 7,
  },

  tokenPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F5F9',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 9,
  },

  tokenLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#98A2B3',
    letterSpacing: 0.8,
    marginRight: 5,
  },

  tokenValue: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1769AA',
  },

  /* MESSAGE */

  messageContainer: {
    borderRadius: 16,
    padding: 14,
    marginTop: 17,
    borderWidth: 1,
  },

  bookingMessage: {
    backgroundColor: '#F7FBFF',
    borderColor: '#E2F0FC',
  },

  completedMessage: {
    backgroundColor: '#F6FCF8',
    borderColor: '#DCEFE4',
  },

  messageText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#475467',
  },

  /* FOOTER */

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },

  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  timeIcon: {
    fontSize: 18,
    color: '#8A94A6',
    marginRight: 6,
  },

  timeText: {
    fontSize: 10,
    color: '#8A94A6',
    flex: 1,
  },

  statusPill: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 9,
  },

  bookingStatus: {
    backgroundColor: '#EAF4FF',
  },

  completedStatus: {
    backgroundColor: '#EAF8F0',
  },

  statusText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  bookingStatusText: {
    color: '#1769AA',
  },

  completedStatusText: {
    color: '#198754',
  },

  /* EMPTY STATE */

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 28,
    paddingVertical: 45,
    alignItems: 'center',
    elevation: 3,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  emptyIconCircle: {
    width: 82,
    height: 82,
    borderRadius: 29,
    backgroundColor: '#EAF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  emptyBell: {
    fontSize: 34,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#172B4D',
    marginBottom: 9,
  },

  emptyDescription: {
    fontSize: 13,
    lineHeight: 21,
    color: '#8A94A6',
    textAlign: 'center',
    maxWidth: 290,
  },

  emptyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F9FD',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 20,
  },

  emptyInfoDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#1769AA',
    marginRight: 7,
  },

  emptyInfoText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#667085',
  },

});