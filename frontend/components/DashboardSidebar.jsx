'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/AuthContext';
import { api } from '@/lib/api';

/**
 * Shared left sidebar for Buyer, Seller, and Admin dashboards.
 */
export default function DashboardSidebar({
  user,
  subtitle,
  navItems,
  activeTab,
  onTabChange,
}) {
  const { logout, setUser } = useAuthContext();
  const router = useRouter();
  const [uploadError, setUploadError] = useState('');

  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <aside className="dash-sidebar">
      <div className="dash-user">
        <div className="dash-avatar">
          {user?.profileImage ? (
            <img src={user.profileImage} alt={user.name} />
          ) : (
            (user?.name || 'U').charAt(0).toUpperCase()
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: 'var(--display)',
              fontWeight: 700,
              fontSize: 14,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {user?.name}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{subtitle}</div>
        </div>
      </div>

      <div className="dash-nav-label">OVERVIEW</div>
      <nav className="dash-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`dash-nav-item${activeTab === item.id ? ' active' : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <span>{item.label}</span>
            {item.badge !== undefined && (
              <span className="pill" style={{ padding: '2px 7px', fontSize: 10 }}>
                {item.badge}
              </span>
            )}
          </button>
        ))}

        <button
          type="button"
          className="dash-nav-item"
          style={{ color: 'var(--danger)', marginTop: 10 }}
          onClick={handleLogout}
        >
          Sign out
        </button>
      </nav>

      {uploadError && (
        <div className="form-error" style={{ marginTop: 12 }}>
          {uploadError}
        </div>
      )}
    </aside>
  );
}

/** Shared profile settings panel used inside the Settings tab of each dashboard */
export function DashboardSettingsPanel({ user }) {
  const { setUser } = useAuthContext();
  const [preview, setPreview] = useState(user?.profileImage || '');
  const [error, setError] = useState('');
  const [savedMsg, setSavedMsg] = useState('');

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setError('');
    setSavedMsg('');
    const body = new FormData();
    body.append('image', file);
    try {
      const data = await api('/api/auth/profile-image', {
        method: 'PATCH',
        body,
      });
      setUser(data.user);
      setPreview(data.user.profileImage);
      setSavedMsg('Profile photo updated.');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="card-panel">
      <h2 style={{ fontFamily: 'var(--display)', fontSize: 20, margin: '0 0 6px' }}>
        Account settings
      </h2>
      <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 22px' }}>
        Signed in as <strong>{user?.email}</strong> ({user?.role})
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div className="dash-avatar" style={{ width: 64, height: 64, fontSize: 22 }}>
          {preview ? (
            <img src={preview} alt={user?.name} />
          ) : (
            (user?.name || 'U').charAt(0).toUpperCase()
          )}
        </div>
        <label className="btn btn-white btn-sm" style={{ cursor: 'pointer' }}>
          Change profile photo
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            hidden
            onChange={handleImageChange}
          />
        </label>
      </div>

      {error && (
        <div className="form-error" style={{ marginTop: 14 }}>
          {error}
        </div>
      )}
      {savedMsg && (
        <div className="form-success" style={{ marginTop: 14 }}>
          {savedMsg}
        </div>
      )}
    </div>
  );
}
