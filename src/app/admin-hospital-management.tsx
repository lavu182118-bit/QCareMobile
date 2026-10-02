import { useCallback, useState } from 'react';

import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    router,
    useFocusEffect,
} from 'expo-router';

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

export default function AdminHospitalManagement() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState('All');

  const filters = [
    'All',
    'Active',
    'Pending',
    'Deactivated',
    'Rejected',
  ];

  const loadHospitals = async () => {
    try {
      const response = await fetch(
        `${API_URL}/admin/hospitals`
      );

      if (!response.ok) {
        throw new Error('Unable to load hospitals');
      }

      const data = await response.json();

      const hospitalList: Hospital[] =
        Array.isArray(data)
          ? data
          : data.hospitals || [];

      setHospitals(hospitalList);
    } catch (error) {
      console.error(
        'Load hospitals error:',
        error
      );
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

  const filteredHospitals = hospitals.filter(
    (hospital) => {
      const matchesFilter =
        filter === 'All' ||
        hospital.status === filter;

      const search =
        searchText.trim().toLowerCase();

      const matchesSearch =
        search === '' ||
        hospital.name
          .toLowerCase()
          .includes(search) ||
        hospital.hospital_id
          .toLowerCase()
          .includes(search) ||
        hospital.email
          .toLowerCase()
          .includes(search) ||
        hospital.phone
          .toLowerCase()
          .includes(search);

      return matchesFilter && matchesSearch;
    }
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return '#16A34A';

      case 'Pending':
        return '#D97706';

      case 'Deactivated':
        return '#DC2626';

      case 'Rejected':
        return '#64748B';

      default:
        return '#64748B';
    }
  };

  const getStatusBackground = (
    status: string
  ) => {
    switch (status) {
      case 'Active':
        return '#DCFCE7';

      case 'Pending':
        return '#FEF3C7';

      case 'Deactivated':
        return '#FEE2E2';

      case 'Rejected':
        return '#F1F5F9';

      default:
        return '#F1F5F9';
    }
  };

  const formatDate = (
    dateString: string
  ) => {
    if (!dateString) {
      return 'Not available';
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    );
  };

  const openHospitalDetails = (
    hospital: Hospital
  ) => {
    router.push({
      pathname:
        '/admin-hospital-details',
      params: {
        hospitalId: String(
          hospital.id
        ),
      },
    });
  };

  if (loading) {
    return (
      <View
        style={styles.loadingContainer}
      >
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text style={styles.loadingText}>
          Loading hospitals...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backIcon}>
            ‹
          </Text>
        </TouchableOpacity>

        <View
          style={
            styles.headerTextContainer
          }
        >
          <Text style={styles.headerTitle}>
            Hospital Management
          </Text>

          <Text
            style={styles.headerSubtitle}
          >
            Manage registered hospitals
          </Text>
        </View>

        <View style={styles.headerCount}>
          <Text
            style={
              styles.headerCountNumber
            }
          >
            {hospitals.length}
          </Text>

          <Text
            style={styles.headerCountLabel}
          >
            Total
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2563EB"
          />
        }
      >
        {/* SUMMARY CARD */}

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Text
              style={styles.summaryIconText}
            >
              H
            </Text>
          </View>

          <View
            style={styles.summaryContent}
          >
            <Text style={styles.summaryTitle}>
              Registered Hospitals
            </Text>

            <Text
              style={
                styles.summarySubtitle
              }
            >
              View and manage all hospital
              accounts
            </Text>
          </View>

          <View
            style={styles.summaryCount}
          >
            <Text
              style={
                styles.summaryCountNumber
              }
            >
              {filteredHospitals.length}
            </Text>

            <Text
              style={
                styles.summaryCountLabel
              }
            >
              Showing
            </Text>
          </View>
        </View>

        {/* SEARCH */}

        <View
          style={styles.searchContainer}
        >
          <Text style={styles.searchIcon}>
            ⌕
          </Text>

          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search hospitals..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />

          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() =>
                setSearchText('')
              }
              style={styles.clearSearch}
            >
              <Text
                style={
                  styles.clearSearchText
                }
              >
                ×
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* FILTERS */}

        <View
          style={styles.filterSection}
        >
          <Text style={styles.filterTitle}>
            Filter by status
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.filterScroll
            }
          >
            {filters.map((item) => {
              const active =
                filter === item;

              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.filterChip,
                    active &&
                      styles.filterChipActive,
                  ]}
                  onPress={() =>
                    setFilter(item)
                  }
                >
                  {item !== 'All' && (
                    <View
                      style={[
                        styles.filterDot,
                        {
                          backgroundColor:
                            getStatusColor(
                              item
                            ),
                        },
                      ]}
                    />
                  )}

                  <Text
                    style={[
                      styles.filterText,
                      active &&
                        styles.filterTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* RESULT HEADER */}

        <View
          style={styles.resultHeader}
        >
          <View>
            <Text
              style={styles.resultTitle}
            >
              Hospitals
            </Text>

            <Text
              style={
                styles.resultSubtitle
              }
            >
              {filteredHospitals.length}{' '}
              hospital
              {filteredHospitals.length !==
              1
                ? 's'
                : ''}{' '}
              found
            </Text>
          </View>

          {(filter !== 'All' ||
            searchText.trim() !== '') && (
            <TouchableOpacity
              style={
                styles.clearFiltersButton
              }
              onPress={() => {
                setFilter('All');
                setSearchText('');
              }}
            >
              <Text
                style={
                  styles.clearFiltersText
                }
              >
                Clear
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* HOSPITAL LIST */}

        {filteredHospitals.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Text
                style={styles.emptyIconText}
              >
                H
              </Text>
            </View>

            <Text
              style={styles.emptyTitle}
            >
              No hospitals found
            </Text>

            <Text
              style={styles.emptySubtitle}
            >
              Try changing the search or
              filter.
            </Text>

            {(filter !== 'All' ||
              searchText.trim() !== '') && (
              <TouchableOpacity
                style={
                  styles.emptyClearButton
                }
                onPress={() => {
                  setFilter('All');
                  setSearchText('');
                }}
              >
                <Text
                  style={
                    styles.emptyClearText
                  }
                >
                  Clear Filters
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredHospitals.map(
            (hospital) => (
              <TouchableOpacity
                key={hospital.id}
                activeOpacity={0.85}
                style={
                  styles.hospitalCard
                }
                onPress={() =>
                  openHospitalDetails(
                    hospital
                  )
                }
              >
                <View style={styles.cardTop}>
                  <View
                    style={
                      styles.hospitalAvatar
                    }
                  >
                    <Text
                      style={
                        styles.hospitalAvatarText
                      }
                    >
                      {hospital.name
                        ?.charAt(0)
                        .toUpperCase() ||
                        'H'}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.cardTitleArea
                    }
                  >
                    <Text
                      style={
                        styles.hospitalName
                      }
                      numberOfLines={2}
                    >
                      {hospital.name}
                    </Text>

                    <Text
                      style={
                        styles.hospitalId
                      }
                    >
                      {hospital.hospital_id}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          getStatusBackground(
                            hospital.status
                          ),
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            getStatusColor(
                              hospital.status
                            ),
                        },
                      ]}
                    />

                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            getStatusColor(
                              hospital.status
                            ),
                        },
                      ]}
                    >
                      {hospital.status}
                    </Text>
                  </View>
                </View>
                {/* HOSPITAL DETAILS */}

                <View style={styles.cardDivider} />

                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
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

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>
                      Phone
                    </Text>

                    <Text
                      style={styles.detailValue}
                      numberOfLines={1}
                    >
                      {hospital.phone}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>
                      Address
                    </Text>

                    <Text
                      style={styles.detailValue}
                      numberOfLines={2}
                    >
                      {hospital.address ||
                        'Not provided'}
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>
                      Registered
                    </Text>

                    <Text style={styles.detailValue}>
                      {formatDate(
                        hospital.created_at
                      )}
                    </Text>
                  </View>
                </View>

                {/* VIEW DETAILS */}

                <View
                  style={styles.viewDetailsRow}
                >
                  <Text
                    style={styles.viewDetailsHint}
                  >
                    Tap to view full details
                  </Text>

                  <View
                    style={
                      styles.viewDetailsButton
                    }
                  >
                    <Text
                      style={
                        styles.viewDetailsText
                      }
                    >
                      View Details
                    </Text>

                    <Text
                      style={
                        styles.viewDetailsArrow
                      }
                    >
                      →
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )
          )
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

/* =========================
   STYLES
========================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 14,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },

  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 54,
    paddingBottom: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  backIcon: {
    fontSize: 32,
    lineHeight: 34,
    color: '#0F172A',
    fontWeight: '300',
    marginTop: -3,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },

  headerCount: {
    minWidth: 54,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
  },

  headerCountNumber: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2563EB',
  },

  headerCountLabel: {
    marginTop: 1,
    fontSize: 9,
    color: '#64748B',
    fontWeight: '600',
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },

  summaryCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  summaryIconText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },

  summaryContent: {
    flex: 1,
  },

  summaryTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  summarySubtitle: {
    color: '#CBD5E1',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },

  summaryCount: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },

  summaryCountNumber: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },

  summaryCountLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 1,
  },

  searchContainer: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 18,
  },

  searchIcon: {
    fontSize: 25,
    color: '#64748B',
    marginRight: 8,
    marginTop: -3,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
  },

  clearSearch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  clearSearchText: {
    fontSize: 20,
    lineHeight: 21,
    color: '#64748B',
    fontWeight: '500',
  },

  filterSection: {
    marginBottom: 20,
  },

  filterTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
  },

  filterScroll: {
    paddingRight: 10,
  },

  filterChip: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },

  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },

  filterDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 7,
  },

  filterText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  resultTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },

  resultSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
  },

  clearFiltersButton: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
  },

  clearFiltersText: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '700',
  },

  hospitalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 16,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  hospitalAvatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  hospitalAvatarText: {
    color: '#2563EB',
    fontSize: 18,
    fontWeight: '800',
  },

  cardTitleArea: {
    flex: 1,
    paddingRight: 7,
  },

  hospitalName: {
    fontSize: 15,
    lineHeight: 20,
    color: '#0F172A',
    fontWeight: '800',
  },

  hospitalId: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 4,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },

  cardDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 15,
  },

  detailRow: {
    flexDirection: 'row',
    marginBottom: 13,
  },

  detailItem: {
    flex: 1,
    paddingRight: 8,
  },

  detailLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },

  detailValue: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
    lineHeight: 17,
  },

  viewDetailsRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  viewDetailsHint: {
    flex: 1,
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },

  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 10,
  },

  viewDetailsText: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '800',
  },

  viewDetailsArrow: {
    fontSize: 15,
    color: '#2563EB',
    fontWeight: '800',
    marginLeft: 5,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  emptyIconText: {
    fontSize: 23,
    fontWeight: '800',
    color: '#94A3B8',
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },

  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },

  emptyClearButton: {
    marginTop: 17,
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 11,
  },

  emptyClearText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  bottomSpace: {
    height: 20,
  },
});