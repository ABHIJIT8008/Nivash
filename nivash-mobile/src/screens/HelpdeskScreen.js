import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  Modal, TextInput, ActivityIndicator, Alert, SafeAreaView, RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import API from '../api/axiosConfig';

const HelpdeskScreen = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMyTickets = async () => {
    try {
      const response = await API.get('/tickets/my-tickets');
      setTickets(response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      Alert.alert('Error', 'Could not load your tickets.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMyTickets();
  }, []);

  const submitTicket = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Missing Info', 'Please provide both a title and description for the issue.');
      return;
    }

    setSubmitting(true);
    try {
      await API.post('/tickets', { title, description });
      
      Alert.alert('Success', 'Your maintenance request has been submitted to the admin.');
      setModalVisible(false);
      setTitle('');
      setDescription('');
      fetchMyTickets(); // Refresh the list to show the new ticket
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderBadge = (status) => {
    let bgColor = '#f8d7da'; // Open (Red)
    let textColor = '#842029';
    
    if (status === 'In Progress') {
      bgColor = '#fff3cd'; // Yellow
      textColor = '#856404';
    } else if (status === 'Resolved') {
      bgColor = '#d1e7dd'; // Green
      textColor = '#0f5132';
    }

    return (
      <View style={[styles.badge, { backgroundColor: bgColor }]}>
        <Text style={[styles.badgeText, { color: textColor }]}>{status}</Text>
      </View>
    );
  };

  const renderTicket = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.ticketTitle}>{item.title}</Text>
        {renderBadge(item.status)}
      </View>
      <Text style={styles.ticketDesc}>{item.description}</Text>
      <Text style={styles.ticketDate}>
        {new Date(item.createdAt).toLocaleDateString('en-IN', { 
          day: 'numeric', month: 'short', year: 'numeric' 
        })}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Helpdesk</Text>
          <Text style={styles.headerSubtitle}>Request maintenance & support</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item._id}
          renderItem={renderTicket}
          contentContainerStyle={{ padding: 15 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>You have no open maintenance requests.</Text>
          }
        />
      )}

      {/* --- NEW TICKET MODAL --- */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Request</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Issue Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Leaking kitchen sink"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Please provide details so we know who to send..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={submitTicket}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Ticket</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7f6' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' },
  headerSubtitle: { fontSize: 14, color: '#666', marginTop: 2 },
  addButton: { backgroundColor: '#007bff', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 },
  
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  ticketTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1, marginRight: 10 },
  ticketDesc: { fontSize: 14, color: '#666', marginBottom: 12, lineHeight: 20 },
  ticketDate: { fontSize: 12, color: '#999', fontWeight: '500' },
  
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888', fontSize: 16 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: '50%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a' },
  
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  input: { backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#dee2e6', borderRadius: 10, padding: 15, fontSize: 16, marginBottom: 20 },
  textArea: { minHeight: 120 },
  
  submitButton: { backgroundColor: '#007bff', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default HelpdeskScreen;