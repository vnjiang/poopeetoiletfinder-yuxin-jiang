import { useEffect, useState } from 'react';
import { auth } from '../services/firebase';

export const useAuthUser = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  return user;
};
