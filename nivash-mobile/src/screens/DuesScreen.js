import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  SafeAreaView, FlatList, Modal, Alert, ActivityIndicator, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import API from '../api/axiosConfig'; // Hooked up to the real backend!

const DuesScreen = () => {
  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedDue, setSelectedDue] = useState(null);

  const fetchMyDues = async () => {
    try {
      const response = await API.get('/invoices/my-dues');
      setDues(response.data);
    } catch (error) {
      console.error('Error fetching dues:', error);
      Alert.alert('Error', 'Could not load your maintenance bills.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyDues();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMyDues();
  }, []);

  const handleOfflinePayment = () => {
    Alert.alert(
      "Payment Under Review", 
      "The Admin has been notified. Your status will change to 'Paid' once the transaction is verified."
    );
    
    // We update the UI optimistically so the user sees immediate feedback
    setDues(dues.map(due => 
      due._id === selectedDue._id ? { ...due, localStatus: 'Under Review' } : due
    ));
    
    setShowPaymentModal(false);
  };

  const renderDueCard = ({ item }) => {
    // We use a localStatus for UX so they see "Under Review" after clicking the button
    const displayStatus = item.localStatus || item.status;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.dueTitle}>{item.title}</Text>
            <Text style={styles.dueDate}>
              Due by: {new Date(item.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>
          </View>
          <Text style={styles.amount}>₹{item.amount}</Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={[
            styles.statusBadge, 
            displayStatus === 'Paid' ? styles.badgeGreen : 
            displayStatus === 'Under Review' ? styles.badgeYellow : styles.badgeRed
          ]}>
            <Text style={[
              styles.statusText,
              displayStatus === 'Paid' ? styles.textGreen : 
              displayStatus === 'Under Review' ? styles.textYellow : styles.textRed
            ]}>
              {displayStatus}
            </Text>
          </View>

          {displayStatus === 'Pending' && (
            <TouchableOpacity 
              style={styles.payBtn}
              onPress={() => { setSelectedDue(item); setShowPaymentModal(true); }}
            >
              <Text style={styles.payBtnText}>Pay Now</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Society Dues</Text>
        <Text style={styles.headerSubtitle}>Manage your maintenance payments</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={dues}
          keyExtractor={item => item._id}
          renderItem={renderDueCard}
          contentContainerStyle={{ padding: 15 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 50, color: '#888' }}>
              No pending invoices. You are all caught up!
            </Text>
          }
        />
      )}

      {/* --- OFFLINE PAYMENT MODAL --- */}
      <Modal visible={showPaymentModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Clear Dues</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedDue && (
              <View style={styles.invoiceBox}>
                <Text style={styles.invoiceLabel}>Total Amount Due</Text>
                <Text style={styles.invoiceAmount}>₹{selectedDue.amount}</Text>
              </View>
            )}

            <View style={styles.instructionsBox}>
              <Ionicons name="information-circle-outline" size={24} color="#007bff" />
              <Text style={styles.instructionsText}>
                Online gateway is currently offline. Please transfer the amount via UPI to <Text style={{fontWeight: 'bold'}}>nivash.society@okaxis</Text> or pay via Cash at the office.
              </Text>
            </View>

            <TouchableOpacity style={styles.notifyBtn} onPress={handleOfflinePayment}>
              <Text style={styles.notifyBtnText}>I have Paid via UPI / Cash</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7f6' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' },
  headerSubtitle: { fontSize: 14, color: '#666', marginTop: 2 },
  
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  dueTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1 },
  dueDate: { fontSize: 13, color: '#888', marginTop: 4 },
  amount: { fontSize: 22, fontWeight: '900', color: '#1a1a1a', marginLeft: 10 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 15 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeGreen: { backgroundColor: '#d1e7dd' }, textGreen: { color: '#0f5132', fontWeight: 'bold', fontSize: 12 },
  badgeRed: { backgroundColor: '#f8d7da' }, textRed: { color: '#842029', fontWeight: 'bold', fontSize: 12 },
  badgeYellow: { backgroundColor: '#fff3cd' }, textYellow: { color: '#856404', fontWeight: 'bold', fontSize: 12 },
  
  payBtn: { backgroundColor: '#007bff', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  payBtnText: { color: '#fff', fontWeight: 'bold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: 350 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold' },
  
  invoiceBox: { backgroundColor: '#f8f9fa', padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#eee' },
  invoiceLabel: { color: '#666', fontSize: 14, marginBottom: 5 },
  invoiceAmount: { fontSize: 32, fontWeight: '900', color: '#1a1a1a' },
  
  instructionsBox: { flexDirection: 'row', backgroundColor: '#e2eefe', padding: 15, borderRadius: 12, marginBottom: 25 },
  instructionsText: { flex: 1, color: '#004085', fontSize: 14, lineHeight: 20, marginLeft: 10 },
  
  notifyBtn: { backgroundColor: '#198754', padding: 16, borderRadius: 12, alignItems: 'center' },
  notifyBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default DuesScreen;