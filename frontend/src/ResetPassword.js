// ResetPassword.js
import React, { useState } from 'react';
import { auth } from './firebase';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleResetPassword = async () => {
    try {
      await auth.sendPasswordResetEmail(email);
      setMessage('Password reset email sent.');
    } catch (error) {
      setMessage('Error sending password reset email: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
      />
      <button onClick={handleResetPassword}>Reset Password</button>
      <p>{message}</p>
    </div>
  );
};

export default ResetPassword;
