import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { router } from 'expo-router';
import { useEffect, useState } from 'react';

const API_URL = 'https://qcare-tisd.onrender.com';

type Hospital = {
  id: number;
  hospital_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: string;
};

type QueueInfo = {
  currentToken: string;
  waitingCount: number;
  estimatedWait: number;
};

export default function HospitalDiscoveryScreen() {

  const [hospitals, setHospitals] =
    useState<Hospital[]>([]);

  const [queueInfo, setQueueInfo] =
    useState<Record<number, QueueInfo>>({});

  const [loading, setLoading] =
    useState(true);

  const [searchText, setSearchText] =
    useState('');

  const loadHospitals = async () => {

    try {

      setLoading(true);

      const response = await fetch(
        `${API_URL}/hospitals`
      );

      if (!response.ok) {
        throw new Error(
          'Unable to load hospitals.'
        );
      }

      const data =
        await response.json();

      if (
        data.success &&
        data.hospitals
      ) {

        setHospitals(
          data.hospitals
        );

        loadQueueInformation(
          data.hospitals
        );

      } else {

        setHospitals([]);

      }

    } catch (error) {

      console.log(
        'HOSPITAL DISCOVERY ERROR:',
        error
      );

      Alert.alert(
        'Connection Error',
        'Unable to load hospitals from QCare server.'
      );

    } finally {

      setLoading(false);

    }

  };


  const loadQueueInformation = async (
    hospitalList: Hospital[]
  ) => {

    const queueData:
      Record<number, QueueInfo> = {};


    for (
      const hospital of hospitalList
    ) {

      try {

        const response =
          await fetch(
            `${API_URL}/live-queue/${hospital.id}`
          );

        const data =
          await response.json();


        if (
          data.success &&
          data.queue
        ) {

          const queue =
            data.queue;


          const waitingPatients =
            queue.filter(
              (patient: any) =>
                patient.status === 'Waiting'
            );


          const completedPatients =
            queue.filter(
              (patient: any) =>
                patient.status === 'Completed'
            );


          const currentToken =
            completedPatients.length > 0
              ? completedPatients[
                  completedPatients.length - 1
                ].token
              : '—';


          queueData[hospital.id] = {

            currentToken:
              currentToken,

            waitingCount:
              waitingPatients.length,

            estimatedWait:
              waitingPatients.length * 5,

          };

        } else {

          queueData[hospital.id] = {

            currentToken: '—',

            waitingCount: 0,

            estimatedWait: 0,

          };

        }

      } catch (error) {

        console.log(
          `QUEUE LOAD ERROR ${hospital.id}:`,
          error
        );

        queueData[hospital.id] = {

          currentToken: '—',

          waitingCount: 0,

          estimatedWait: 0,

        };

      }

    }


    setQueueInfo(
      queueData
    );

  };


  useEffect(() => {

    loadHospitals();

  }, []);


  const filteredHospitals =
    hospitals.filter(
      (hospital) =>
        hospital.name
          .toLowerCase()
          .includes(
            searchText
              .trim()
              .toLowerCase()
          )
    );
    return (
    <View style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* HEADER */}

        <View style={styles.header}>

          <Text style={styles.brand}>
            QCARE
          </Text>

          <Text style={styles.title}>
            Find a Hospital
          </Text>

          <Text style={styles.subtitle}>
            Check live queue information and doctor
            availability before you visit.
          </Text>

        </View>


        {/* SEARCH */}

        <View style={styles.searchBox}>

          <Text style={styles.searchIcon}>
            🔍
          </Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search hospital"
            placeholderTextColor="#98A2B3"
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() =>
                setSearchText('')
              }
            >
              <Text style={styles.clearText}>
                ×
              </Text>
            </TouchableOpacity>
          )}

        </View>


        {/* LOADING */}

        {loading ? (

          <View style={styles.loadingCard}>

            <ActivityIndicator
              size="small"
              color="#1769AA"
            />

            <Text style={styles.loadingText}>
              Finding active hospitals...
            </Text>

          </View>

        ) : filteredHospitals.length === 0 ? (

          /* EMPTY */

          <View style={styles.emptyCard}>

            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>
                🏥
              </Text>
            </View>

            <Text style={styles.emptyTitle}>
              No Hospital Found
            </Text>

            <Text style={styles.emptyText}>
              Try searching with another hospital
              name.
            </Text>

          </View>

        ) : (

          /* HOSPITAL LIST */

          <View>

            <View style={styles.sectionHeader}>

              <View>

                <Text style={styles.sectionTitle}>
                  Nearby Hospitals
                </Text>

                <Text style={styles.sectionSubtitle}>
                  {filteredHospitals.length}{' '}
                  active hospital
                  {filteredHospitals.length !== 1
                    ? 's'
                    : ''}
                </Text>

              </View>

              <View style={styles.activePill}>

                <View style={styles.activeDot} />

                <Text style={styles.activeText}>
                  ACTIVE
                </Text>

              </View>

            </View>


            {filteredHospitals.map(
              (hospital) => {

                const queue =
                  queueInfo[hospital.id] || {
                    currentToken: '—',
                    waitingCount: 0,
                    estimatedWait: 0,
                  };


                return (

                  <TouchableOpacity
                    key={hospital.id}
                    style={styles.hospitalCard}
                    activeOpacity={0.85}
                    onPress={() =>
                      router.push({
                        pathname:
                          '/hospital-details',
                        params: {
                          hospitalId:
                            hospital.id.toString(),
                        },
                      })
                    }
                  >

                    {/* HOSPITAL HEADER */}

                    <View
                      style={styles.hospitalHeader}
                    >

                      <View
                        style={
                          styles.hospitalIcon
                        }
                      >
                        <Text
                          style={
                            styles.hospitalIconText
                          }
                        >
                          🏥
                        </Text>
                      </View>


                      <View
                        style={
                          styles.hospitalInfo
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

                        <View
                          style={
                            styles.statusRow
                          }
                        >

                          <View
                            style={
                              styles.greenDot
                            }
                          />

                          <Text
                            style={
                              styles.openText
                            }
                          >
                            Active
                          </Text>

                        </View>

                      </View>


                      <Text
                        style={
                          styles.arrow
                        }
                      >
                        →
                      </Text>

                    </View>


                    {/* ADDRESS */}

                    {hospital.address ? (

                      <View
                        style={
                          styles.addressRow
                        }
                      >

                        <Text
                          style={
                            styles.addressIcon
                          }
                        >
                          📍
                        </Text>

                        <Text
                          style={
                            styles.addressText
                          }
                          numberOfLines={2}
                        >
                          {hospital.address}
                        </Text>

                      </View>

                    ) : null}


                    {/* QUEUE SUMMARY */}

                    <View
                      style={
                        styles.queueContainer
                      }
                    >

                      {/* CURRENT TOKEN */}

                      <View
                        style={
                          styles.queueItem
                        }
                      >

                        <Text
                          style={
                            styles.queueLabel
                          }
                        >
                          CURRENT TOKEN
                        </Text>

                        <Text
                          style={
                            styles.queueValue
                          }
                        >
                          {queue.currentToken}
                        </Text>

                      </View>


                      <View
                        style={
                          styles.verticalLine
                        }
                      />


                      {/* WAITING */}

                      <View
                        style={
                          styles.queueItem
                        }
                      >

                        <Text
                          style={
                            styles.queueLabel
                          }
                        >
                          WAITING
                        </Text>

                        <Text
                          style={
                            styles.queueValue
                          }
                        >
                          {queue.waitingCount}
                        </Text>

                      </View>


                      <View
                        style={
                          styles.verticalLine
                        }
                      />


                      {/* ESTIMATED */}

                      <View
                        style={
                          styles.queueItem
                        }
                      >

                        <Text
                          style={
                            styles.queueLabel
                          }
                        >
                          EST. WAIT
                        </Text>

                        <Text
                          style={
                            styles.queueValue
                          }
                        >
                          {queue.estimatedWait}
                          <Text
                            style={
                              styles.minuteText
                            }
                          >
                            {' '}min
                          </Text>
                        </Text>

                      </View>

                    </View>


                    {/* DETAILS BUTTON */}

                    <View
                      style={
                        styles.detailsButton
                      }
                    >

                      <Text
                        style={
                          styles.detailsText
                        }
                      >
                        View Hospital Details
                      </Text>

                      <Text
                        style={
                          styles.detailsArrow
                        }
                      >
                        →
                      </Text>

                    </View>

                  </TouchableOpacity>

                );

              }
            )}

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

  header: {
    marginBottom: 22,
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
    maxWidth: 340,
  },

  searchBox: {
    height: 54,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E1E7EF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 25,
    elevation: 2,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  searchIcon: {
    fontSize: 18,
    marginRight: 9,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#263238',
  },

  clearText: {
    fontSize: 26,
    color: '#98A2B3',
    paddingHorizontal: 5,
  },

  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#7A8798',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 25,
    paddingVertical: 42,
    alignItems: 'center',
    elevation: 2,
  },

  emptyIcon: {
    width: 78,
    height: 78,
    borderRadius: 27,
    backgroundColor: '#EAF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },

  emptyIconText: {
    fontSize: 34,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#172B4D',
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#8A94A6',
    textAlign: 'center',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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

  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF8F0',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#20A464',
    marginRight: 5,
  },

  activeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#198754',
    letterSpacing: 0.5,
  },

  hospitalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 17,
    marginBottom: 16,
    elevation: 3,
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  hospitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  hospitalIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: '#EAF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  hospitalIconText: {
    fontSize: 25,
  },

  hospitalInfo: {
    flex: 1,
  },

  hospitalName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#172B4D',
    lineHeight: 21,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#20A464',
    marginRight: 6,
  },

  openText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#198754',
  },

  arrow: {
    fontSize: 24,
    color: '#1769AA',
    marginLeft: 8,
  },

  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 15,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#EEF1F5',
  },

  addressIcon: {
    fontSize: 14,
    marginRight: 7,
  },

  addressText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: '#7A8798',
  },

  queueContainer: {
    marginTop: 16,
    backgroundColor: '#F7FAFD',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  queueItem: {
    flex: 1,
    alignItems: 'center',
  },

  queueLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#98A2B3',
    letterSpacing: 0.6,
    marginBottom: 5,
  },

  queueValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1769AA',
  },

  minuteText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7A8798',
  },

  verticalLine: {
    width: 1,
    height: 30,
    backgroundColor: '#DCE3EA',
  },

  detailsButton: {
    marginTop: 14,
    backgroundColor: '#1769AA',
    borderRadius: 13,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  detailsText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  detailsArrow: {
    color: '#FFFFFF',
    fontSize: 18,
    marginLeft: 8,
  },

});