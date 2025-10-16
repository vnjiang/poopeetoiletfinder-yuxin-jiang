import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// config data from firebase platform
const firebaseConfig = {
  apiKey: "XXXXXX",
  authDomain: "graduate-project-yuxin-ucc.firebaseapp.com",
  projectId: "graduate-project-yuxin-ucc",
  storageBucket: "graduate-project-yuxin-ucc.appspot.com",
  messagingSenderId: "324698453759",
  appId: "1:324698453759:web:a6632c85dd735004207eca",
  measurementId: "G-Q6G9BW7DEK"
};

// initialize firebase
const app = initializeApp(firebaseConfig);

// get authentication service from initialization
const auth = getAuth(app);

// get database service from initialization
const db = getFirestore(app);

export { auth, db, collection, addDoc , signInWithEmailAndPassword, createUserWithEmailAndPassword,sendPasswordResetEmail, updateProfile };