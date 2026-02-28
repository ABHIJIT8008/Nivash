import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axiosConfig'; // Our custom Axios instance

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevents the page from refreshing
    setError(''); // Clear any previous errors

    try {
      // 1. Send credentials to our Node.js backend
      const response = await API.post('/auth/login', { phone, password });
      
      // 2. We only want Admins logging into this specific web panel
      if (response.data.role !== 'Admin') {
        setError('Access denied. Only Super Admins can access this panel.');
        return;
      }

      // 3. Save to Global Context & LocalStorage
      login(response.data, response.data.token);
      
      // 4. Redirect to the Dashboard
      navigate('/');
    } catch (err) {
      // Catch errors from the backend (like "Invalid credentials")
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.form}>
        <h2>NIVASH Admin Portal</h2>
        {error && <p style={styles.error}>{error}</p>}
        
        <div style={styles.inputGroup}>
          <label>Admin Phone Number</label>
          <input 
            type="text" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            required 
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={styles.input}
          />
        </div>

        <button type="submit" style={styles.button}>Login</button>
      </form>
    </div>
  );
};

// Some basic inline styles to make it look clean immediately
const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f4f4' },
  form: { backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '300px', display: 'flex', flexDirection: 'column', gap: '1rem' },
  error: { color: 'red', fontSize: '0.875rem', margin: 0 },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  input: { padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' },
  button: { padding: '0.75rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }
};

export default Login;