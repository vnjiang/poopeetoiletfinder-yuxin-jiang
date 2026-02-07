
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth'; 
import { fetchUserRole } from '../utils/role';

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState();
const [role, setRole] = useState('user');
const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
  };

useEffect(() => {
  const stopListenUserAuth = auth.onAuthStateChanged(
    async (currentUser) => {
      try {
        setUser(currentUser);

        if (currentUser) {
          const userRole = await fetchUserRole(currentUser.uid);
          setRole(userRole);
        } else {
          setRole('user');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  );

  return () => stopListenUserAuth();
}, []);


  return (
    <AuthContext.Provider value={{ user, role, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
