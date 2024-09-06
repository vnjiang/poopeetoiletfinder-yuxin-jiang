import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, createUserWithEmailAndPassword, updateProfile } from './firebase';
import './Register.css'; 

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update the user profile with the username
      await updateProfile(user, {
        displayName: username,
      });

      navigate('/login');
    } catch (error) {
      console.error('Registration Error:', error);
      setError('Registration failed: ' + error.message);
    }
  };

  return (
    <div className="register-page">
      <h2>Register Page</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="register-username">Username:</label>
        <input
          type="text"
          id="register-username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        
        <label htmlFor="register-email">Email:</label>
        <input
          type="email"
          id="register-email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        
        <label htmlFor="register-password">Password:</label>
        <input
          type="password"
          id="register-password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
        
        <button type="submit">Register</button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Register;
