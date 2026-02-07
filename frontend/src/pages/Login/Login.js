import React, { useState,useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LoginForm from '../../components/Auth/LoginForm';
import { loginWithEmail, resetPassword } from '../../services/authService';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../services/firebase';


const LoginPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleLogin = async ({ email, password }) => {
    setIsSubmitting(true);
    setError('');
    setInfo('');

    const result = await loginWithEmail(email, password);

    if (!result.ok) {
      setError(result.message);
      setIsSubmitting(false);
      return;
    }

  };

  const handleResetPassword = async (email) => {
    if (!email) {
      setError('Please enter your email first.');
      return;
    }

    const result = await resetPassword(email, window.location.href);
    if (!result.ok) {
      setError(result.message);
    } else {
      setInfo('Password reset email sent.');
    }
  };

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {

      navigate('/');
    }
  });

  return () => unsubscribe();
}, [navigate]);


  return (
     <div className="w-full min-h-screen flex items-center justify-center px-4 bg-slate-100">
      <div className="w-full max-w-sm">
        <LoginForm
          onLogin={handleLogin}
          onResetPassword={handleResetPassword}
          isSubmitting={isSubmitting}
          error={error}
          info={info}
        />

        <p className="mt-4 text-center text-sm text-slate-600">
          Don’t have an account?{' '}
          <Link to="/register" className="text-indigo-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
