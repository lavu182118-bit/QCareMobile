import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  reactivation_status?: string | null;
  created_at: string;
};

export default function AdminHospitalDetails() {
  const router = useRouter();

  const { hospitalId } =
    useLocalSearchParams<{ hospitalId: string }>();

  const [hospital, setHospital] =
    useState<Hospital | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const loadHospital = async () => {
    try {
      setLoading(true);

      const response =
        await fetch(`${API_URL}/admin/hospitals`);

      const data =
        await response.json();

      if (!data.success) {
        Alert.alert(
          'Error',
          'Unable to load hospitals.'
        );
        return;
      }

      const foundHospital =
        data.hospitals.find(
          (item: Hospital) =>
            String(item.id) === String(hospitalId)
        );

      if (!foundHospital) {
        Alert.alert(
          'Error',
          'Hospital not found.'
        );
        return;
      }

      setHospital(foundHospital);

    } catch (error) {
      console.log(
        'HOSPITAL DETAILS ERROR:',
        error
      );

      Alert.alert(
        'Connection Error',
        'Unable to connect to QCare server.'
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHospital();
  }, [hospitalId]);

  const deactivateHospital = async () => {
  if (!hospital) return;

  const confirmed = window.confirm(
    `Are you sure you want to deactivate ${hospital.name}?`
  );

  if (!confirmed) {
    return;
  }

  try {
    setActionLoading(true);

    const response = await fetch(
      `${API_URL}/deactivate-hospital/${hospital.id}`,
      {
        method: 'PUT',
      }
    );

    const data = await response.json();

    if (!data.success) {
      window.alert(
        data.message ||
          'Unable to deactivate hospital.'
      );
      return;
    }

    window.alert(
      `${hospital.name} has been deactivated successfully.`
    );

    await loadHospital();

  } catch (error) {
    console.log(
      'DEACTIVATE HOSPITAL ERROR:',
      error
    );

    window.alert(
      'Unable to connect to QCare server.'
    );

  } finally {
    setActionLoading(false);
  }
};
  const approveHospital = () => {
    if (!hospital) return;

    Alert.alert(
      'Approve Hospital',
      `Are you sure you want to approve ${hospital.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Approve',

          onPress: async () => {
            try {
              setActionLoading(true);

              const response =
                await fetch(
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

              await loadHospital();

            } catch (error) {
              console.log(
                'APPROVE HOSPITAL ERROR:',
                error
              );

              Alert.alert(
                'Connection Error',
                'Unable to connect to QCare server.'
              );

            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const rejectHospital = () => {
    if (!hospital) return;

    Alert.alert(
      'Reject Hospital',
      `Are you sure you want to reject ${hospital.name}?`,
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
              setActionLoading(true);

              const response =
                await fetch(
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

              await loadHospital();

            } catch (error) {
              console.log(
                'REJECT HOSPITAL ERROR:',
                error
              );

              Alert.alert(
                'Connection Error',
                'Unable to connect to QCare server.'
              );

            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <View style={styles.loadingIcon}>
            <ActivityIndicator
              size="large"
              color="#2563EB"
            />
          </View>

          <Text style={styles.loadingTitle}>
            Loading Hospital
          </Text>

          <Text style={styles.loadingText}>
            Fetching hospital details...
          </Text>
        </View>
      </View>
    );
  }

  if (!hospital) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.notFoundCard}>
          <View style={styles.notFoundIcon}>
            <Text style={styles.notFoundIconText}>
              !
            </Text>
          </View>

          <Text style={styles.notFoundTitle}>
            Hospital Not Found
          </Text>

          <Text style={styles.notFoundText}>
            The requested hospital could not be found.
          </Text>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Text style={styles.backButtonText}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const status =
    hospital.status?.trim();

  const formattedDate =
    hospital.created_at
      ? new Date(
          hospital.created_at
        ).toLocaleDateString()
      : 'N/A';

  const getStatusDescription = () => {
    if (status === 'Active') {
      return 'Hospital account is active and operational.';
    }

    if (status === 'Pending') {
      return 'Hospital registration is waiting for approval.';
    }

    if (status === 'Deactivated') {
      return 'Hospital account is currently deactivated.';
    }

    if (status === 'Rejected') {
      return 'Hospital registration was rejected.';
    }

    return 'Current hospital account status.';
  };

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>

        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.headerBackText}>
            ‹
          </Text>
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            Hospital Details
          </Text>

          <Text style={styles.headerSubtitle}>
            Admin Management
          </Text>
        </View>

      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* HOSPITAL IDENTITY */}
        <View style={styles.identityCard}>

          <View style={styles.identityTopRow}>

            <View style={styles.hospitalIcon}>
              <Text style={styles.hospitalIconText}>
                H
              </Text>
            </View>

            <View style={styles.identityInfo}>

              <Text
                style={styles.hospitalName}
                numberOfLines={2}
              >
                {hospital.name}
              </Text>

              <Text style={styles.hospitalId}>
                Hospital ID • {hospital.hospital_id}
              </Text>

            </View>

          </View>

          <View style={styles.identityDivider} />

          <View style={styles.statusRow}>

            <View
              style={[
                styles.statusBadge,

                status === 'Active' &&
                  styles.activeBadge,

                status === 'Pending' &&
                  styles.pendingBadge,

                status === 'Deactivated' &&
                  styles.deactivatedBadge,

                status === 'Rejected' &&
                  styles.rejectedBadge,
              ]}
            >
              <View
                style={[
                  styles.statusDot,

                  status === 'Active' &&
                    styles.activeDot,

                  status === 'Pending' &&
                    styles.pendingDot,

                  status === 'Deactivated' &&
                    styles.deactivatedDot,

                  status === 'Rejected' &&
                    styles.rejectedDot,
                ]}
              />

              <Text
                style={[
                  styles.statusBadgeText,

                  status === 'Active' &&
                    styles.activeBadgeText,

                  status === 'Pending' &&
                    styles.pendingBadgeText,

                  status === 'Deactivated' &&
                    styles.deactivatedBadgeText,

                  status === 'Rejected' &&
                    styles.rejectedBadgeText,
                ]}
              >
                {status}
              </Text>
            </View>

            <Text style={styles.statusDescription}>
              {getStatusDescription()}
            </Text>

          </View>

        </View>

        {/* BASIC INFORMATION */}
        <View style={styles.card}>

          <View style={styles.sectionHeader}>

            <View style={styles.sectionIcon}>
              <Text style={styles.sectionIconText}>
                i
              </Text>
            </View>

            <View>
              <Text style={styles.cardTitle}>
                Basic Information
              </Text>

              <Text style={styles.cardSubtitle}>
                Registered hospital details
              </Text>
            </View>

          </View>

          <View style={styles.infoList}>

            <InfoRow
              label="Hospital ID"
              value={hospital.hospital_id}
            />

            <InfoRow
              label="Hospital Name"
              value={hospital.name}
            />

            <InfoRow
              label="Email"
              value={hospital.email}
            />

            <InfoRow
              label="Phone"
              value={hospital.phone}
            />

            <InfoRow
              label="Address"
              value={hospital.address}
            />

            <InfoRow
              label="Registered On"
              value={formattedDate}
              last
            />

          </View>

        </View>

        {/* ACCOUNT STATUS */}
        <View style={styles.card}>

          <View style={styles.sectionHeader}>

            <View style={styles.sectionIcon}>
              <Text style={styles.sectionIconText}>
                ✓
              </Text>
            </View>

            <View>
              <Text style={styles.cardTitle}>
                Account Status
              </Text>

              <Text style={styles.cardSubtitle}>
                Current account state and actions
              </Text>
            </View>

          </View>

          <View
            style={[
              styles.accountStatusBox,

              status === 'Active' &&
                styles.accountActiveBox,

              status === 'Deactivated' &&
                styles.accountDeactivatedBox,

              status === 'Pending' &&
                styles.accountPendingBox,

              status === 'Rejected' &&
                styles.accountRejectedBox,
            ]}
          >

            <View style={styles.accountStatusLeft}>

              <Text style={styles.accountStatusLabel}>
                Current Status
              </Text>

              <Text
                style={[
                  styles.accountStatusValue,

                  status === 'Active' &&
                    styles.accountActiveText,

                  status === 'Deactivated' &&
                    styles.accountDeactivatedText,

                  status === 'Pending' &&
                    styles.accountPendingText,

                  status === 'Rejected' &&
                    styles.accountRejectedText,
                ]}
              >
                {status}
              </Text>

            </View>

            <View
              style={[
                styles.largeStatusDot,

                status === 'Active' &&
                  styles.activeDot,

                status === 'Deactivated' &&
                  styles.deactivatedDot,

                status === 'Pending' &&
                  styles.pendingDot,

                status === 'Rejected' &&
                  styles.rejectedDot,
              ]}
            />

          </View>

          {/* DEACTIVATED */}
          {status === 'Deactivated' && (
            <View style={styles.reactivationStatusBox}>

              <Text
                style={styles.reactivationStatusLabel}
              >
                Reactivation Request
              </Text>

              <Text
                style={styles.reactivationStatusText}
              >
                {hospital.reactivation_status ===
                'Pending'
                  ? 'Reactivation Request Pending'
                  : hospital.reactivation_status ===
                    'Approved'
                  ? 'Reactivation Approved'
                  : 'No Reactivation Request'}
              </Text>

            </View>
          )}

          {/* ACTIVE ACTION */}
          {status === 'Active' && (
            <TouchableOpacity
              style={styles.deactivateButton}
              onPress={deactivateHospital}
              disabled={actionLoading}
              activeOpacity={0.85}
            >
              {actionLoading ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <Text style={styles.buttonIcon}>
                    !
                  </Text>

                  <Text
                    style={
                      styles.deactivateButtonText
                    }
                  >
                    Deactivate Hospital
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* PENDING ACTIONS */}
          {status === 'Pending' && (
            <View
              style={
                styles.pendingActionsContainer
              }
            >

              <TouchableOpacity
                style={styles.approveButton}
                onPress={approveHospital}
                disabled={actionLoading}
                activeOpacity={0.85}
              >

                {actionLoading ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                  />
                ) : (
                  <Text
                    style={
                      styles.actionButtonText
                    }
                  >
                    Approve Hospital
                  </Text>
                )}

              </TouchableOpacity>

              <TouchableOpacity
                style={styles.rejectButton}
                onPress={rejectHospital}
                disabled={actionLoading}
                activeOpacity={0.85}
              >

                <Text
                  style={
                    styles.actionButtonText
                  }
                >
                  Reject Hospital
                </Text>

              </TouchableOpacity>

            </View>
          )}

          {/* INFORMATION MESSAGE */}
          {status === 'Deactivated' && (
            <View style={styles.infoBox}>

              <Text style={styles.infoTitle}>
                Hospital Deactivated
              </Text>

              <Text style={styles.infoText}>
                This hospital account is currently
                deactivated. The hospital can request
                reactivation from its dashboard.
              </Text>

            </View>
          )}

          {status === 'Pending' && (
            <View style={styles.infoBox}>

              <Text style={styles.infoTitle}>
                Approval Pending
              </Text>

              <Text style={styles.infoText}>
                This hospital is waiting for Admin
                approval.
              </Text>

            </View>
          )}

          {status === 'Rejected' && (
            <View style={styles.infoBox}>

              <Text style={styles.infoTitle}>
                Hospital Rejected
              </Text>

              <Text style={styles.infoText}>
                This hospital registration was rejected.
              </Text>

            </View>
          )}

        </View>

      </ScrollView>
    </View>
  );
}

function InfoRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.infoRow,
        last && styles.infoRowLast,
      ]}
    >
      <Text style={styles.infoRowLabel}>
        {label}
      </Text>

      <Text style={styles.infoRowValue}>
        {value || 'N/A'}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },

  // -------------------------
  // LOADING
  // -------------------------

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F7FB',
    paddingHorizontal: 24,
  },

  loadingCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 28,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  loadingIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingTitle: {
    marginTop: 18,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },

  loadingText: {
    marginTop: 6,
    fontSize: 14,
    color: '#64748B',
  },

  // -------------------------
  // NOT FOUND
  // -------------------------

  notFoundCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 28,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  notFoundIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  notFoundIconText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#DC2626',
  },

  notFoundTitle: {
    marginTop: 18,
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
  },

  notFoundText: {
    marginTop: 7,
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },

  // -------------------------
  // HEADER
  // -------------------------

  header: {
    backgroundColor: '#2563EB',
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerBackButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  headerBackText: {
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 34,
    marginTop: -3,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#DBEAFE',
    fontSize: 13,
    marginTop: 3,
  },

  // -------------------------
  // MAIN CONTENT
  // -------------------------

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  // -------------------------
  // IDENTITY CARD
  // -------------------------

  identityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,

    elevation: 3,

    shadowColor: '#0F172A',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  identityTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  hospitalIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },

  hospitalIconText: {
    fontSize: 27,
    fontWeight: '900',
    color: '#2563EB',
  },

  identityInfo: {
    flex: 1,
  },

  hospitalName: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    color: '#0F172A',
  },

  hospitalId: {
    marginTop: 5,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },

  identityDivider: {
    height: 1,
    backgroundColor: '#EEF2F7',
    marginVertical: 16,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
  },

  activeBadge: {
    backgroundColor: '#DCFCE7',
  },

  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },

  deactivatedBadge: {
    backgroundColor: '#FEE2E2',
  },

  rejectedBadge: {
    backgroundColor: '#F1F5F9',
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#64748B',
    marginRight: 7,
  },

  activeDot: {
    backgroundColor: '#16A34A',
  },

  pendingDot: {
    backgroundColor: '#D97706',
  },

  deactivatedDot: {
    backgroundColor: '#DC2626',
  },

  rejectedDot: {
    backgroundColor: '#64748B',
  },

  statusBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },

  activeBadgeText: {
    color: '#15803D',
  },

  pendingBadgeText: {
    color: '#B45309',
  },

  deactivatedBadgeText: {
    color: '#B91C1C',
  },

  rejectedBadgeText: {
    color: '#475569',
  },

  statusDescription: {
    flex: 1,
    marginLeft: 10,
    marginTop: 2,
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
  },

  // -------------------------
  // GENERAL CARDS
  // -------------------------

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,

    elevation: 3,

    shadowColor: '#0F172A',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  sectionIconText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2563EB',
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },

  cardSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#64748B',
  },

  // -------------------------
  // INFORMATION ROWS
  // -------------------------

  infoList: {
    borderTopWidth: 1,
    borderTopColor: '#EEF2F7',
  },

  infoRow: {
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },

  infoRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 3,
  },

  infoRowLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 5,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  infoRowValue: {
    fontSize: 15,
    lineHeight: 21,
    color: '#1E293B',
    fontWeight: '600',
  },

  // -------------------------
  // ACCOUNT STATUS
  // -------------------------

  accountStatusBox: {
    minHeight: 76,
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  accountActiveBox: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },

  accountDeactivatedBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },

  accountPendingBox: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },

  accountRejectedBox: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },

  accountStatusLeft: {
    flex: 1,
  },

  accountStatusLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  accountStatusValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 5,
  },

  accountActiveText: {
    color: '#15803D',
  },

  accountDeactivatedText: {
    color: '#B91C1C',
  },

  accountPendingText: {
    color: '#B45309',
  },

  accountRejectedText: {
    color: '#475569',
  },

  largeStatusDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
  },

  // -------------------------
  // REACTIVATION
  // -------------------------

  reactivationStatusBox: {
    marginTop: 14,
    padding: 15,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  reactivationStatusLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },

  reactivationStatusText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: '#1E3A8A',
  },

  // -------------------------
  // BUTTONS
  // -------------------------

  deactivateButton: {
    marginTop: 16,
    backgroundColor: '#DC2626',
    borderRadius: 14,
    minHeight: 52,
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  buttonIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 22,
    marginRight: 9,
  },

  deactivateButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  pendingActionsContainer: {
    marginTop: 16,
    gap: 10,
  },

  approveButton: {
    backgroundColor: '#16A34A',
    borderRadius: 14,
    minHeight: 52,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rejectButton: {
    backgroundColor: '#DC2626',
    borderRadius: 14,
    minHeight: 52,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  // -------------------------
  // INFORMATION BOX
  // -------------------------

  infoBox: {
    marginTop: 16,
    padding: 15,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 6,
  },

  infoText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
  },

  // -------------------------
  // BACK BUTTON
  // -------------------------

  backButton: {
    minWidth: 120,
    backgroundColor: '#2563EB',
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
