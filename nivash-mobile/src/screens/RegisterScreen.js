import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator 
} from 'react-native';
import API from '../api/axiosConfig';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegister = async () => {
    if (!phone || !password) {
      setError('Phone and password are required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      // Hit the register endpoint to claim the pre-seeded account
      const response = await API.post('/auth/register', { phone, password, name });
      
      setSuccessMsg('Registration successful! You can now log in.');
      
      // Automatically navigate back to Login after 2 seconds
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Make sure your account was pre-seeded by Admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Claim your pre-seeded society account</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {successMsg ? <Text style={styles.successText}>{successMsg}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Full Name (Optional)"
        value={name}
        onChangeText={setName}
      />

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
        placeholder="Create a Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Already registered? Go to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f4f4f4' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#007bff', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 },
  errorText: { color: 'red', textAlign: 'center', marginBottom: 10 },
  successText: { color: 'green', textAlign: 'center', marginBottom: 10, fontWeight: 'bold' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  linkButton: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#007bff', fontSize: 16 }
});

export default RegisterScreen;