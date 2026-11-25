'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

/**
 * Manages the authenticated user state.
 * Reads token from localStorage on mount and validates it with the backend.
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('greenToken');
    if (!token) {
      setAuthLoading(false);
      return;
    }
    api('/api/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem('greenToken'))
      .finally(() => setAuthLoading(false));
  }, []);

  function login(token, userData) {
    localStorage.setItem('greenToken', token);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('greenToken');
    setUser(null);
  }

  return { user, setUser, authLoading, login, logout };
}
