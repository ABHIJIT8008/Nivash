import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, 
  ActivityIndicator, Image, SafeAreaView, KeyboardAvoidingView, 
  Platform, ScrollView, StatusBar // <-- Added StatusBar
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axiosConfig';
import io from 'socket.io-client';

const SOCKET_URL = 'http://192.168.1.4:5000'; // ⚠️ Your IP here
const CLOUDINARY_UPLOAD_PRESET = 'nivash_visitors';
const CLOUDINARY_CLOUD_NAME = 'dhljl4vr4';

const SecurityHomeScreen = () => {
  const { user, logout } = useContext(AuthContext);
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState(null);
  const [visitorName, setVisitorName] = useState('');
  const [selectedFlat, setSelectedFlat] = useState('');
  const [flats, setFlats] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // --- NEW: LIVE QUEUE STATE ---
  const [recentLogs, setRecentLogs] = useState([]);
  const cameraRef = useRef(null);

  useEffect(() => {
    const fetchFlats = async () => {
      try {
        const response = await API.get('/flats');
        setFlats(response.data);
        if (response.data.length > 0) setSelectedFlat(response.data[0]._id);
      } catch (error) { console.error('Failed to fetch flats', error); }
    };
    fetchFlats();
  }, []);

  // --- UPDATED SOCKET LOGIC ---
  useEffect(() => {
    const socket = io(SOCKET_URL);
    socket.on('connect', () => console.log('🛡️ Guard Connected to Socket Server'));

    socket.on('visitor_status_updated', (updatedVisitor) => {
      // 1. Update the live queue on the screen
      setRecentLogs(prevLogs => 
        prevLogs.map(log => 
          log.visitor_name === updatedVisitor.visitor_name ? { ...log, status: updatedVisitor.status } : log
        )
      );

      // 2. Alert the guard
      if (updatedVisitor.status === 'Approved') {
        Alert.alert('✅ ACCESS GRANTED', `Resident approved entry for ${updatedVisitor.visitor_name}.`);
      } else if (updatedVisitor.status === 'Denied') {
        Alert.alert('❌ ACCESS DENIED', `Resident denied entry for ${updatedVisitor.visitor_name}.`);
      }
    });

    return () => socket.disconnect();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
        setPhotoUri(photo.uri);
      } catch (error) { Alert.alert('Error', 'Failed to take photo'); }
    }
  };

  const handleLogVisitor = async () => {
    if (!visitorName || !selectedFlat || !photoUri) {
      Alert.alert('Missing Details', 'Please enter a name, select a flat, and take a photo.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('file', { uri: photoUri, type: 'image/jpeg', name: 'photo.jpg' });
      data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json', 'Content-Type': 'multipart/form-data' },
      });
      const cloudinaryData = await cloudinaryResponse.json();

      await API.post('/visitors', {
        visitor_name: visitorName,
        visiting_flat_id: selectedFlat,
        photo_url: cloudinaryData.secure_url
      });

      // Add to the top of our local live feed as "Pending"
      const flatDetails = flats.find(f => f._id === selectedFlat);
      setRecentLogs([{ 
        id: Date.now(), 
        visitor_name: visitorName, 
        flat: `Block ${flatDetails?.block} - ${flatDetails?.flat_number}`,
        status: 'Pending' 
      }, ...recentLogs]);

      setVisitorName('');
      setPhotoUri(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to log visitor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!permission) return <View style={styles.center}><ActivityIndicator /></View>;
  if (!permission.granted) return <View style={styles.center}><Text>Need Camera Permission</Text></View>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.guardTitle}>Gate Security</Text>
            <Text style={styles.guardName}>Officer {user?.name?.split(' ')[0] || 'on Duty'}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutIcon}>
            <Ionicons name="log-out-outline" size={26} color="#dc3545" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          
          <View style={styles.cameraCard}>
            {photoUri ? (
              <View style={styles.photoPreviewContainer}>
                <Image source={{ uri: photoUri }} style={styles.cameraPreview} />
                <TouchableOpacity style={styles.retakeButton} onPress={() => setPhotoUri(null)}>
                  <Ionicons name="refresh-circle" size={20} color="#fff" style={{ marginRight: 5 }} />
                  <Text style={styles.retakeText}>Retake Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.cameraContainer}>
                <CameraView style={styles.cameraPreview} facing="back" ref={cameraRef} />
                <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                  <View style={styles.captureInnerCircle} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Visitor Details</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#777" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Visitor Name" value={visitorName} onChangeText={setVisitorName} />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="home-outline" size={20} color="#777" style={styles.inputIcon} />
              <View style={styles.pickerWrapper}>
                <Picker selectedValue={selectedFlat} onValueChange={setSelectedFlat} style={styles.picker}>
                  {flats.map((f) => <Picker.Item key={f._id} label={`Block ${f.block} - Flat ${f.flat_number}`} value={f._id} />)}
                </Picker>
              </View>
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={handleLogVisitor} disabled={isSubmitting}>
              {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Alert to Resident</Text>}
            </TouchableOpacity>
          </View>

          {/* --- NEW: LIVE STATUS FEED --- */}
          <View style={styles.feedContainer}>
            <Text style={styles.sectionTitle}>Live Queue</Text>
            {recentLogs.length === 0 ? (
              <Text style={styles.emptyFeedText}>No visitors logged yet in this session.</Text>
            ) : (
              recentLogs.map((log) => (
                <View key={log.id} style={styles.feedCard}>
                  <View>
                    <Text style={styles.feedName}>{log.visitor_name}</Text>
                    <Text style={styles.feedFlat}>{log.flat}</Text>
                  </View>
                  <View style={[styles.feedBadge, { backgroundColor: log.status === 'Approved' ? '#e6f4ea' : log.status === 'Denied' ? '#fce8e6' : '#fef7e0' }]}>
                     <Text style={{ fontWeight: 'bold', color: log.status === 'Approved' ? '#1e8e3e' : log.status === 'Denied' ? '#d93025' : '#f29900' }}>
                       {log.status}
                     </Text>
                  </View>
                </View>
              ))
            )}
          </View>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // FIX: Added dynamic padding for Android Notches
  safeArea: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flexGrow: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTextContainer: { flex: 1 },
  guardTitle: { fontSize: 13, color: '#666', fontWeight: '600' },
  guardName: { fontSize: 20, fontWeight: '800', color: '#1a1a1a' },
  logoutIcon: { padding: 8, backgroundColor: '#ffeeee', borderRadius: 12 },
  cameraCard: { backgroundColor: '#fff', borderRadius: 20, padding: 15, marginBottom: 20, elevation: 5 },
  cameraContainer: { height: 300, borderRadius: 16, overflow: 'hidden', backgroundColor: '#000' },
  cameraPreview: { flex: 1 },
  captureButton: { position: 'absolute', bottom: 20, alignSelf: 'center', width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  captureInnerCircle: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#fff' },
  photoPreviewContainer: { height: 300, borderRadius: 16, overflow: 'hidden' },
  retakeButton: { position: 'absolute', bottom: 20, alignSelf: 'center', flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.7)', padding: 12, borderRadius: 30 },
  retakeText: { color: '#fff', fontWeight: 'bold' },
  formCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 5, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f4f6f8', borderRadius: 12, borderWidth: 1, borderColor: '#e9ecef', marginBottom: 15, paddingHorizontal: 15 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 15 },
  pickerWrapper: { flex: 1 },
  picker: { width: '100%', height: 50 },
  primaryButton: { backgroundColor: '#007bff', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 5 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  
  // New Feed Styles
  feedContainer: { paddingBottom: 20 },
  emptyFeedText: { color: '#888', fontStyle: 'italic', textAlign: 'center' },
  feedCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  feedName: { fontSize: 16, fontWeight: '700', color: '#333' },
  feedFlat: { fontSize: 13, color: '#666', marginTop: 4 },
  feedBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }
});

export default SecurityHomeScreen;