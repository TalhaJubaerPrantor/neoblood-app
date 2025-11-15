import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert,
  ActivityIndicator,
  FlatList,
  Linking
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiUrl } from '../../config/api';

export default function Circle() {
  const [activeTab, setActiveTab] = useState('search'); // 'search' or 'saved'
  const [searchPhone, setSearchPhone] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [savedProfiles, setSavedProfiles] = useState([]);
  const [user, setUser] = useState(null);
  const [loadingCircle, setLoadingCircle] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [removingProfile, setRemovingProfile] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (user?._id) {
      fetchCircle();
    }
  }, [user, activeTab]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
    } catch (error) {
      console.warn('Error loading user data:', error);
    }
  };

  const fetchCircle = async () => {
    if (!user?._id) return;

    setLoadingCircle(true);
    try {
      const response = await fetch(apiUrl(`users/${user._id}`));
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setLoadingCircle(false);
        return;
      }

      const data = await response.json();
      
      let userData = null;
      if (data.status === 200 && data.user) {
        userData = data.user;
      } else if (Array.isArray(data)) {
        userData = data.find(u => u._id === user._id);
      }

      if (userData && userData.circle) {
        // Note: circle array is for manually added connections only
        // Accepted connection requests go to acceptedConnections array, not circle
        // Convert circle array to savedProfiles format
        const circleProfiles = userData.circle.map((connection) => ({
          id: connection.userId?._id || connection.userId || connection._id,
          _id: connection.userId?._id || connection.userId || connection._id,
          name: connection.name || 'Unknown',
          phone: connection.phone || '',
          bloodGroup: connection.bloodGroup || '—',
          location: connection.location || '',
          lastDonation: connection.lastDonation || '',
          totalDonations: connection.totalDonations || 0,
        }));
        setSavedProfiles(circleProfiles);
      }
    } catch (error) {
      console.warn('Error fetching circle:', error);
    } finally {
      setLoadingCircle(false);
    }
  };

  const handleSearch = async () => {
    if (!searchPhone.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    if (!/^01[3-9]\d{8}$/.test(searchPhone)) {
      Alert.alert('Invalid Number', 'Please enter a valid Bangladesh phone number (e.g., 01712345678)');
      return;
    }

    if (!user?._id) {
      Alert.alert('Error', 'User data not loaded. Please try again.');
      return;
    }

    // Don't allow searching yourself
    if (user.phone === searchPhone) {
      Alert.alert('Error', 'You cannot add yourself to your circle');
      return;
    }

    setSearching(true);
    setSearchResult(null);
    
    try {
      const response = await fetch(apiUrl(`search-user-by-phone`), {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          phone: searchPhone,
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.warn('Non-JSON response:', text.substring(0, 200));
        setSearchResult('not_found');
        setSearching(false);
        return;
      }

      const data = await response.json();
      
      if (data.status === 200 && data.user) {
        // Check if already in circle
        const alreadyInCircle = savedProfiles.some(p => 
          (p._id || p.id) === data.user._id
        );
        
        if (alreadyInCircle) {
          Alert.alert('Already in Circle', 'This user is already in your circle');
          setSearchResult(null);
        } else {
          // Format user data for display
          const formattedUser = {
            id: data.user._id,
            _id: data.user._id,
            name: data.user.name || 'Unknown',
            phone: data.user.phone || searchPhone,
            bloodGroup: data.user.bloodGroup || '—',
            location: data.user.location || data.user.address || '',
            age: data.user.age || '',
            lastDonation: data.user.lastDonation || '',
            totalDonations: data.user.totalDonations || 0,
          };
          setSearchResult(formattedUser);
        }
      } else {
        setSearchResult('not_found');
      }
    } catch (error) {
      console.warn('Search error:', error);
      Alert.alert('Error', 'Failed to search user. Please check your connection.');
      setSearchResult('not_found');
    } finally {
      setSearching(false);
    }
  };

  const handleSaveProfile = async (profile) => {
    if (!user?._id) {
      Alert.alert('Error', 'User data not loaded. Please try again.');
      return;
    }

    const alreadySaved = savedProfiles.some(p => 
      (p._id || p.id) === (profile._id || profile.id)
    );
    
    if (alreadySaved) {
      Alert.alert('Already Saved', 'This profile is already in your circle');
      return;
    }

    setSavingProfile(true);

    try {
      const response = await fetch(apiUrl('add-to-circle'), {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id,
          connectionUserId: profile._id || profile.id,
          connectionName: profile.name,
          connectionPhone: profile.phone,
          connectionBloodGroup: profile.bloodGroup,
          connectionLocation: profile.location,
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.warn('Non-JSON response:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      
      if (data.status === 200) {
        Alert.alert('Success!', `${profile.name} has been added to your circle`);
        setSearchResult(null);
        setSearchPhone('');
        // Refresh circle data
        await fetchCircle();
        // Update user data if returned
        if (data.user) {
          await AsyncStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
        }
      } else {
        Alert.alert('Error', data.message || 'Failed to add user to circle');
      }
    } catch (error) {
      console.warn('Save profile error:', error);
      Alert.alert('Error', 'Network request failed. Please check your connection and try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRemoveProfile = (profileId) => {
    if (!user?._id) {
      Alert.alert('Error', 'User data not loaded. Please try again.');
      return;
    }

    Alert.alert(
      'Remove from Circle',
      'Are you sure you want to remove this profile from your circle?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setRemovingProfile(profileId);
            
            try {
              const response = await fetch(apiUrl('remove-from-circle'), {
                method: 'POST',
                headers: {
                  'content-type': 'application/json',
                },
                body: JSON.stringify({
                  userId: user._id,
                  connectionUserId: profileId,
                }),
              });

              const contentType = response.headers.get('content-type');
              if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.warn('Non-JSON response:', text.substring(0, 200));
                throw new Error('Server returned non-JSON response');
              }

              const data = await response.json();
              
              if (data.status === 200) {
                Alert.alert('Removed', 'Profile removed from your circle');
                // Refresh circle data
                await fetchCircle();
                // Update user data if returned
                if (data.user) {
                  await AsyncStorage.setItem('user', JSON.stringify(data.user));
                  setUser(data.user);
                }
              } else {
                Alert.alert('Error', data.message || 'Failed to remove user from circle');
              }
            } catch (error) {
              console.warn('Remove profile error:', error);
              Alert.alert('Error', 'Network request failed. Please check your connection and try again.');
            } finally {
              setRemovingProfile(null);
            }
          }
        }
      ]
    );
  };

  const handleCallProfile = (phone) => {
    if (!phone) {
      Alert.alert('No Phone Number', 'Phone number not available');
      return;
    }

    const phoneUrl = `tel:${phone}`;
    Linking.openURL(phoneUrl).catch((err) => {
      console.warn('Call error:', err);
      Alert.alert('Error', 'Could not make phone call. Please check your device settings.');
    });
  };

  const renderSearchResult = () => {
    if (searching) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E53935" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      );
    }

    if (searchResult === null) {
      return (
        <View style={styles.emptySearchContainer}>
          <Text style={styles.emptySearchIcon}>🔍</Text>
          <Text style={styles.emptySearchText}>Enter a phone number to search</Text>
          <Text style={styles.emptySearchSubtext}>Find and save donors to your circle</Text>
        </View>
      );
    }

    if (searchResult === 'not_found') {
      return (
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundIcon}>😔</Text>
          <Text style={styles.notFoundText}>No user found</Text>
          <Text style={styles.notFoundSubtext}>
            No user registered with phone number {searchPhone}
          </Text>
        </View>
      );
    }

    const isAlreadySaved = savedProfiles.some(p => 
      (p._id || p.id) === (searchResult._id || searchResult.id)
    );

    return (
      <View style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <View style={styles.resultNameSection}>
            <Text style={styles.resultName}>👤 {searchResult.name}</Text>
            <Text style={styles.resultPhone}>📞 {searchResult.phone}</Text>
          </View>
          <View style={styles.bloodGroupBadge}>
            <Text style={styles.bloodGroupText}>{searchResult.bloodGroup}</Text>
          </View>
        </View>

        <View style={styles.resultBody}>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📍</Text>
            <Text style={styles.detailText}>{searchResult.location}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>👤</Text>
            <Text style={styles.detailText}>{searchResult.age} years old</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🎖️</Text>
            <Text style={styles.detailText}>Donated {searchResult.totalDonations} times</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📅</Text>
            <Text style={styles.detailText}>Last donation: {searchResult.lastDonation}</Text>
          </View>
        </View>

        <View style={styles.resultFooter}>
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => handleCallProfile(searchResult.phone)}
          >
            <FontAwesome name="phone" size={16} color="#fff" />
            <Text style={styles.callButtonText}>Call</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.saveButton, (isAlreadySaved || savingProfile) && styles.saveButtonDisabled]}
            onPress={() => handleSaveProfile(searchResult)}
            disabled={isAlreadySaved || savingProfile}
          >
            {savingProfile ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <FontAwesome name={isAlreadySaved ? "check" : "heart"} size={16} color="#fff" />
                <Text style={styles.saveButtonText}>
                  {isAlreadySaved ? 'Saved' : 'Save to Circle'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSavedProfile = ({ item }) => (
    <View style={styles.savedCard}>
      <View style={styles.savedHeader}>
        <View style={styles.savedNameSection}>
          <Text style={styles.savedName}>👤 {item.name}</Text>
          <Text style={styles.savedPhone}>📞 {item.phone}</Text>
        </View>
        <View style={styles.bloodGroupBadge}>
          <Text style={styles.bloodGroupText}>{item.bloodGroup}</Text>
        </View>
      </View>

      <View style={styles.savedBody}>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📍</Text>
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>🎖️</Text>
          <Text style={styles.detailText}>{item.totalDonations} donations</Text>
        </View>
      </View>

      <View style={styles.savedFooter}>
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => handleCallProfile(item.phone)}
        >
          <FontAwesome name="phone" size={14} color="#fff" />
          <Text style={styles.callButtonText}>Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.removeButton, removingProfile === (item._id || item.id) && styles.removeButtonDisabled]}
          onPress={() => handleRemoveProfile(item._id || item.id)}
          disabled={removingProfile === (item._id || item.id)}
        >
          {removingProfile === (item._id || item.id) ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <FontAwesome name="trash" size={14} color="#fff" />
              <Text style={styles.removeButtonText}>Remove</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.safeContainer}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>My Circle</Text>
          <Text style={styles.subtitle}>Save and manage your trusted donors</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'search' && styles.tabActive]}
            onPress={() => setActiveTab('search')}
          >
            <FontAwesome 
              name="search" 
              size={16} 
              color={activeTab === 'search' ? '#E53935' : '#999'} 
            />
            <Text style={[styles.tabText, activeTab === 'search' && styles.tabTextActive]}>
              Search User
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'saved' && styles.tabActive]}
            onPress={() => setActiveTab('saved')}
          >
            <FontAwesome 
              name="heart" 
              size={16} 
              color={activeTab === 'saved' ? '#E53935' : '#999'} 
            />
            <Text style={[styles.tabText, activeTab === 'saved' && styles.tabTextActive]}>
              Saved ({savedProfiles.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'search' ? (
            <View style={styles.searchTab}>
              {/* Search Section */}
              <View style={styles.searchSection}>
                <Text style={styles.searchLabel}>Search by Phone Number</Text>
                <View style={styles.searchInputContainer}>
                  <FontAwesome name="phone" size={18} color="#999" style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="01712345678"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                    value={searchPhone}
                    onChangeText={setSearchPhone}
                    maxLength={11}
                  />
                  {searchPhone.length > 0 && (
                    <TouchableOpacity onPress={() => {
                      setSearchPhone('');
                      setSearchResult(null);
                    }}>
                      <FontAwesome name="times-circle" size={18} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>
                
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={handleSearch}
                >
                  <FontAwesome name="search" size={16} color="#fff" />
                  <Text style={styles.searchButtonText}>Search User</Text>
                </TouchableOpacity>
              </View>

              {/* Search Result */}
              {renderSearchResult()}
            </View>
          ) : (
            <View style={styles.savedTab}>
              {loadingCircle ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#E53935" />
                  <Text style={styles.loadingText}>Loading your circle...</Text>
                </View>
              ) : savedProfiles.length === 0 ? (
                <View style={styles.emptySavedContainer}>
                  <Text style={styles.emptySavedIcon}>❤️</Text>
                  <Text style={styles.emptySavedText}>No saved profiles yet</Text>
                  <Text style={styles.emptySavedSubtext}>
                    Search for users and add them to your circle
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={styles.savedCountText}>
                    {savedProfiles.length} {savedProfiles.length === 1 ? 'Profile' : 'Profiles'} in your circle
                  </Text>
                  <FlatList
                    data={savedProfiles}
                    renderItem={renderSavedProfile}
                    keyExtractor={(item) => item._id || item.id || `profile-${item.name}`}
                    scrollEnabled={false}
                  />
                </>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerSection: {
    backgroundColor: '#E53935',
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 13,
    color: '#FFEBEE',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  tabActive: {
    backgroundColor: '#FFEBEE',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  tabTextActive: {
    color: '#E53935',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchTab: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  searchSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  searchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#E53935',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptySearchContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptySearchIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptySearchText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  emptySearchSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  notFoundContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  notFoundIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  notFoundSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultNameSection: {
    flex: 1,
    marginRight: 10,
  },
  resultName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  resultPhone: {
    fontSize: 14,
    color: '#666',
  },
  bloodGroupBadge: {
    backgroundColor: '#E53935',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  bloodGroupText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  resultBody: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 10,
    width: 24,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  resultFooter: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  callButton: {
    flex: 1,
    backgroundColor: '#43A047',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    shadowColor: '#43A047',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#E53935',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: '#BDBDBD',
    shadowOpacity: 0.1,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  savedTab: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  savedCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 15,
  },
  emptySavedContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptySavedIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptySavedText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  emptySavedSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  savedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  savedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  savedNameSection: {
    flex: 1,
    marginRight: 10,
  },
  savedName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  savedPhone: {
    fontSize: 14,
    color: '#666',
  },
  savedBody: {
    marginBottom: 12,
  },
  savedFooter: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  removeButton: {
    flex: 1,
    backgroundColor: '#F44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  removeButtonDisabled: {
    opacity: 0.6,
  },
});