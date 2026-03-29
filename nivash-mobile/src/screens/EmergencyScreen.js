import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import API from '../api/axiosConfig';

const EmergencyScreen = () => {
  const [loading, setLoading] = useState(false);

  const handlePanicPress = async () => {
    // Add a quick confirmation so they don't accidentally press it in their pocket
    Alert.alert(
      "🚨 EMERGENCY 🚨",
      "Are you sure you want to trigger the panic alarm? Security will be dispatched to your flat immediately.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "TRIGGER ALARM", 
          style: "destructive",
          onPress: triggerAlarm 
        }
      ]
    );
  };

  const triggerAlarm = async () => {
    setLoading(true);
    try {
      // Hit the exact same route we just tested in Postman!
      await API.post('/emergency/trigger');
      
      Alert.alert(
        "Alarm Activated", 
        "Security has been notified and is on their way to your flat."
      );
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to send alert. Please call security directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Emergency</Text>
        <Text style={styles.subtitle}>Press the button below only in case of a severe emergency.</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.panicButton}
          onPress={handlePanicPress}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <Text style={styles.panicText}>SOS</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 30, alignItems: 'center', marginTop: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#dc3545', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 22 },
  buttonContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  panicButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#dc3545',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 8,
    borderColor: '#ffccd1'
  },
  panicText: { color: '#fff', fontSize: 48, fontWeight: '900', letterSpacing: 2 }
});

export default EmergencyScreen;