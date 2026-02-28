import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator 
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axiosConfig';

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!phone || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Send credentials to our Node.js backend
      const response = await API.post('/auth/login', { phone, password });
      
      // According to our architecture, Admins use the Web Panel, not the Mobile App
      if (response.data.role === 'Admin') {
        setError('Super Admins must use the Web Panel.');
        setLoading(false);
        return;
      }

      // Save to Mobile Context & AsyncStorage
      // Note: We don't manually navigate to a dashboard here! 
      // Updating the Context will automatically switch our navigation stack later.
      await login(response.data, response.data.token);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NIVASH</Text>
      <Text style={styles.subtitle}>Society Management System</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry // Hides the typed characters
        value={password}
        onChangeText={setPassword}
      />

      {/* TouchableOpacity is the standard mobile button because it gives visual feedback when tapped */}
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" /> // Shows a native spinning loader
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
      
      {/* New link to navigate to the Register screen */}
      <TouchableOpacity 
        style={{ marginTop: 20, alignItems: 'center' }} 
        onPress={() => navigation.navigate('Register')} 
      >
        <Text style={{ color: '#007bff', fontSize: 16 }}>
          First time? Claim your account here
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// React Native uses StyleSheet to create CSS-like styling objects
const styles = StyleSheet.create({
  container: {
    flex: 1, // Takes up the whole screen
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007bff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoginScreen;