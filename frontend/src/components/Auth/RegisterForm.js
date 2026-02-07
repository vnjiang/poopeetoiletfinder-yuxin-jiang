import React, { useState } from 'react';
import { signInWithPopup, getAdditionalUserInfo } from 'firebase/auth';
import { auth, googleProvider } from '../../services/firebase';
import { ensureUserProfile } from '../../services/ensureUserProfile';


const RegisterForm = ({ onSubmit, isSubmitting, error }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [oauthError, setOauthError] = useState('');


  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ username, email, password });
  };

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);

      const { isNewUser } = getAdditionalUserInfo(result);

      if (isNewUser) {
        await ensureUserProfile(result.user);
      }
    } catch (err) {
      setOauthError('Google sign-up was cancelled or failed.');
    }
  };


  return (
    <form
      onSubmit={handleSubmit}
      className="
        bg-white
        rounded-xl
        border border-slate-100
        shadow-sm
        p-6
        space-y-4
      "
    >
   
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          Create account
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Create an account to start using the app
        </p>
      </div>

   
      <div>
        <label htmlFor="reg-username" className="block text-sm font-medium text-slate-700 mb-1">
          Username
        </label>
        <input
        id="reg-username"
          type="text"
          className="
            w-full rounded-lg border border-slate-200
            px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-indigo-500
          "
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

   
      <div>
        <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700 mb-1">
          Email
        </label>
        <input
        id="reg-email" 
          type="email"
          className="
            w-full rounded-lg border border-slate-200
            px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-indigo-500
          "
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

    
      <div>
        <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700 mb-1">
          Password
        </label>
        <input
         id="reg-password" 
          type="password"
          className="
            w-full rounded-lg border border-slate-200
            px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-indigo-500
          "
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

    
      {error && <p className="text-sm text-red-600">{error}</p>}


      <button
        type="submit"
        disabled={isSubmitting}
        className="
          w-full h-10 rounded-lg
          bg-gradient-to-r from-[#1E40AF] to-[#6366F1]
          text-sm font-semibold text-white
          hover:from-[#1D4ED8] hover:to-[#4F46E5]
          disabled:opacity-60
          transition
        "
      >
        {isSubmitting ? 'Creating account...' : 'Create account'}
      </button>

  
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <div className="flex-1 h-px bg-slate-200" />
        OR
        <div className="flex-1 h-px bg-slate-200" />
      </div>


  
      {oauthError && (
        <p className="text-sm text-red-600 text-center">
          {oauthError}
        </p>
      )}


      <button
        type="button"
        disabled={isSubmitting}
        onClick={handleGoogleSignup}
        className="
    w-full h-10
    flex items-center justify-center gap-2
    rounded-lg
    border border-slate-200
    bg-white
    text-sm font-medium text-slate-700
    hover:bg-slate-50
    focus:outline-none
    focus:ring-2 focus:ring-indigo-500
    transition
  "
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google logo"
          className="w-4 h-4"
        />
        <span>Sign up with Google</span>
      </button>


    </form>
  );
};

export default RegisterForm;
