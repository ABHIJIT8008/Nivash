import React, { useContext, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  Image, 
  ActivityIndicator,
  Alert,
  ScrollView,
  SafeAreaView,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // <-- NEW ICONS
import { AuthContext } from '../context/AuthContext';
import API from '../api/axiosConfig';
import io from 'socket.io-client';

const SOCKET_URL = 'http://192.168.1.4:5000'; // ⚠️ Keep your actual IP here!

const HomeScreen = () => {
  const { user, logout } = useContext(AuthContext);
  
  const [incomingVisitor, setIncomingVisitor] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [notices, setNotices] = useState([]);
  const [loadingNotices, setLoadingNotices] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- FETCH NOTICES ---
  const fetchNotices = async () => {
    try {
      const response = await API.get('/notices');
      setNotices(response.data);
    } catch (error) {
      console.error('Failed to fetch notices:', error);
    } finally {
      setLoadingNotices(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // --- NEW: ON REFRESH FUNCTION ---
  const onRefresh = async () => {
    setRefreshing(true); // Show the spinning loader
    await fetchNotices(); // Fetch fresh data from backend
    setRefreshing(false); // Hide the loader
  };


  const handleVisitorResponse = async (status) => {
    setProcessing(true);
    try {
      await API.put(`/visitors/${incomingVisitor._id}/status`, { status });
      setIncomingVisitor(null);
    } catch (error) {
      console.error('Failed to update status', error);
      Alert.alert('Error', 'Could not update visitor status.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#007bff']} />
        }>
        
        {/* --- MODERN HEADER CARD --- */}
        <View style={styles.headerCard}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.welcomeText}>Hello, {user?.name?.split(' ')[0] || 'Resident'} 👋</Text>
            <Text style={styles.flatText}>Block {user?.flat_id?.block || '-'} • Flat {user?.flat_id?.flat_number || '-'}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutIcon}>
            <Ionicons name="log-out-outline" size={28} color="#dc3545" />
          </TouchableOpacity>
        </View>

        {/* --- SECTION TITLE --- */}
        <View style={styles.sectionHeader}>
          <Ionicons name="megaphone-outline" size={24} color="#007bff" />
          <Text style={styles.sectionTitle}>Notice Board</Text>
        </View>

        {/* --- DYNAMIC NOTICE FEED --- */}
        {loadingNotices ? (
          <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 40 }} />
        ) : notices.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="checkmark-done-circle-outline" size={48} color="#ccc" />
            <Text style={styles.emptyCardText}>You're all caught up!</Text>
            <Text style={styles.emptyCardSubText}>No new notices from Admin.</Text>
          </View>
        ) : (
          notices.map((notice) => (
            <View key={notice._id} style={styles.noticeCard}>
              <View style={styles.noticeTopRow}>
                <Text style={styles.noticeTitle}>{notice.title}</Text>
                <Ionicons name="notifications" size={16} color="#007bff" />
              </View>
              <Text style={styles.noticeDate}>
                {new Date(notice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
              <Text style={styles.noticeMessage}>{notice.message}</Text>
              <Text style={styles.noticeAuthor}>Posted by Management</Text>
            </View>
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flexGrow: 1, padding: 20, paddingBottom: 40 },
  
  // Header Card
  headerCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  headerTextContainer: { flex: 1 },
  welcomeText: { fontSize: 22, fontWeight: '800', color: '#1a1a1a', marginBottom: 4 },
  flatText: { fontSize: 14, color: '#666', fontWeight: '500' },
  logoutIcon: { padding: 8, backgroundColor: '#ffeeee', borderRadius: 12 },

  // Notice Section
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingHorizontal: 5 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#333', marginLeft: 8 },
  
  // Notice Cards
  noticeCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 4 },
  noticeTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  noticeTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a', flex: 1, paddingRight: 10 },
  noticeDate: { fontSize: 12, color: '#888', marginBottom: 12, fontWeight: '500' },
  noticeMessage: { fontSize: 15, color: '#4a4a4a', lineHeight: 22, marginBottom: 15 },
  noticeAuthor: { fontSize: 12, color: '#007bff', fontWeight: '600' },

  // Empty State
  emptyCard: { backgroundColor: '#fff', padding: 40, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#ddd' },
  emptyCardText: { fontSize: 18, fontWeight: '600', color: '#555', marginTop: 15, marginBottom: 5 },
  emptyCardSubText: { fontSize: 14, color: '#888' },

  // Modal Styling
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#fff', borderRadius: 24, overflow: 'hidden', elevation: 10 },
  modalAlertHeader: { backgroundColor: '#d9534f', paddingVertical: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginLeft: 8, textTransform: 'uppercase', letterSpacing: 1 },
  modalBody: { padding: 25, alignItems: 'center' },
  imageContainer: { width: 140, height: 140, borderRadius: 70, borderWidth: 4, borderColor: '#f4f4f4', marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 5 },
  visitorImage: { width: '100%', height: '100%', borderRadius: 70 },
  visitorName: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', textAlign: 'center' },
  visitorSubText: { fontSize: 15, color: '#666', marginBottom: 25, textAlign: 'center' },
  
  actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 15 },
  actionButton: { flex: 1, flexDirection: 'row', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  denyButton: { backgroundColor: '#dc3545' },
  approveButton: { backgroundColor: '#28a745' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default HomeScreen;