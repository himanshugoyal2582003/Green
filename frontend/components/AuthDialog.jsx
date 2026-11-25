'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

/**
 * Auth + Account dialog.
 * Props:
 *   dialogRef  — ref for the <dialog> element
 *   user       — authenticated user (or null)
 *   onLogin    — called with (token, user) after successful login/signup
 *   onLogout   — called on sign-out
 *   setUser    — setter so profile-image updates propagate
 */
export default function AuthDialog({ dialogRef, user, onLogin, onLogout, setUser }) {
  const [panel, setPanel] = useState('auth');   // 'auth' | 'account'
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');
  const [accountError, setAccountError] = useState('');
  const [busy, setBusy] = useState(false);
  const [adminStats, setAdminStats] = useState(null);
  const [myListingCount, setMyListingCount] = useState(null);
  const [profilePreview, setProfilePreview] = useState('');

  function open(mode = 'auth') {
    setPanel(mode);
    setAuthError('');
    setAccountError('');
    if (mode === 'account' && user?.role === 'admin') {
      api('/api/admin/overview').then(setAdminStats).catch(() => setAdminStats(null));
    }
    setProfilePreview(user?.profileImage || '');
    dialogRef.current?.showModal();
  }
  // Expose open() to parent via imperative handle — parent holds the ref anyway so we just export it
  AuthDialog.open = open;

  function close() {
    dialogRef.current?.close();
  }

  async function handleAuth(event) {
    event.preventDefault();
    setBusy(true);
    setAuthError('');
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const data = await api(`/api/auth/${authMode === 'signup' ? 'signup' : 'login'}`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      onLogin(data.token, data.user);
      close();
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleProfileImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setProfilePreview(URL.createObjectURL(file));
    setAccountError('');
    const body = new FormData();
    body.append('image', file);
    try {
      const data = await api('/api/auth/profile-image', { method: 'PATCH', body });
      setUser(data.user);
      setProfilePreview(data.user.profileImage);
    } catch (err) {
      setAccountError(err.message);
    }
  }

  async function handleShowMyListings() {
    try {
      const data = await api('/api/listings/mine');
      setMyListingCount(data.total);
    } catch (err) {
      setAccountError(err.message);
    }
  }

  function handleLogout() {
    onLogout();
    close();
  }

  return (
    <dialog
      className="app-dialog auth-dialog"
      ref={dialogRef}
      onClick={(e) => { if (e.target === dialogRef.current) close(); }}
    >
      {panel === 'auth' || !user ? (
        <section className="auth-panel">
          <button className="dialog-close" type="button" aria-label="Close" onClick={close}>
            ×
          </button>
          <div className="eyebrow">A GOOD THING STARTS HERE</div>
          <h2>
            {authMode === 'signup' ? (
              <>Join the <span>good.</span></>
            ) : (
              <>Welcome <span>back.</span></>
            )}
          </h2>
          <p className="dialog-intro">
            {authMode === 'signup'
              ? 'Create your campus account and pass good things on.'
              : 'Sign in to pass things on or keep browsing.'}
          </p>

          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab${authMode === 'login' ? ' active' : ''}`}
              onClick={() => { setAuthMode('login'); setAuthError(''); }}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`auth-tab${authMode === 'signup' ? ' active' : ''}`}
              onClick={() => { setAuthMode('signup'); setAuthError(''); }}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleAuth} className="auth-form">
            {authMode === 'signup' && (
              <label className="field">
                Your name
                <input name="name" required minLength="2" maxLength="60" placeholder="e.g. Asha Rao" />
              </label>
            )}
            <label className="field">
              Email
              <input name="email" type="email" required autoComplete="email" placeholder="you@campus.edu" />
            </label>
            <label className="field">
              Password
              <input
                name="password"
                type="password"
                required
                minLength="8"
                maxLength="72"
                autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                placeholder="At least 8 characters"
              />
            </label>
            {authMode === 'signup' && (
              <>
                <label className="field">
                  I'm here as a
                  <select name="role" id="auth-role" defaultValue="buyer">
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
                <label className="field">
                  Admin invite key <span className="optional">only for admins</span>
                  <input name="adminKey" type="password" autoComplete="off" placeholder="Enter if registering as admin" />
                </label>
              </>
            )}
            {authError && <div className="form-error">{authError}</div>}
            <button className="button button-dark button-submit" type="submit" disabled={busy}>
              {busy ? 'Please wait…' : authMode === 'signup' ? 'Create account' : 'Sign in'}{' '}
              <span>↗</span>
            </button>
          </form>
          <p className="privacy-note">Passwords are stored as secure hashes.</p>
        </section>
      ) : (
        <section className="account-panel">
          <button className="dialog-close" type="button" aria-label="Close" onClick={close}>
            ×
          </button>
          <div className="eyebrow">YOUR GREEN ACCOUNT</div>
          <h2>
            Hey, <span>{user.name?.split(' ')[0] || 'friend'}.</span>
          </h2>
          <p className="account-role">
            {user.role} account · {user.email}
          </p>

          <div className="profile-image-editor">
            <img
              className={profilePreview ? 'has-image' : ''}
              src={profilePreview || undefined}
              alt="Your profile"
            />
            <label className="button button-outline" htmlFor="profile-image">
              Choose photo
            </label>
            <input
              id="profile-image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              hidden
              onChange={handleProfileImage}
            />
          </div>

          {accountError && <div className="form-error">{accountError}</div>}

          {user.role === 'admin' && (
            <div className="account-stats">
              {adminStats
                ? `${adminStats.users} accounts · ${adminStats.listings} listings · ${adminStats.historicalSales} price records`
                : 'Loading admin overview…'}
            </div>
          )}

          {['seller', 'admin'].includes(user.role) && (
            <>
              <button className="button button-outline" type="button" onClick={handleShowMyListings}>
                View my listings
              </button>
              {myListingCount !== null && (
                <div className="account-stats">
                  You have {myListingCount} listing{myListingCount === 1 ? '' : 's'}.
                </div>
              )}
            </>
          )}

          <button className="button button-dark" type="button" onClick={handleLogout}>
            Sign out
          </button>
        </section>
      )}
    </dialog>
  );
}
