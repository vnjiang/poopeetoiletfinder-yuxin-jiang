import React, { useState, useEffect } from 'react';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div>
      {!isOnline && (
        <div style={{ color: 'red', position: 'fixed', top: 0, width: '100%', textAlign: 'center' }}>
          You are currently offline. Some features may not be available.
        </div>
      )}
    </div>
  );
};

export default NetworkStatus;
