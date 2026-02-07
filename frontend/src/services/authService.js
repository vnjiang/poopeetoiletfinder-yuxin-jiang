import {
  auth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  updateProfile,
} from './firebase';

const mapAuthErrorCode = (code) => {
  switch (code) {
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/missing-email':
      return 'Please enter your email address.';
    case 'auth/email-already-in-use':
      return 'This email is already registered.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      console.error('Unhandled auth error code:', code);
      return 'Something went wrong. Please try again.';
  }
};



export const loginWithEmail = async (email, password) => {



  try {
    const result = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { ok: true, user: result.user };
  } catch (error) {
    return {
      ok: false,
      message: mapAuthErrorCode(error.code),
    };
  }
};


export const resetPassword = async (email, returnUrl) => {
  try {
    await sendPasswordResetEmail(auth, email, {
      url: returnUrl, 
    });
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: mapAuthErrorCode(error.code),
    };
  }
};



export const registerWithEmail = async (email, password, username) => {
  try {
    const { user } = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await updateProfile(user, {
      displayName: username,
    });

    return { ok: true, user };
  } catch (error) {
    return { ok: false, code: error.code };
  }
};