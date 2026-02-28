import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axiosConfig';
import io from 'socket.io-client';

const SOCKET_URL = 'http://192.168.1.4:5000'; // ⚠️ PUT YOUR REAL IP HERE!

const GlobalVisitorModal = () => {
  const { user } = useContext(AuthContext);
  const [incomingVisitor, setIncomingVisitor] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Only connect and listen if the user is a logged-in resident (Owner)
    if (!user || user.role !== 'Owner') return;

    const socket = io(SOCKET_URL);
    
    socket.on('connect', () => {
      console.log('🌐 Global Modal Connected to Socket');
      if (user?.flat_id) {
        socket.emit('join_flat_room', user.flat_id._id || user.flat_id); // Handles both populated and raw IDs
      }
    });

    socket.on('new_visitor_alert', (visitorData) => {
      console.log('🚨 Global Alert Triggered!', visitorData.visitor_name);
      setIncomingVisitor(visitorData);
    });

    return () => socket.disconnect();
  }, [user]);

  const handleVisitorResponse = async (status) => {
    setProcessing(true);
    try {
      await API.put(`/visitors/${incomingVisitor._id}/status`, { status });
      setIncomingVisitor(null);
    } catch (error) {
      Alert.alert('Error', 'Could not update status.');
    } finally {
      setProcessing(false);
    }
  };

  // If there's no visitor waiting, render absolutely nothing
  if (!incomingVisitor) return null;

  return (
    <Modal visible={true} animationType="fade" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalAlertHeader}>
            <Ionicons name="shield-checkmark" size={24} color="#fff" />
            <Text style={styles.modalTitle}>Gate Security Alert</Text>
          </View>
          
          <View style={styles.modalBody}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: incomingVisitor.photo_url }} style={styles.visitorImage} />
            </View>
            <Text style={styles.visitorName}>{incomingVisitor.visitor_name}</Text>
            <Text style={styles.visitorSubText}>is requesting entry to your flat</Text>
            
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity style={[styles.actionButton, styles.denyButton]} onPress={() => handleVisitorResponse('Denied')} disabled={processing}>
                <Ionicons name="close-circle" size={20} color="#fff" style={{ marginRight: 5 }} />
                <Text style={styles.buttonText}>Deny</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionButton, styles.approveButton]} onPress={() => handleVisitorResponse('Approved')} disabled={processing}>
                {processing ? <ActivityIndicator color="#fff"/> : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 5 }} />
                    <Text style={styles.buttonText}>Approve</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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

export default GlobalVisitorModal;