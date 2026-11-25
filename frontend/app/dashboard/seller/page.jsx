'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/components/AuthContext';
import { useSavedItems } from '@/hooks/useSavedItems';
import { api } from '@/lib/api';
import { currency } from '@/lib/utils';
import { CategoryIcon } from '@/components/Icons';
import DashboardSidebar, {
  DashboardSettingsPanel,
} from '@/components/DashboardSidebar';

export default function SellerDashboardPage() {
  const { user, authLoading, openAuthModal } = useAuthContext();
  const { savedItems } = useSavedItems();

  const [tab, setTab] = useState('dashboard');
  const [myListings, setMyListings] = useState([]);
  const [chats, setChats] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !['seller', 'admin'].includes(user.role)) {
      setLoadingListings(false);
      return;
    }
    Promise.all([api('/api/listings/mine'), api('/api/chats/mine')])
      .then(([ls, ch]) => {
        setMyListings(ls.listings || []);
        setChats(
          (ch.threads || []).filter(
            (t) => (t.seller?._id || t.seller) === user.id
          )
        );
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingListings(false));
  }, [user]);

  async function handleDecision(chatId, decision) {
    try {
      const data = await api(`/api/chats/${chatId}/decision`, {
        method: 'PATCH',
        body: JSON.stringify({ decision }),
      });
      setChats((prev) =>
        prev.map((t) =>
          t._id === chatId
            ? { ...t, status: data.thread.status, messages: data.thread.messages }
            : t
        )
      );
    } catch (err) {
      setError(err.message);
    }
  }

  if (authLoading) {
    return (
      <main className="container" style={{ padding: '72px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)' }}>Loading Seller dashboard…</p>
      </main>
    );
  }

  if (!user || !['seller', 'admin'].includes(user.role)) {
    return (
      <main className="container" style={{ padding: '72px 24px', maxWidth: 520 }}>
        <div className="card-panel" style={{ textAlign: 'center', padding: 42 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>
            SELLER ACCESS
          </div>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 24, margin: '0 0 10px' }}>
            Seller dashboard requires a Seller account
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 22 }}>
            {user
              ? `You are signed in as a ${user.role}.`
              : 'Sign in or create a seller account to manage listings.'}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => openAuthModal('signup', 'seller')}
          >
            Sign in / Create seller account
          </button>
        </div>
      </main>
    );
  }

  const activeListings = myListings.filter((x) => x.status === 'available');
  const soldListings = myListings.filter((x) => x.status !== 'available');

  const pendingRequestsCount = chats.filter((c) => c.status === 'pending').length;

  const navItems = [
    { id: 'dashboard', label: 'My dashboard' },
    { id: 'requests', label: 'Buyer requests', badge: pendingRequestsCount },
    { id: 'listings', label: 'My listings', badge: myListings.length },
    { id: 'saved', label: 'Saved items', badge: savedItems.length },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <main className="container dashboard-layout">
      <DashboardSidebar
        user={user}
        subtitle="Student seller"
        navItems={navItems}
        activeTab={tab}
        onTabChange={setTab}
      />

      <div>
        <div className="section-header" style={{ marginBottom: 20 }}>
          <div>
            <h1 className="section-title" style={{ fontSize: 28 }}>
              My space
            </h1>
            <p className="section-subtitle">
              Manage your listings and see what&apos;s getting attention.
            </p>
          </div>
          <span className="pill" style={{ fontSize: 10 }}>
            SELLER ACCOUNT
          </span>
        </div>

        {error && (
          <div className="form-error" style={{ marginBottom: 20 }}>
            {error}
          </div>
        )}

        {(tab === 'dashboard' || tab === 'listings') && (
          <>
            {tab === 'dashboard' && (
              <div className="stats-row">
                <div className="stat-card">
                  <div className="stat-card-label">Active listings</div>
                  <div className="stat-card-value">
                    {String(activeListings.length).padStart(2, '0')}
                  </div>
                  <div className="stat-card-sub">Items live on campus</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-label">Total posted</div>
                  <div className="stat-card-value">
                    {String(myListings.length).padStart(2, '0')}
                  </div>
                  <div className="stat-card-sub">Across your account</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-label">Completed</div>
                  <div className="stat-card-value">
                    {String(soldListings.length).padStart(2, '0')}
                  </div>
                  <div className="stat-card-sub">Items passed on</div>
                </div>
              </div>
            )}

            <div className="card-panel">
              <h2 style={{ fontFamily: 'var(--display)', fontSize: 18, margin: '0 0 12px' }}>
                Your listings
              </h2>

              {loadingListings ? (
                <p style={{ color: 'var(--muted)', fontSize: 13 }}>
                  Loading your listings…
                </p>
              ) : myListings.length === 0 ? (
                <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>
                  You haven&apos;t listed anything yet.{' '}
                  <Link href="/sell" style={{ color: 'var(--forest)', fontWeight: 700 }}>
                    Create your first listing →
                  </Link>
                </div>
              ) : (
                myListings.map((item) => {
                  const id = item.id || item._id;
                  return (
                    <div key={id} className="dash-list-row">
                      <div className="dash-row-left">
                        <div className="dash-thumb">
                          {item.images?.length ? (
                            <img src={item.images[0].url} alt={item.item} />
                          ) : (
                            <CategoryIcon category={item.category} size={28} />
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{item.item}</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                            {item.category} · {item.condition} condition
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: 'var(--display)', fontWeight: 800 }}>
                            {currency(item.price)}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--muted)' }}>
                            Asking price
                          </div>
                        </div>

                        <span className="pill" style={{ fontSize: 10, textTransform: 'uppercase' }}>
                          {item.status === 'available' ? 'ACTIVE' : item.status}
                        </span>

                        <Link href={`/listings/${id}`} className="btn btn-ghost btn-sm">
                          View
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="dash-cta-banner">
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>
                  Have another useful item?
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Create a new listing and get a fair price suggestion.
                </div>
              </div>
              <Link href="/sell" className="btn btn-primary">
                Create new listing
              </Link>
            </div>
          </>
        )}

        {tab === 'requests' && (
          <div className="card-panel">
            <h2 style={{ fontFamily: 'var(--display)', fontSize: 18, margin: '0 0 12px' }}>
              Buyer requests &amp; chats
            </h2>
            {chats.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: 13 }}>
                No buyer requests yet.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: 14 }}>
                {chats.map((t) => (
                  <div
                    key={t._id}
                    style={{
                      border: '1px solid var(--line)',
                      borderRadius: 12,
                      padding: 16,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 10,
                        marginBottom: 10,
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: 14 }}>
                          {t.listing?.item || 'Listing'}
                        </strong>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                          From {t.buyer?.name || 'Buyer'} ({t.buyer?.email}) ·{' '}
                          {currency(t.listing?.price)}
                        </div>
                      </div>
                      <span className="pill" style={{ fontSize: 10, textTransform: 'uppercase' }}>
                        {t.status}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
                      {t.messages?.slice(-3).map((m, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '6px 10px',
                            borderRadius: 8,
                            background:
                              m.senderRole === 'seller' ? 'var(--sage)' : 'var(--canvas)',
                            fontSize: 12,
                          }}
                        >
                          <strong>{m.senderName}:</strong> {m.text}
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {t.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => handleDecision(t._id, 'approved')}
                          >
                            Approve to buy
                          </button>
                          <button
                            type="button"
                            className="btn btn-white btn-sm"
                            onClick={() => handleDecision(t._id, 'rejected')}
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {t.listing?._id && (
                        <Link
                          href={`/listings/${t.listing._id}`}
                          className="btn btn-ghost btn-sm"
                        >
                          Open chat on listing →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'saved' && (
          <div className="card-panel">
            <h2 style={{ fontFamily: 'var(--display)', fontSize: 18, margin: '0 0 12px' }}>
              Saved items
            </h2>
            {savedItems.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: 13 }}>
                No saved items yet.
              </p>
            ) : (
              savedItems.map((item) => (
                <div key={item.id || item._id} className="dash-list-row">
                  <div className="dash-row-left">
                    <div className="dash-thumb">
                      <CategoryIcon category={item.category} size={28} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{item.item}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                        {item.category} · {currency(item.price)}
                      </div>
                    </div>
                  </div>
                  <Link href={`/listings/${item.id || item._id}`} className="btn btn-white btn-sm">
                    View
                  </Link>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'settings' && <DashboardSettingsPanel user={user} />}
      </div>
    </main>
  );
}
