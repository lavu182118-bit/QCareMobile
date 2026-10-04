import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
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

export default function AdminDashboard() {
  const router = useRouter();

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHospitals = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/hospitals`);
      const data = await response.json();

      if (data.success) {
        setHospitals(data.hospitals || []);
      }
    } catch (error) {
      console.log('ADMIN DASHBOARD LOAD ERROR:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHospitals();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadHospitals();
  };

  const handleLogout = () => {
  const confirmed = window.confirm(
    'Are you sure you want to logout?'
  );

  if (!confirmed) {
    return;
  }

  window.alert('You have been logged out.');

  router.replace('/admin-login');
};

  const totalHospitals = hospitals.length;

  const pendingHospitals = hospitals.filter(
    (hospital) => hospital.status === 'Pending'
  ).length;

  const activeHospitals = hospitals.filter(
    (hospital) => hospital.status === 'Active'
  ).length;

  const deactivatedHospitals = hospitals.filter(
    (hospital) => hospital.status === 'Deactivated'
  ).length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>
          Loading Admin Dashboard...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2563EB"
          />
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>Q</Text>
            </View>

            <View>
              <Text style={styles.brandName}>QCare</Text>
              <Text style={styles.brandSubtitle}>
                Admin Portal
              </Text>
            </View>
          </View>

          {/* ADMIN PROFILE */}
          <TouchableOpacity
            style={styles.adminCircle}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.adminLetter}>A</Text>
          </TouchableOpacity>
        </View>

        {/* WELCOME */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>
            Admin Dashboard
          </Text>

          <Text style={styles.welcomeSubtitle}>
            Manage hospitals and monitor the QCare system.
          </Text>
        </View>

        {/* OVERVIEW */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Overview</Text>

          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live</Text>
          </View>
        </View>

        {/* STATS */}
        <View style={styles.statsGrid}>
          {/* TOTAL */}
          <View style={styles.statCard}>
            <View style={styles.statIconBlue}>
              <Text style={styles.statIconText}>H</Text>
            </View>

            <Text style={styles.statNumber}>
              {totalHospitals}
            </Text>

            <Text style={styles.statLabel}>
              Total Hospitals
            </Text>
          </View>

          {/* PENDING */}
          <View style={styles.statCard}>
            <View style={styles.statIconOrange}>
              <Text style={styles.statIconText}>P</Text>
            </View>

            <Text style={styles.statNumber}>
              {pendingHospitals}
            </Text>

            <Text style={styles.statLabel}>Pending</Text>
          </View>

          {/* ACTIVE */}
          <View style={styles.statCard}>
            <View style={styles.statIconGreen}>
              <Text style={styles.statIconText}>✓</Text>
            </View>

            <Text style={styles.statNumber}>
              {activeHospitals}
            </Text>

            <Text style={styles.statLabel}>Active</Text>
          </View>

          {/* DEACTIVATED */}
          <View style={styles.statCard}>
            <View style={styles.statIconRed}>
              <Text style={styles.statIconText}>D</Text>
            </View>

            <Text style={styles.statNumber}>
              {deactivatedHospitals}
            </Text>

            <Text style={styles.statLabel}>
              Deactivated
            </Text>
          </View>
        </View>

        {/* MANAGEMENT HEADER */}
        <View style={styles.managementHeader}>
          <Text style={styles.sectionTitle}>
            Hospital Management
          </Text>

          <Text style={styles.managementSubtitle}>
            Manage hospital accounts and requests
          </Text>
        </View>

        {/* PENDING HOSPITALS */}
        <TouchableOpacity
          style={styles.managementCard}
          activeOpacity={0.85}
          onPress={() =>
            router.push('/admin-pending-hospitals')
          }
        >
          <View style={styles.managementIconBlue}>
            <Text style={styles.managementIconText}>P</Text>
          </View>

          <View style={styles.managementContent}>
            <View style={styles.managementTitleRow}>
              <Text style={styles.managementTitle}>
                Pending Hospitals
              </Text>

              {pendingHospitals > 0 && (
                <View style={styles.countBadgeOrange}>
                  <Text style={styles.countBadgeText}>
                    {pendingHospitals}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.managementDescription}>
              Review and approve new hospital registrations.
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* ACTIVE HOSPITALS */}
        <TouchableOpacity
          style={styles.managementCard}
          activeOpacity={0.85}
          onPress={() =>
            router.push('/admin-active-hospitals')
          }
        >
          <View style={styles.managementIconGreen}>
            <Text style={styles.managementIconText}>✓</Text>
          </View>

          <View style={styles.managementContent}>
            <View style={styles.managementTitleRow}>
              <Text style={styles.managementTitle}>
                Active Hospitals
              </Text>

              {activeHospitals > 0 && (
                <View style={styles.countBadgeGreen}>
                  <Text style={styles.countBadgeText}>
                    {activeHospitals}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.managementDescription}>
              View and manage currently active hospitals.
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* REACTIVATION REQUESTS */}
        <TouchableOpacity
          style={styles.managementCard}
          activeOpacity={0.85}
          onPress={() =>
            router.push('/admin-reactivation-requests')
          }
        >
          <View style={styles.managementIconPurple}>
            <Text style={styles.managementIconText}>↻</Text>
          </View>

          <View style={styles.managementContent}>
            <Text style={styles.managementTitle}>
              Reactivation Requests
            </Text>

            <Text style={styles.managementDescription}>
              Review hospitals requesting account reactivation.
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* HOSPITAL MANAGEMENT */}
        <TouchableOpacity
          style={styles.managementCard}
          activeOpacity={0.85}
          onPress={() =>
            router.push('/admin-hospital-management')
          }
        >
          <View style={styles.managementIconDark}>
            <Text style={styles.managementIconText}>☷</Text>
          </View>

          <View style={styles.managementContent}>
            <Text style={styles.managementTitle}>
              Hospital Management
            </Text>

            <Text style={styles.managementDescription}>
              Search and manage all registered hospitals.
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Text style={styles.logoutButtonText}>
            Logout
          </Text>
        </TouchableOpacity>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>
            QCare Admin
          </Text>

          <Text style={styles.footerText}>
            Hospital management system
          </Text>

          <Text style={styles.footerRefresh}>
            Pull down to refresh dashboard data
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },

  scrollContent: {
    paddingBottom: 100,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F7FB',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },

  header: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2563EB',
  },

  brandName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },

  brandSubtitle: {
    color: '#DBEAFE',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },

  adminCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  adminLetter: {
    color: '#2563EB',
    fontSize: 17,
    fontWeight: '900',
  },

  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 18,
  },

  welcomeTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
  },

  welcomeSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#64748B',
    marginTop: 6,
  },

  sectionHeader: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#16A34A',
    marginRight: 6,
  },

  liveText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },

  statsGrid: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8EDF5',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  statIconBlue: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  statIconOrange: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  statIconGreen: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  statIconRed: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  statIconText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#334155',
  },

  statNumber: {
    fontSize: 25,
    fontWeight: '900',
    color: '#0F172A',
  },

  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '600',
  },

  managementHeader: {
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 14,
  },

  managementSubtitle: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 4,
  },

  managementCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8EDF5',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },

  managementIconBlue: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  managementIconGreen: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  managementIconPurple: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  managementIconDark: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  managementIconText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#334155',
  },

  managementContent: {
    flex: 1,
  },

  managementTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  managementTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },

  managementDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
    marginTop: 4,
  },

  countBadgeOrange: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 7,
  },

  countBadgeGreen: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 7,
  },

  countBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#334155',
  },

  arrow: {
    fontSize: 30,
    color: '#94A3B8',
    marginLeft: 8,
    fontWeight: '300',
  },

  logoutButton: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 18,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoutButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#DC2626',
  },

  footer: {
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },

  footerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
  },

  footerText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 3,
  },

  footerRefresh: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 8,
  },
});