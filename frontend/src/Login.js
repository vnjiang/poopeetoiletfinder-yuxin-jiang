import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, signInWithEmailAndPassword,sendPasswordResetEmail } from './firebase';
import './Login.css'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [resetPasswordEmail, setResetPasswordEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Email:', email);
    console.log('Password:', password);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(-1);
    } catch (error) {
      console.error('Login Error:', error);

      // Provide more detailed error messages based on Firebase Auth error codes
      switch (error.code) {
        case 'auth/invalid-email':
          setError('Invalid email address format. Please enter a valid email.');
          break;
        case 'auth/user-disabled':
          setError('This user has been disabled. Please contact support.');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email address. Please register.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password. Please check your password and try again.');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your connection and try again.');
          break;
        default:
          setError('Login failed: ' + error.message);
          break;
      }
    }
  };


  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, resetPasswordEmail);
      setResetSent(true);
    } catch (error) {
      setError('Error sending password reset email: ' + error.message);
    }
  };


  return (
    <div className="login-page">
      <h2>Login Page</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="login-email">Email:</label>
        <input
          type="email"
          id="login-email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <label htmlFor="login-password">Password:</label>
        <input
          type="password"
          id="login-password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <button type="submit">Login</button>
      </form>

      <div>
        <a href="#" onClick={() => setResetPasswordEmail(email)}>
          Forgot Password?
        </a>
        {resetPasswordEmail && (
          <div className="reset-password-section">
            <h3>Reset Password</h3>
            <input
              type="email"
              value={resetPasswordEmail}
              onChange={(e) => setResetPasswordEmail(e.target.value)}
              placeholder="Enter your email"
            />
            <button onClick={handleResetPassword}>Send Reset Email</button>
            {resetSent && <p>Password reset email sent. Please check your inbox.</p>}
          </div>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Login;