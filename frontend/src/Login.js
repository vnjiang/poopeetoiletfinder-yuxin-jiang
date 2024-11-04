import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, signInWithEmailAndPassword, sendPasswordResetEmail } from './firebase';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetPasswordEmail, setResetPasswordEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();

// for login button click
  const loginAction = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      console.error(error);
      //Handle different error types and provide appropriate hints
      if (error.code === 'auth/wrong-password') {
        alert('Invalid password');
      } else if (error.code === 'auth/user-not-found') {
        alert('User not found');
      } else if (error.code === 'auth/invalid-credential') {
        alert('Invalid credential, please make sure your email and password are correct');
      } else if (error.code === 'auth/too-many-requests') {
        alert('Access to this account has been temporarily disabled due to too many failed login attempts. Please reset your password or try again later.');
      } else {
        alert('Unknown error occurred, please try again later');
      }

    }
  };


// for resetPassword button click
  const resetPasswordAction = async () => {
    try {
      await sendPasswordResetEmail(auth, resetPasswordEmail);
      setResetSent(true);//set status
      alert('Password reset email sent.');
    } catch (error) {
      console.error(error);
      alert('Error sending password reset email');
    }
  };



  return (
    <div className="login-page">
      <h2 className="login-page-title">Login Page</h2>
      {/*Redirect to the register page */}
      <a href="#" className="register-link" onClick={() => navigate('/register')}>
        Don't have an account?
      </a>
      <form onSubmit={loginAction} className="login-page-form">
        <label className="login-page-label">Email</label>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="login-page-input"
          autoComplete="email"//autofill email data from browser
        />

        <label className="login-page-label">Password</label>
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="login-page-input"
          autoComplete="password"//password email data from browser
        />

        <button type="submit" className="login-page-button">Login</button>

      </form>

      <div>
        <a
          href="#"
          className="login-page-link"
          onClick={(e) => {
            e.preventDefault(); 
            //verify if user input email
            if (!email) {
              alert('Please input your email first'); 
            } else {
              setResetPasswordEmail(email); //add email to reset email input box
            }
          }}
        >
          Forgot Password?
        </a>
        {resetPasswordEmail ? (
          <div className="reset-password">
            <h3 className="login-page-title">Reset Password</h3>
            <input
              type="email"
              value={resetPasswordEmail} 
              onChange={(e) => setResetPasswordEmail(e.target.value)}
              className="login-page-input"
            />
            <button className="login-page-button" onClick={resetPasswordAction}>
              Send Reset Email
            </button>
          </div>
        ) : null}
      </div>

    </div >
  );
};

export default Login;