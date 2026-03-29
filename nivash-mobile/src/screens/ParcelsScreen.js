import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, ActivityIndicator, 
  SafeAreaView, RefreshControl, Platform, StatusBar 
} from 'react-native';
import API from '../api/axiosConfig';

const ParcelsScreen = () => {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchParcels = async () => {
    try {
      const { data } = await API.get('/parcels/my-parcels');
      setParcels(data);
    } catch (error) {
      console.error('Error fetching parcels', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchParcels();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchParcels();
  }, []);

  const renderParcel = ({ item }) => {
    const isCollected = item.status === 'Collected';
    const dateFormatted = new Date(item.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });

    return (
      <View style={[styles.card, isCollected && styles.cardCollected]}>
        <View style={styles.headerRow}>
          <Text style={styles.companyText}>📦 {item.delivery_company}</Text>
          <View style={[styles.badge, isCollected ? styles.badgeGreen : styles.badgeOrange]}>
            <Text style={[styles.badgeText, isCollected ? styles.textGreen : styles.textOrange]}>
              {item.status}
            </Text>
          </View>
        </View>

        <Text style={styles.dateText}>Arrived: {dateFormatted}</Text>

        {!isCollected ? (
          <View style={styles.otpContainer}>
            <Text style={styles.otpLabel}>GATE PASS OTP</Text>
            <Text style={styles.otpValue}>{item.otp}</Text>
            <Text style={styles.otpWarning}>Show this code to Security to claim</Text>
          </View>
        ) : (
          <View style={styles.collectedContainer}>
            <Text style={styles.collectedText}>
              Claimed on {new Date(item.collectedAt).toLocaleDateString('en-IN')}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>My Parcels 📬</Text>
        <Text style={styles.subtitle}>Track your deliveries and gate passes.</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#0d6efd" style={{ marginTop: 50 }} />
        ) : (
          <FlatList 
            data={parcels}
            keyExtractor={(item) => item._id}
            renderItem={renderParcel}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0d6efd" />
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>No parcels waiting for you at the gate!</Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f7f6', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  pageTitle: { fontSize: 26, fontWeight: '800', color: '#1a1a1a', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  listContainer: { paddingBottom: 30 },
  emptyText: { textAlign: 'center', color: '#888', fontStyle: 'italic', marginTop: 40 },
  
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3, borderWidth: 1, borderColor: '#eee' },
  cardCollected: { opacity: 0.85, backgroundColor: '#fafafa' },
  
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  companyText: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  dateText: { fontSize: 13, color: '#888', marginBottom: 16 },
  
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeOrange: { backgroundColor: '#fff3cd' },
  badgeGreen: { backgroundColor: '#d1e7dd' },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  textOrange: { color: '#856404' },
  textGreen: { color: '#0f5132' },

  otpContainer: { backgroundColor: '#f8f9fa', padding: 15, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: '#0d6efd', borderStyle: 'dashed' },
  otpLabel: { fontSize: 12, fontWeight: '700', color: '#666', letterSpacing: 1, marginBottom: 5 },
  otpValue: { fontSize: 36, fontWeight: '900', color: '#0d6efd', letterSpacing: 5 },
  otpWarning: { fontSize: 11, color: '#dc3545', marginTop: 5, fontWeight: '500' },

  collectedContainer: { backgroundColor: '#e9ecef', padding: 12, borderRadius: 8, alignItems: 'center' },
  collectedText: { fontSize: 13, color: '#495057', fontWeight: '600' }
});

export default ParcelsScreen;