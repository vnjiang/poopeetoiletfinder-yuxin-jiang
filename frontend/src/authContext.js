
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from './firebase';
import { signOut } from 'firebase/auth'; 

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState();
  //for logout action
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
  };
  
  /// listen the status of user auth
  useEffect(() => {
    const stopListenUserAuth = auth.onAuthStateChanged((currentUser) => {
      try {
        setUser(currentUser);
      } catch (error) {
        console.error(error);
      }
    });
    return () => stopListenUserAuth();
  }, []);

  //give user and logout methods to child components
  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
