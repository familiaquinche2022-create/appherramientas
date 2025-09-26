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
  }, []);

  const refetch = () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  };

  return { user, loading, refetch };
};