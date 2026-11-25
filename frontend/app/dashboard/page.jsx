'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/AuthContext';

export default function DashboardRedirectPage() {
  const { user, authLoading, openAuthModal } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (user?.role === 'admin') router.replace('/dashboard/admin');
    else if (user?.role === 'seller') router.replace('/dashboard/seller');
    else if (user?.role === 'buyer') router.replace('/dashboard/buyer');
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <main className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)' }}>Loading your space…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="container" style={{ padding: '72px 24px', maxWidth: 520 }}>
        <div className="card-panel" style={{ textAlign: 'center', padding: 44 }}>
          <div style={{ fontSize: 32, color: 'var(--forest)', marginBottom: 10 }}>✳</div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>
            MY SPACE
          </div>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 26, margin: '0 0 10px' }}>
            Sign in to view your dashboard
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>
            Buyers, sellers, and admins each have their own tailored workspace.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => openAuthModal('login')}
            >
              Sign in
            </button>
            <button
              type="button"
              className="btn btn-white"
              onClick={() => openAuthModal('signup')}
            >
              Create account
            </button>
          </div>
        </div>
      </main>
    );
  }

  return null;
}
