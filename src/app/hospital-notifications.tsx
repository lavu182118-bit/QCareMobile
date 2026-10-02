import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

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

type NotificationItem = {
  id: number;
  hospital_id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean | number;
  created_at: string;
};

export default function HospitalNotificationsScreen() {
  const [notifications, setNotifications] = useState<
    NotificationItem[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const storedHospital =
        await AsyncStorage.getItem('currentHospital');

      if (!storedHospital) {
        router.replace('/hospital-login');
        return;
      }

      const hospital = JSON.parse(storedHospital);

      if (!hospital?.id) {
        Alert.alert(
          'Error',
          'Hospital information is not available.'
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/hospital-notifications/${hospital.id}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        Alert.alert(
          'Error',
          data.message ||
            'Unable to load notifications.'
        );
        return;
      }

      setNotifications(data.notifications || []);
    } catch (error) {
      console.log(
        'HOSPITAL NOTIFICATIONS ERROR:',
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
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const markAsRead = async (
    notification: NotificationItem
  ) => {
    const alreadyRead =
      notification.is_read === true ||
      notification.is_read === 1;

    if (alreadyRead) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/hospital-notifications/read/${notification.id}`,
        {
          method: 'PUT',
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        Alert.alert(
          'Error',
          data.message ||
            'Unable to update notification.'
        );
        return;
      }

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? { ...item, is_read: true }
            : item
        )
      );
    } catch (error) {
      console.log(
        'MARK NOTIFICATION ERROR:',
        error
      );

      Alert.alert(
        'Connection Error',
        'Unable to connect to QCare server.'
      );
    }
  };

  const markAllAsRead = async () => {
    if (notifications.length === 0) {
      return;
    }

    try {
      setMarkingAll(true);

      const storedHospital =
        await AsyncStorage.getItem('currentHospital');

      if (!storedHospital) {
        router.replace('/hospital-login');
        return;
      }

      const hospital = JSON.parse(storedHospital);

      if (!hospital?.id) {
        Alert.alert(
          'Error',
          'Hospital information is not available.'
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/hospital-notifications/read-all/${hospital.id}`,
        {
          method: 'PUT',
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        Alert.alert(
          'Error',
          data.message ||
            'Unable to update notifications.'
        );
        return;
      }

      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          is_read: true,
        }))
      );
    } catch (error) {
      console.log(
        'MARK ALL NOTIFICATIONS ERROR:',
        error
      );

      Alert.alert(
        'Connection Error',
        'Unable to connect to QCare server.'
      );
    } finally {
      setMarkingAll(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'appointment':
        return '📅';

      case 'queue':
        return '🎫';

      case 'admin':
        return '🏥';

      case 'consultation':
        return '✅';

      default:
        return '🔔';
    }
  };

  const getTimeText = (createdAt: string) => {
    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleString([], {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const unreadCount = notifications.filter(
    (item) =>
      item.is_read === false ||
      item.is_read === 0
  ).length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text style={styles.loadingText}>
          Loading notifications...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        contentContainerStyle={styles.container}
      >

        {/* HEADER */}

        <View style={styles.header}>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>
              ‹
            </Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>

            <Text style={styles.headerTitle}>
              Notifications
            </Text>

            <Text style={styles.headerSubtitle}>
              Stay updated with your hospital
            </Text>

          </View>

          <View style={styles.headerSpace} />

        </View>

        {/* SUMMARY */}

        <View style={styles.summaryCard}>

          <View style={styles.notificationIcon}>
            <Text style={styles.notificationIconText}>
              🔔
            </Text>
          </View>

          <View style={styles.summaryText}>

            <Text style={styles.summaryTitle}>
              Hospital Updates
            </Text>

            <Text style={styles.summaryDescription}>
              {unreadCount > 0
                ? `${unreadCount} unread notification${
                    unreadCount === 1 ? '' : 's'
                  }`
                : 'You are all caught up'}
            </Text>

          </View>

          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {unreadCount}
              </Text>
            </View>
          )}

        </View>

        {/* SECTION HEADER */}

        <View style={styles.sectionHeader}>

          <View>
            <Text style={styles.sectionTitle}>
              Recent Notifications
            </Text>

            <Text style={styles.sectionSubtitle}>
              Your latest hospital updates
            </Text>
          </View>

          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={markAllAsRead}
              disabled={markingAll}
            >
              <Text style={styles.markAllText}>
                {markingAll
                  ? 'Updating...'
                  : 'Mark all read'}
              </Text>
            </TouchableOpacity>
          )}

        </View>

        {/* EMPTY STATE */}

        {notifications.length === 0 ? (
          <View style={styles.emptyCard}>

            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>
                🔔
              </Text>
            </View>

            <Text style={styles.emptyTitle}>
              No notifications yet
            </Text>

            <Text style={styles.emptyDescription}>
              New hospital updates and activity
              notifications will appear here.
            </Text>

          </View>
        ) : (
          <View style={styles.notificationList}>

            {notifications.map((notification) => {
              const isUnread =
                notification.is_read === false ||
                notification.is_read === 0;

              return (
                <TouchableOpacity
                  key={notification.id}
                  activeOpacity={0.8}
                  onPress={() =>
                    markAsRead(notification)
                  }
                  style={[
                    styles.notificationCard,
                    isUnread &&
                      styles.unreadNotificationCard,
                  ]}
                >

                  <View
                    style={[
                      styles.typeIcon,
                      isUnread &&
                        styles.unreadTypeIcon,
                    ]}
                  >
                    <Text style={styles.typeIconText}>
                      {getNotificationIcon(
                        notification.type
                      )}
                    </Text>
                  </View>

                  <View style={styles.notificationContent}>

                    <View style={styles.titleRow}>

                      <Text
                        style={[
                          styles.notificationTitle,
                          isUnread &&
                            styles.unreadTitle,
                        ]}
                        numberOfLines={1}
                      >
                        {notification.title}
                      </Text>

                      {isUnread && (
                        <View style={styles.unreadDot} />
                      )}

                    </View>

                    <Text
                      style={styles.notificationMessage}
                    >
                      {notification.message}
                    </Text>

                    <Text style={styles.notificationTime}>
                      {getTimeText(
                        notification.created_at
                      )}
                    </Text>

                  </View>

                </TouchableOpacity>
              );
            })}

          </View>
        )}

        {/* FOOTER */}

        <Text style={styles.footer}>
          © QCare • Smart Hospital Queue Management
        </Text>

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F4F7FB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#6B7280',
  },

  /* HEADER */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
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

  /* SUMMARY */

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8ECF2',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    marginBottom: 26,
  },

  notificationIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#E8F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationIconText: {
    fontSize: 25,
  },

  summaryText: {
    flex: 1,
    marginLeft: 14,
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },

  summaryDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },

  unreadBadge: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  /* SECTION */

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },

  sectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
  },

  markAllText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '800',
  },

  /* NOTIFICATIONS */

  notificationList: {
    gap: 12,
  },

  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E8ECF2',
    elevation: 1,
  },

  unreadNotificationCard: {
    borderColor: '#CFE0FF',
    backgroundColor: '#F8FBFF',
  },

  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#F1F3F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  unreadTypeIcon: {
    backgroundColor: '#E8F0FF',
  },

  typeIconText: {
    fontSize: 21,
  },

  notificationContent: {
    flex: 1,
    marginLeft: 13,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  notificationTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },

  unreadTitle: {
    color: '#111827',
    fontWeight: '800',
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginLeft: 8,
  },

  notificationMessage: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
    marginTop: 5,
  },

  notificationTime: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 8,
  },

  /* EMPTY */

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8ECF2',
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  emptyIconText: {
    fontSize: 28,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },

  emptyDescription: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    color: '#6B7280',
    marginTop: 7,
  },

  footer: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 26,
  },
});