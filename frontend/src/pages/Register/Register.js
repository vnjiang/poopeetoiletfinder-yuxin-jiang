import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RegisterForm from '../../components/Auth/RegisterForm';
import { registerWithEmail } from '../../services/authService';
import { mapAuthError } from '../../utils/authErrorMapper';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../services/firebase';


const Register = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async ({ username, email, password }) => {
    setIsSubmitting(true);
    setError('');

    const result = await registerWithEmail(email, password, username);

    if (!result.ok) {
      setError(mapAuthError(result.code));
      setIsSubmitting(false);
      return;
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
    <div className="w-full min-h-screen flex items-center justify-center px-4 bg-slate-100 ">
      <div className="w-full max-w-sm">
        <RegisterForm
          onSubmit={handleRegister}
          isSubmitting={isSubmitting}
          error={error}
        />

        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
