'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/components/AuthContext';
import { api } from '@/lib/api';
import { currency } from '@/lib/utils';
import DashboardSidebar, {
  DashboardSettingsPanel,
} from '@/components/DashboardSidebar';

export default function AdminDashboardPage() {
  const { user, authLoading, openAuthModal } = useAuthContext();

  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      setLoading(false);
      return;
    }

    Promise.all([
      api('/api/admin/overview'),
      api('/api/admin/users'),
      api('/api/admin/listings'),
    ])
      .then(([ov, us, ls]) => {
        setOverview(ov);
        setUsers(us.users || []);
        setListings(ls.listings || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading) {
    return (
      <main className="container" style={{ padding: '72px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)' }}>Loading Admin console…</p>
      </main>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <main className="container" style={{ padding: '72px 24px', maxWidth: 520 }}>
        <div className="card-panel" style={{ textAlign: 'center', padding: 42 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>
            ADMIN CONSOLE
          </div>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 24, margin: '0 0 10px' }}>
            Restricted to Admin accounts
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 22 }}>
            {user
              ? `You are signed in as a ${user.role}.`
              : 'Sign in with an administrator account to view platform metrics.'}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => openAuthModal('login', 'admin')}
          >
            Sign in as Admin
          </button>
        </div>
      </main>
    );
  }

  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users', badge: users.length },
    { id: 'listings', label: 'All listings', badge: listings.length },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <main className="container dashboard-layout">
      <DashboardSidebar
        user={user}
        subtitle="Administrator"
        navItems={navItems}
        activeTab={tab}
        onTabChange={setTab}
      />

      <div>
        <div className="section-header" style={{ marginBottom: 20 }}>
          <div>
            <h1 className="section-title" style={{ fontSize: 28 }}>
              Admin console
            </h1>
            <p className="section-subtitle">
              Monitor campus accounts, active listings, and historical price data.
            </p>
          </div>
          <span className="pill pill-lime" style={{ fontSize: 10 }}>
            ADMIN ACCESS
          </span>
        </div>

        {error && (
          <div className="form-error" style={{ marginBottom: 20 }}>
            {error}
          </div>
        )}

        {tab === 'overview' && (
          <>
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-card-label">Registered users</div>
                <div className="stat-card-value">
                  {loading ? '—' : String(overview?.users ?? 0).padStart(2, '0')}
                </div>
                <div className="stat-card-sub">
                  Buyers: {overview?.usersByRole?.buyer ?? 0} · Sellers:{' '}
                  {overview?.usersByRole?.seller ?? 0} · Admins:{' '}
                  {overview?.usersByRole?.admin ?? 0}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card-label">Total listings</div>
                <div className="stat-card-value">
                  {loading ? '—' : String(overview?.listings ?? 0).padStart(2, '0')}
                </div>
                <div className="stat-card-sub">All marketplace items</div>
              </div>

              <div className="stat-card">
                <div className="stat-card-label">Price records</div>
                <div className="stat-card-value">
                  {loading
                    ? '—'
                    : String(overview?.historicalSales ?? 0).padStart(2, '0')}
                </div>
                <div className="stat-card-sub">Used for fair price model</div>
              </div>
            </div>

            <div className="card-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h2 style={{ fontFamily: 'var(--display)', fontSize: 18, margin: 0 }}>
                  Recent listings
                </h2>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setTab('listings')}
                >
                  View all →
                </button>
              </div>
              <ListingsTable listings={listings.slice(0, 5)} />
            </div>
          </>
        )}

        {tab === 'users' && (
          <div className="card-panel">
            <h2 style={{ fontFamily: 'var(--display)', fontSize: 18, margin: '0 0 14px' }}>
              All registered users
            </h2>
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td style={{ fontWeight: 700 }}>{u.name}</td>
                      <td style={{ color: 'var(--muted)' }}>{u.email}</td>
                      <td>
                        <span
                          className={`pill${
                            u.role === 'admin'
                              ? ' pill-lime'
                              : u.role === 'seller'
                              ? ' pill-apricot'
                              : ''
                          }`}
                          style={{ fontSize: 10, textTransform: 'uppercase' }}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td style={{ color: 'var(--muted)', fontSize: 12 }}>
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString('en-IN')
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'listings' && (
          <div className="card-panel">
            <h2 style={{ fontFamily: 'var(--display)', fontSize: 18, margin: '0 0 14px' }}>
              All marketplace listings
            </h2>
            <ListingsTable listings={listings} />
          </div>
        )}

        {tab === 'settings' && <DashboardSettingsPanel user={user} />}
      </div>
    </main>
  );
}

function ListingsTable({ listings }) {
  if (!listings.length) {
    return (
      <p style={{ color: 'var(--muted)', fontSize: 13 }}>No listings found.</p>
    );
  }
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Category</th>
            <th>Seller</th>
            <th>Price</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {listings.map((item) => {
            const id = item.id || item._id;
            return (
              <tr key={id}>
                <td style={{ fontWeight: 700 }}>{item.item}</td>
                <td>{item.category}</td>
                <td style={{ color: 'var(--muted)' }}>
                  {item.owner?.name || 'Campus seller'}
                </td>
                <td style={{ fontWeight: 700 }}>{currency(item.price)}</td>
                <td>
                  <span className="pill" style={{ fontSize: 10, textTransform: 'uppercase' }}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <Link href={`/listings/${id}`} className="btn btn-ghost btn-sm">
                    View
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
