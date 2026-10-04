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
};

export default function AdminActiveHospitals() {
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

      const activeHospitals =
        data.hospitals.filter(
          (hospital: Hospital) =>
            hospital.status === 'Active'
        );

      setHospitals(activeHospitals);
    } catch (error) {
      console.log(
        'ACTIVE HOSPITAL LOAD ERROR:',
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

  const deactivateHospital = async (
  hospital: Hospital
) => {
  try {
    const response = await fetch(
      `${API_URL}/deactivate-hospital/${hospital.id}`,
      {
        method: 'PUT',
      }
    );

    const data = await response.json();

    if (!data.success) {
      Alert.alert(
        'Error',
        data.message ||
          'Unable to deactivate hospital.'
      );
      return;
    }

    Alert.alert(
      'Hospital Deactivated',
      `${hospital.name} has been deactivated.`
    );

    loadHospitals();

  } catch (error) {

    console.log(
      'DEACTIVATE HOSPITAL ERROR:',
      error
    );

    Alert.alert(
      'Connection Error',
      'Unable to connect to QCare server.'
    );
  }
};
  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            Active Hospitals
          </Text>

          <Text style={styles.headerSubtitle}>
            View and manage currently active hospitals
          </Text>
        </View>

        <View style={styles.headerCount}>
          <Text style={styles.headerCountNumber}>
            {hospitals.length}
          </Text>

          <Text style={styles.headerCountLabel}>
            Active
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

          {/* STATUS INFO */}
          {hospitals.length > 0 && (
            <View style={styles.infoBar}>
              <View style={styles.infoIcon}>
                <Text style={styles.infoIconText}>
                  ✓
                </Text>
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>
                  Active hospitals
                </Text>

                <Text style={styles.infoText}>
                  These hospitals are currently approved and active on QCare.
                </Text>
              </View>
            </View>
          )}

          {/* EMPTY STATE */}
          {hospitals.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <Text style={styles.emptyIcon}>
                  H
                </Text>
              </View>

              <Text style={styles.emptyTitle}>
                No Active Hospitals
              </Text>

              <Text style={styles.emptyText}>
                There are currently no active hospitals in QCare.
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
                    <Text style={styles.iconText}>
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

                  <View style={styles.activeBadge}>
                    <View style={styles.activeDot} />

                    <Text style={styles.activeText}>
                      Active
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

                {/* DEACTIVATE */}
                <TouchableOpacity
                  style={styles.deactivateButton}
                  onPress={() =>
                    deactivateHospital(hospital)
                  }
                  activeOpacity={0.85}
                >
                  <Text style={styles.deactivateIcon}>
                    −
                  </Text>

                  <Text style={styles.deactivateText}>
                    Deactivate Hospital
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
    fontSize: 24,
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
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    padding: 13,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },

  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#16A34A',
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
    color: '#166534',
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

  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },

  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
    marginRight: 5,
  },

  activeText: {
    color: '#15803D',
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

  deactivateButton: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FFF7F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    flexDirection: 'row',
  },

  deactivateIcon: {
    color: '#DC2626',
    fontSize: 21,
    fontWeight: '500',
    marginRight: 7,
    marginTop: -2,
  },

  deactivateText: {
    color: '#DC2626',
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
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  emptyIcon: {
    fontSize: 24,
    fontWeight: '900',
    color: '#2563EB',
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