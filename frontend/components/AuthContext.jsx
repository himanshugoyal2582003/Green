'use client';

import { createContext, useContext, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const AuthContext = createContext(null);

export function useAuthContext() {
  return useContext(AuthContext);
}

export default function AppShell({ children }) {
  const { user, setUser, authLoading, login, logout } = useAuth();
  const dialogRef = useRef(null);
  const router = useRouter();

  const [authMode, setAuthMode] = useState('login');
  const [role, setRole] = useState('buyer');
  const [authError, setAuthError] = useState('');
  const [busy, setBusy] = useState(false);

  function openAuthModal(defaultMode = 'login', defaultRole = 'buyer') {
    setAuthMode(defaultMode);
    setRole(defaultRole);
    setAuthError('');
    dialogRef.current?.showModal();
  }

  function closeAuthModal() {
    dialogRef.current?.close();
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setAuthError('');
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());

    try {
      const endpoint = authMode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
      const data = await api(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      login(data.token, data.user);
      closeAuthModal();
      // Route user to their role-specific dashboard if they logged in from "My space"
      router.refresh();
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        authLoading,
        login,
        logout,
        openAuthModal,
      }}
    >
      <Navbar user={user} onOpenAuth={() => openAuthModal('login')} />
      <div style={{ minHeight: 'calc(100vh - 160px)' }}>{children}</div>
      <Footer />

      <dialog
        className="app-dialog"
        ref={dialogRef}
        onClick={(e) => {
          if (e.target === dialogRef.current) closeAuthModal();
        }}
      >
        <div className="dialog-body">
          <button
            className="dialog-close"
            type="button"
            aria-label="Close"
            onClick={closeAuthModal}
          >
            ×
          </button>

          <div className="eyebrow">A GOOD THING STARTS HERE</div>
          <h2 style={{ fontFamily: 'var(--display)', fontSize: 26, margin: '8px 0 6px' }}>
            {authMode === 'signup' ? 'Join Green.' : 'Welcome back.'}
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>
            {authMode === 'signup'
              ? 'Create your campus account as a buyer, seller, or admin.'
              : 'Sign in to open your personal dashboard.'}
          </p>

          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab${authMode === 'login' ? ' active' : ''}`}
              onClick={() => {
                setAuthMode('login');
                setAuthError('');
              }}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`auth-tab${authMode === 'signup' ? ' active' : ''}`}
              onClick={() => {
                setAuthMode('signup');
                setAuthError('');
              }}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} style={{ display: 'grid', gap: 14 }}>
            {authMode === 'signup' && (
              <label className="field-group">
                <span className="field-label">Your name</span>
                <input
                  className="field-input"
                  name="name"
                  required
                  minLength={2}
                  maxLength={60}
                  placeholder="e.g. Asha Rao"
                />
              </label>
            )}

            <label className="field-group">
              <span className="field-label">Email</span>
              <input
                className="field-input"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@campus.edu"
              />
            </label>

            <label className="field-group">
              <span className="field-label">Password</span>
              <input
                className="field-input"
                name="password"
                type="password"
                required
                minLength={8}
                maxLength={72}
                autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                placeholder="At least 8 characters"
              />
            </label>

            {authMode === 'signup' && (
              <>
                <label className="field-group">
                  <span className="field-label">Account role</span>
                  <select
                    className="field-select"
                    name="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="buyer">Buyer — browse & save campus finds</option>
                    <option value="seller">Seller — list & manage items</option>
                    <option value="admin">Admin — oversee marketplace</option>
                  </select>
                </label>

                {role === 'admin' && (
                  <label className="field-group">
                    <span className="field-label">Admin invite key</span>
                    <input
                      className="field-input"
                      name="adminKey"
                      type="password"
                      required
                      autoComplete="off"
                      placeholder="Enter admin invite key"
                    />
                  </label>
                )}
              </>
            )}

            {authError && <div className="form-error">{authError}</div>}

            <button className="btn btn-primary btn-lg" type="submit" disabled={busy}>
              {busy
                ? 'Please wait…'
                : authMode === 'signup'
                ? 'Create account'
                : 'Sign in'}
            </button>
          </form>
        </div>
      </dialog>
    </AuthContext.Provider>
  );
}
