import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const EmergencySiren = () => {
  const [activeAlert, setActiveAlert] = useState(null);

  useEffect(() => {
    // 1. Connect to our local backend
    // (Remember to change this to your Render URL when you deploy!)
    const socket = io('http://localhost:5000',{
      transports: ['websocket', 'polling'], 
      withCredentials: true,
    });

    // 2. Listen for the exact event name we emitted from the backend
    socket.on('panicAlert', (data) => {
      console.log('🚨 EMERGENCY TRIGGERED:', data);
      setActiveAlert(data);
      // Optional: Play a loud audio file here if you want!
    });

    // Clean up the connection when the component unmounts
    return () => socket.disconnect();
  }, []);

  const handleDismiss = () => {
    // In a full production app, you might also hit an API here to mark it as 'Resolved'
    setActiveAlert(null);
  };

  // If there's no alert, render absolutely nothing
  if (!activeAlert) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.flashingHeader}>
          <h1 style={styles.title}>🚨 PANIC ALERT 🚨</h1>
        </div>
        
        <div style={styles.details}>
          <p style={styles.text}><strong>Resident:</strong> {activeAlert.resident_id?.name || 'Unknown'}</p>
          <p style={styles.text}><strong>Phone:</strong> {activeAlert.resident_id?.phone || 'N/A'}</p>
          <p style={styles.urgentText}>
            <strong>LOCATION:</strong> Block {activeAlert.flat_id?.block}, Flat {activeAlert.flat_id?.number}
          </p>
          <p style={styles.timestamp}>
            Time: {new Date(activeAlert.createdAt).toLocaleTimeString()}
          </p>
        </div>

        <button style={styles.dismissBtn} onClick={handleDismiss}>
          Acknowledge & Dispatch Security
        </button>
      </div>
    </div>
  );
};

// Some quick inline styles to make it look like a loud emergency
const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    backgroundColor: 'rgba(255, 0, 0, 0.8)', // Deep transparent red
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 9999, // Make sure it sits above EVERYTHING
  },
  modal: {
    backgroundColor: '#fff', padding: '40px', borderRadius: '16px',
    textAlign: 'center', maxWidth: '500px', width: '90%',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '5px solid #dc3545'
  },
  flashingHeader: {
    backgroundColor: '#dc3545', color: 'white', padding: '15px', 
    borderRadius: '10px', marginBottom: '20px',
    animation: 'flash 1s infinite alternate', // You can add this keyframe in your CSS later!
  },
  title: { margin: 0, fontSize: '32px', fontWeight: 'bold' },
  details: { fontSize: '20px', marginBottom: '30px' },
  text: { margin: '10px 0' },
  urgentText: { margin: '15px 0', fontSize: '24px', color: '#dc3545', fontWeight: 'bold' },
  timestamp: { fontSize: '14px', color: '#666', marginTop: '20px' },
  dismissBtn: {
    backgroundColor: '#212529', color: '#fff', border: 'none',
    padding: '15px 30px', fontSize: '18px', fontWeight: 'bold',
    borderRadius: '8px', cursor: 'pointer', width: '100%'
  }
};

export default EmergencySiren;