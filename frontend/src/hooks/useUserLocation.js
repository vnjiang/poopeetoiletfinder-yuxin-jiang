import { useEffect, useState } from 'react';
import { getUserLocation } from '../utils/utils';

export const useUserLocation = () => {
  const [center, setCenter] = useState(null);

  useEffect(() => {
    getUserLocation(setCenter);
  }, []);

  return {
    center,
    locate: () => getUserLocation(setCenter),
  };
};
