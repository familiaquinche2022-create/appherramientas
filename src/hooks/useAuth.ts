import { useState, useEffect } from 'react';
import { User } from '../types';
import { getCurrentUser } from '../lib/localStorage';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current user from localStorage
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);
    
    // Listen for storage changes (for login/logout)
    const handleStorageChange = () => {
      const updatedUser = getCurrentUser();
      setUser(updatedUser);
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const refetch = () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  };

  return { user, loading, refetch };
};