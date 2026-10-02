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

type Hospital = {
  id: number;
  hospital_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  created_at: string;
};

export default function AdminPendingHospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHospitals = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/admin/hospitals`
      );

      const data = await response.json();

      if (!data.success) {
        Alert.alert(
          'Error',
          'Unable to load hospitals.'
        );
        return;
      }

      const pendingHospitals =
        data.hospitals.filter(
          (hospital: Hospital) =>
            hospital.status === 'Pending'
        );

      setHospitals(pendingHospitals);
    } catch (error) {
      console.log(
        'ADMIN HOSPITAL LOAD ERROR:',
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
    loadHospitals();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadHospitals();
  };

  const approveHospital = async (
    hospital: Hospital
  ) => {
    Alert.alert(
      'Approve Hospital',
      `Approve ${hospital.name}?`,
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
                `${API_URL}/admin/approve-hospital/${hospital.id}`,
                {
                  method: 'PUT',
                }
              );

              const data =
                await response.json();

              if (!data.success) {
                Alert.alert(
                  'Error',
                  data.message ||
                    'Unable to approve hospital.'
                );
                return;
              }

              Alert.alert(
                'Approved',
                `${hospital.name} has been approved.`
              );

              loadHospitals();
            } catch (error) {
              console.log(
                'APPROVE HOSPITAL ERROR:',
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

  const rejectHospital = async (
    hospital: Hospital
  ) => {
    Alert.alert(
      'Reject Hospital',
      `Reject ${hospital.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `${API_URL}/admin/reject-hospital/${hospital.id}`,
                {
                  method: 'PUT',
                }
              );

              const data =
                await response.json();

              if (!data.success) {
                Alert.alert(
                  'Error',
                  data.message ||
                    'Unable to reject hospital.'
                );
                return;
              }

              Alert.alert(
                'Rejected',
                `${hospital.name} has been rejected.`
              );

              loadHospitals();
            } catch (error) {
              console.log(
                'REJECT HOSPITAL ERROR:',
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
        <View>
          <Text style={styles.headerTitle}>
            Pending Hospitals
          </Text>

          <Text style={styles.headerSubtitle}>
            Review and approve hospital registrations
          </Text>
        </View>

        <View style={styles.headerCount}>
          <Text style={styles.headerCountNumber}>
            {hospitals.length}
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
            Loading hospitals
          </Text>

          <Text style={styles.loadingText}>
            Please wait...
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2563EB"
            />
          }
        >

          {/* PAGE INTRO */}
          {hospitals.length > 0 && (
            <View style={styles.infoBar}>
              <View style={styles.infoIcon}>
                <Text style={styles.infoIconText}>
                  !
                </Text>
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>
                  Action required
                </Text>

                <Text style={styles.infoText}>
                  Review the details before approving a hospital.
                </Text>
              </View>
            </View>
          )}

          {/* EMPTY STATE */}
          {hospitals.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <Text style={styles.emptyIcon}>
                  ✓
                </Text>
              </View>

              <Text style={styles.emptyTitle}>
                No Pending Hospitals
              </Text>

              <Text style={styles.emptyText}>
                There are no hospitals waiting for approval right now.
              </Text>

              <TouchableOpacity
                style={styles.refreshButton}
                onPress={loadHospitals}
                activeOpacity={0.85}
              >
                <Text style={styles.refreshButtonText}>
                  Refresh
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            hospitals.map((hospital) => (
              <View
                key={hospital.id}
                style={styles.hospitalCard}
              >

                {/* CARD HEADER */}
                <View style={styles.topRow}>

                  <View style={styles.hospitalIcon}>
                    <Text style={styles.hospitalIconText}>
                      H
                    </Text>
                  </View>

                  <View style={styles.nameContainer}>
                    <Text
                      style={styles.hospitalName}
                      numberOfLines={2}
                    >
                      {hospital.name}
                    </Text>

                    <Text style={styles.hospitalCode}>
                      Hospital ID • {hospital.hospital_id}
                    </Text>
                  </View>

                  <View style={styles.pendingBadge}>
                    <View style={styles.pendingDot} />

                    <Text style={styles.pendingText}>
                      Pending
                    </Text>
                  </View>
                </View>

                {/* DIVIDER */}
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
                        {hospital.email}
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
                        {hospital.phone}
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
                        {hospital.address}
                      </Text>
                    </View>
                  </View>

                </View>

                {/* ACTION BUTTONS */}
                <View style={styles.buttonRow}>

                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() =>
                      rejectHospital(hospital)
                    }
                    activeOpacity={0.85}
                  >
                    <Text style={styles.rejectIcon}>
                      ×
                    </Text>

                    <Text style={styles.rejectText}>
                      Reject
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.approveButton}
                    onPress={() =>
                      approveHospital(hospital)
                    }
                    activeOpacity={0.85}
                  >
                    <Text style={styles.approveIcon}>
                      ✓
                    </Text>

                    <Text style={styles.approveText}>
                      Approve
                    </Text>
                  </TouchableOpacity>

                </View>

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

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },

  headerSubtitle: {
    color: '#DBEAFE',
    fontSize: 13,
    marginTop: 5,
    maxWidth: 250,
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
    paddingHorizontal: 30,
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
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 13,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },

  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  infoIconText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    color: '#1E40AF',
    fontSize: 13,
    fontWeight: '800',
  },

  infoText: {
    color: '#475569',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },

  hospitalCard: {
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

  hospitalIconText: {
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
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },

  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    marginRight: 5,
  },

  pendingText: {
    color: '#B45309',
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

  buttonRow: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 10,
  },

  rejectButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FFF7F7',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  rejectIcon: {
    color: '#DC2626',
    fontSize: 20,
    fontWeight: '500',
    marginRight: 6,
    marginTop: -2,
  },

  rejectText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '800',
  },

  approveButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },

  approveIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginRight: 6,
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
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  emptyIcon: {
    fontSize: 30,
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