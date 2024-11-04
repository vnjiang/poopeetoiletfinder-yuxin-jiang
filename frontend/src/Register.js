import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, createUserWithEmailAndPassword, updateProfile } from './firebase';
import './Register.css'; 

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

// handle the registration form submission and button click
  const registerAction = async (e) => {
    e.preventDefault();// prevent default behavior of the event like submission
    try {
      //if registration is successful
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, {
        displayName: username,
      });
      alert('Congrats! You have succesffuly registered');
      navigate('/login');
    } catch (error) {
      console.error(error);
        //alert for different types of errors
      if (error.code === 'auth/email-already-in-use') {
        alert('Email already in use');
      } else if (error.code === 'auth/invalid-email') {
        alert('Invalid email');
      } else if (error.code === 'auth/weak-password') {
        alert('Password must be at least 6 characters.');
      } else {
        alert('Unknown error occurred, please try again later');
      }      
    }
  };

  return (
    <div className="register-page">
      <h2 className="register-page-title">Register Page</h2>
       {/*link to login page */}
      <a href="#" className="login-link" onClick={() => navigate('/login')}>
        Already have an account?
      </a>
       {/*register form*/}
      <form onSubmit={registerAction} className="register-page-form">
        <label className="register-page-label">Username:</label>
        <input
          type="text"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="register-page-input"
        />
        
        <label className="register-page-label">Email:</label>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="register-page-input"
        />
        
        <label className="register-page-label">Password:</label>
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="register-page-input"
        />
        
        <button type="submit" className="register-page-button">Register</button>
      </form>
    </div>
  );
};

export default Register;
