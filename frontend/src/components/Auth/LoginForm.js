import React, { useState } from 'react';
import { signInWithPopup,getAdditionalUserInfo } from 'firebase/auth';
import { auth, googleProvider } from '../../services/firebase';
import { ensureUserProfile } from '../../services/ensureUserProfile';

const LoginForm = ({
  onLogin,
  onResetPassword,
  isSubmitting,
  error,
  info,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ email, password });
  };


const handleGoogleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
 const { isNewUser } = getAdditionalUserInfo(result);
 
    if (isNewUser) {
      await ensureUserProfile(result.user);
    }


  } catch (err) {
    console.error(err);
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
          Sign in
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Welcome back, please login to continue
        </p>
      </div>

    
      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1">
          Email
        </label>
        <input
        id="login-email"
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
        <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-1">
          Password
        </label>
        <input
        id="login-password"
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
      {info && <p className="text-sm text-emerald-600">{info}</p>}

 
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
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </button>

      <button
        type="button"
        onClick={() => onResetPassword(email)}
        className="text-sm text-indigo-600 hover:underline"
      >
        Forgot password?
      </button>


      <div className="flex items-center gap-2 text-xs text-slate-400">
        <div className="flex-1 h-px bg-slate-200" />
        OR
        <div className="flex-1 h-px bg-slate-200" />
      </div>


      <button
        type="button"
        onClick={handleGoogleLogin}
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
        <span>Continue with Google</span>
      </button>

    </form>
  );
};

export default LoginForm;
