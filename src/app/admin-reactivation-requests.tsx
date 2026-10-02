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

const API_URL = 'https://qcare-tisd.onrender.com';

type RequestItem = {
  id: number;
  hospital_id: number;
  hospital_code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  requested_at: string;
};

export default function AdminReactivationRequests() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRequests = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/admin/reactivation-requests`
      );

      const data = await response.json();

      if (!data.success) {
        Alert.alert(
          'Error',
          'Unable to load reactivation requests.'
        );
        return;
      }

      setRequests(data.requests || []);
    } catch (error) {
      console.log(
        'REACTIVATION REQUEST LOAD ERROR:',
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
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  const approveRequest = (item: RequestItem) => {
    Alert.alert(
      'Approve Reactivation',
      `Reactivate ${item.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              const response = await fetch(
                `${API_URL}/admin/approve-reactivation/${item.id}`,
                {
                  method: 'PUT',
                }
              );

              const data = await response.json();

              if (!data.success) {
                Alert.alert(
                  'Error',
                  data.message ||
                    'Unable to approve request.'
                );
                return;
              }

              Alert.alert(
                'Approved',
                `${item.name} has been reactivated.`
              );

              loadRequests();
            } catch (error) {
              console.log(
                'APPROVE REACTIVATION ERROR:',
                error
              );

              Alert.alert(
                'Connection Error',
                'Unable to connect to QCare server.'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            Reactivation Requests
          </Text>

          <Text style={styles.headerSubtitle}>
            Review hospitals requesting account reactivation
          </Text>
        </View>

        <View style={styles.headerCount}>
          <Text style={styles.headerCountNumber}>
            {requests.length}
          </Text>

          <Text style={styles.headerCountLabel}>
            Pending
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <View style={styles.loadingCircle}>
            <ActivityIndicator
              size="large"
              color="#2563EB"
            />
          </View>

          <Text style={styles.loadingTitle}>
            Loading requests
          </Text>

          <Text style={styles.loadingText}>
            Please wait...
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2563EB"
            />
          }
        >

          {/* INFO BAR */}
          {requests.length > 0 && (
            <View style={styles.infoBar}>
              <View style={styles.infoIcon}>
                <Text style={styles.infoIconText}>
                  !
                </Text>
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>
                  Review required
                </Text>

                <Text style={styles.infoText}>
                  These hospitals are waiting for Admin approval before becoming active again.
                </Text>
              </View>
            </View>
          )}

          {/* EMPTY STATE */}
          {requests.length === 0 ? (
            <View style={styles.emptyCard}>

              <View style={styles.emptyIconCircle}>
                <Text style={styles.emptyIcon}>
                  ✓
                </Text>
              </View>

              <Text style={styles.emptyTitle}>
                No Reactivation Requests
              </Text>

              <Text style={styles.emptyText}>
                There are currently no pending hospital reactivation requests.
              </Text>

              <TouchableOpacity
                style={styles.refreshButton}
                onPress={loadRequests}
                activeOpacity={0.85}
              >
                <Text style={styles.refreshButtonText}>
                  Refresh
                </Text>
              </TouchableOpacity>

            </View>
          ) : (
            requests.map((item) => (
              <View
                key={item.id}
                style={styles.requestCard}
              >

                {/* CARD HEADER */}
                <View style={styles.topRow}>

                  <View style={styles.hospitalIcon}>
                    <Text style={styles.iconText}>
                      H
                    </Text>
                  </View>

                  <View style={styles.nameContainer}>
                    <Text
                      style={styles.hospitalName}
                      numberOfLines={2}
                    >
                      {item.name}
                    </Text>

                    <Text style={styles.hospitalCode}>
                      Hospital ID • {item.hospital_code}
                    </Text>
                  </View>

                  <View style={styles.pendingBadge}>
                    <View style={styles.pendingDot} />

                    <Text style={styles.pendingText}>
                      Pending
                    </Text>
                  </View>

                </View>

                <View style={styles.divider} />

                {/* DETAILS */}
                <View style={styles.details}>

                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <Text style={styles.detailIconText}>
                        @
                      </Text>
                    </View>

                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>
                        Email
                      </Text>

                      <Text
                        style={styles.detailValue}
                        numberOfLines={1}
                      >
                        {item.email}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <Text style={styles.detailIconText}>
                        T
                      </Text>
                    </View>

                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>
                        Phone
                      </Text>

                      <Text style={styles.detailValue}>
                        {item.phone}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <Text style={styles.detailIconText}>
                        A
                      </Text>
                    </View>

                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>
                        Address
                      </Text>

                      <Text style={styles.detailValue}>
                        {item.address}
                      </Text>
                    </View>
                  </View>

                </View>

                {/* REQUEST DATE */}
                <View style={styles.requestInfo}>
                  <Text style={styles.requestInfoLabel}>
                    REACTIVATION REQUEST
                  </Text>

                  <Text style={styles.requestInfoValue}>
                    {item.requested_at
                      ? new Date(
                          item.requested_at
                        ).toLocaleDateString()
                      : 'Recently requested'}
                  </Text>
                </View>

                {/* APPROVE BUTTON */}
                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={() =>
                    approveRequest(item)
                  }
                  activeOpacity={0.85}
                >
                  <Text style={styles.approveIcon}>
                    ✓
                  </Text>

                  <Text style={styles.approveText}>
                    Approve Reactivation
                  </Text>
                </TouchableOpacity>

              </View>
            ))
          )}

          <View style={styles.bottomSpace} />

        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },

  header: {
    backgroundColor: '#2563EB',
    paddingTop: 55,
    paddingBottom: 22,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerContent: {
    flex: 1,
    paddingRight: 10,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '900',
  },

  headerSubtitle: {
    color: '#DBEAFE',
    fontSize: 13,
    marginTop: 5,
    lineHeight: 18,
  },

  headerCount: {
    minWidth: 62,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },

  headerCountNumber: {
    fontSize: 19,
    fontWeight: '900',
    color: '#2563EB',
  },

  headerCountLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 80,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingTitle: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },

  loadingText: {
    marginTop: 4,
    color: '#64748B',
    fontSize: 13,
  },

  infoBar: {
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 13,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },

  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  infoIconText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    color: '#92400E',
    fontSize: 13,
    fontWeight: '800',
  },

  infoText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },

  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5EAF2',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 7,
    elevation: 3,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  hospitalIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconText: {
    color: '#2563EB',
    fontSize: 20,
    fontWeight: '900',
  },

  nameContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  hospitalName: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
    color: '#0F172A',
  },

  hospitalCode: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '600',
  },

  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },

  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    marginRight: 5,
  },

  pendingText: {
    color: '#92400E',
    fontSize: 10,
    fontWeight: '800',
  },

  divider: {
    height: 1,
    backgroundColor: '#EEF2F7',
    marginTop: 16,
    marginBottom: 14,
  },

  details: {
    gap: 11,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  detailIconText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#64748B',
  },

  detailContent: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
  },

  detailValue: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
    marginTop: 2,
  },

  requestInfo: {
    marginTop: 16,
    padding: 11,
    borderRadius: 11,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  requestInfoLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '800',
  },

  requestInfoValue: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
  },

  approveButton: {
    height: 46,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    flexDirection: 'row',
  },

  approveIcon: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    marginRight: 7,
  },

  approveText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingVertical: 35,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E5EAF2',
  },

  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  emptyIcon: {
    fontSize: 28,
    color: '#16A34A',
    fontWeight: '900',
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0F172A',
  },

  emptyText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 7,
  },

  refreshButton: {
    marginTop: 18,
    paddingHorizontal: 24,
    height: 42,
    borderRadius: 11,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  refreshButtonText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '800',
  },

  bottomSpace: {
    height: 20,
  },
});