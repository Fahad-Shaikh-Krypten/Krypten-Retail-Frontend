import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [offlineToastId, setOfflineToastId] = useState(null);

  useEffect(() => {
    const handleOnline = () => {
      if (wasOffline) {
        toast.success('You are back online');
        setWasOffline(false);
      }

      // Remove the "Please check your internet connection" toast if it is displayed
      if (offlineToastId) {
        toast.dismiss(offlineToastId);
        setOfflineToastId(null);
      }

      setIsOnline(true);
    };

    const handleOffline = () => {
      const id = toast.error('Please check your internet connection', {
        duration: Infinity,
      });
      setOfflineToastId(id); // Store the ID of the toast to dismiss it later
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline, offlineToastId]);

  return null;
};

export default NetworkStatus;
