// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "REMOVED",
  authDomain: "graduate-project-yuxin-ucc.firebaseapp.com",
  projectId: "graduate-project-yuxin-ucc",
  storageBucket: "graduate-project-yuxin-ucc.appspot.com",
  messagingSenderId: "324698453759",
  appId: "1:324698453759:web:a6632c85dd735004207eca",
  measurementId: "G-Q6G9BW7DEK"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

//const analytics = getAnalytics(app);

//export { auth, analytics };


export { auth, db, collection, addDoc , signInWithEmailAndPassword, createUserWithEmailAndPassword,sendPasswordResetEmail, updateProfile };
