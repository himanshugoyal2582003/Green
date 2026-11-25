'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/components/AuthContext';
import { useSavedItems } from '@/hooks/useSavedItems';
import { useListings } from '@/hooks/useListings';
import { api } from '@/lib/api';
import { currency } from '@/lib/utils';
import { CategoryIcon } from '@/components/Icons';
import DashboardSidebar, {
  DashboardSettingsPanel,
} from '@/components/DashboardSidebar';

export default function BuyerDashboardPage() {
  const { user, authLoading, openAuthModal } = useAuthContext();
  const { savedItems, removeSaved } = useSavedItems();
  const { total: availableCount, listings } = useListings({
    category: '',
    search: '',
    condition: '',
    minPrice: '',
    maxPrice: '',
  });
  const [tab, setTab] = useState('overview');
  const [purchases, setPurchases] = useState([]);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    if (!user) return;
    api('/api/payments/purchases')
      .then((data) => setPurchases(data.purchases || []))
      .catch(() => setPurchases([]));
    api('/api/chats/mine')
      .then((data) => setChats(data.threads || []))
      .catch(() => setChats([]));
  }, [user]);

  if (authLoading) {
    return (
      <main className="container" style={{ padding: '72px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)' }}>Loading Buyer dashboard…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="container" style={{ padding: '72px 24px', maxWidth: 500 }}>
        <div className="card-panel" style={{ textAlign: 'center', padding: 40 }}>
          <h2>Sign in as a Buyer</h2>
          <p style={{ color: 'var(--muted)', marginBottom: 20 }}>
            Access your saved campus finds and wanted requests.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => openAuthModal('login', 'buyer')}
          >
            Sign in
          </button>
        </div>
      </main>
    );
  }

  const navItems = [
    { id: 'overview', label: 'My dashboard' },
    { id: 'chats', label: 'My chats', badge: chats.length },
    { id: 'purchases', label: 'My purchases', badge: purchases.length },
    { id: 'saved', label: 'Saved items', badge: savedItems.length },
    { id: 'explore', label: 'Fresh finds' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <main className="container dashboard-layout">
      <DashboardSidebar
        user={user}
        subtitle="Buyer account"
        navItems={navItems}
        activeTab={tab}
        onTabChange={setTab}
      />

      <div>
        <div className="section-header" style={{ marginBottom: 20 }}>
          <div>
            <h1 className="section-title" style={{ fontSize: 28 }}>
              Buyer space
            </h1>
            <p className="section-subtitle">
              Keep track of saved finds and discover semester essentials.
            </p>
          </div>
          <Link href="/explore" className="btn btn-primary btn-sm">
            Explore marketplace
          </Link>
        </div>

        {(tab === 'overview' || tab === 'saved') && (
          <>
            {tab === 'overview' && (
              <div className="stats-row">
                <div className="stat-card">
                  <div className="stat-card-label">Saved items</div>
                  <div className="stat-card-value">
                    {String(savedItems.length).padStart(2, '0')}
                  </div>
                  <div className="stat-card-sub">Bookmarked for later</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-label">Available on campus</div>
                  <div className="stat-card-value">
                    {String(availableCount).padStart(2, '0')}
                  </div>
                  <div className="stat-card-sub">Ready for pickup</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-label">Purchased</div>
                  <div className="stat-card-value">
                    {String(purchases.length).padStart(2, '0')}
                  </div>
                  <div className="stat-card-sub">Paid via Stripe</div>
                </div>
              </div>
            )}

            <div className="card-panel">
              <h2 style={{ fontFamily: 'var(--display)', fontSize: 18, margin: '0 0 12px' }}>
                Saved items
              </h2>

              {savedItems.length === 0 ? (
                <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>
                  You haven&apos;t saved any items yet.{' '}
                  <Link href="/explore" style={{ color: 'var(--forest)', fontWeight: 700 }}>
                    Browse campus finds →
                  </Link>
                </div>
              ) : (
                savedItems.map((item) => {
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
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{item.item}</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                            {item.category} · {item.condition}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: 'var(--display)', fontWeight: 800 }}>
                            {currency(item.price)}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--muted)' }}>
                            Asking price
                          </div>
                        </div>

                        <Link href={`/listings/${id}`} className="btn btn-white btn-sm">
                          View
                        </Link>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--danger)' }}
                          onClick={() => removeSaved(id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="dash-cta-banner">
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>
                  Can&apos;t find what you need?
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Post a wanted request and let fellow students reach out.
                </div>
              </div>
              <Link href="/wanted" className="btn btn-primary">
                Go to Wanted board
              </Link>
            </div>
          </>
        )}

        {tab === 'chats' && (
          <div className="card-panel">
            <h2 style={{ fontFamily: 'var(--display)', fontSize: 18, margin: '0 0 12px' }}>
              My purchase chats
            </h2>
            {chats.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: 13 }}>
                No active chats yet. Open any listing and click &quot;Message seller to buy&quot;.
              </p>
            ) : (
              chats.map((t) => (
                <div key={t._id} className="dash-list-row">
                  <div>
                    <div style={{ fontWeight: 700 }}>{t.listing?.item || 'Listing'}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      Seller: {t.seller?.name || 'Campus seller'} ·{' '}
                      {currency(t.listing?.price)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      className={`pill${
                        t.status === 'approved'
                          ? ''
                          : t.status === 'pending'
                          ? ' pill-apricot'
                          : ''
                      }`}
                      style={{ fontSize: 10, textTransform: 'uppercase' }}
                    >
                      {t.status}
                    </span>
                    {t.listing?._id && (
                      <Link
                        href={`/listings/${t.listing._id}`}
                        className="btn btn-primary btn-sm"
                      >
                        {t.status === 'approved' && t.listing?.status === 'available'
                          ? 'Buy with Stripe'
                          : 'Open chat'}
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'purchases' && (
          <div className="card-panel">
            <h2 style={{ fontFamily: 'var(--display)', fontSize: 18, margin: '0 0 12px' }}>
              My purchases
            </h2>
            {purchases.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: 13 }}>
                You haven&apos;t purchased any items yet.
              </p>
            ) : (
              purchases.map((item) => (
                <div key={item.id} className="dash-list-row">
                  <div className="dash-row-left">
                    <div className="dash-thumb">
                      {item.images?.length ? (
                        <img src={item.images[0].url} alt={item.item} />
                      ) : (
                        <CategoryIcon category={item.category} size={28} />
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{item.item}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                        Seller: {item.sellerName} · {item.category}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="pill" style={{ fontSize: 10 }}>
                      PAID
                    </span>
                    <strong>{currency(item.price)}</strong>
                    <Link href={`/listings/${item.id}`} className="btn btn-white btn-sm">
                      View
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'explore' && (
          <div className="card-panel">
            <h2 style={{ fontFamily: 'var(--display)', fontSize: 18, margin: '0 0 14px' }}>
              Latest on campus
            </h2>
            {listings.slice(0, 6).map((item) => {
              const id = item.id || item._id;
              return (
                <div key={id} className="dash-list-row">
                  <div className="dash-row-left">
                    <div className="dash-thumb">
                      <CategoryIcon category={item.category} size={28} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{item.item}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                        {item.category} · {item.condition}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <strong>{currency(item.price)}</strong>
                    <Link href={`/listings/${id}`} className="btn btn-white btn-sm">
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'settings' && <DashboardSettingsPanel user={user} />}
      </div>
    </main>
  );
}
