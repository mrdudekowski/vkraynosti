import { useEffect, useState } from 'react';

const getInitialPageVisibility = () => {
  if (typeof document === 'undefined') {
    return true;
  }
  return document.visibilityState === 'visible';
};

export const useDocumentVisibility = (): boolean => {
  const [isPageVisible, setIsPageVisible] = useState(getInitialPageVisibility);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    const handleVisibilityChange = () => {
      setIsPageVisible(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return isPageVisible;
};
