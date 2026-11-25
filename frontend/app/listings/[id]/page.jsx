'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { currency } from '@/lib/utils';
import { CategoryIcon } from '@/components/Icons';
import { useSavedItems } from '@/hooks/useSavedItems';
import { useAuthContext } from '@/components/AuthContext';

const KIND_MAP = {
  Books: 'book',
  Cycles: 'cycle',
  Calculators: 'calculator',
  Electronics: 'electronics',
  'Hostel essentials': 'hostel',
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const { isSaved, toggleSave } = useSavedItems();
  const { user, openAuthModal } = useAuthContext();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Chat & approval state
  const [chatOpen, setChatOpen] = useState(false);
  const [isSellerView, setIsSellerView] = useState(false);
  const [buyerThread, setBuyerThread] = useState(null);
  const [sellerThreads, setSellerThreads] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [replyTexts, setReplyTexts] = useState({});
  const [chatBusy, setChatBusy] = useState(false);
  const [chatError, setChatError] = useState('');

  // Stripe checkout state
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    let active = true;
    api('/api/listings?status=all')
      .then((data) => {
        if (!active) return;
        const found = (data.listings || []).find((x) => (x.id || x._id) === id);
        if (!found) setError('This listing could not be found.');
        else setItem(found);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  // Load chat thread(s) for authenticated users
  useEffect(() => {
    if (!user || !id) return;
    api(`/api/chats/listing/${id}`)
      .then((data) => {
        if (data.isSeller) {
          setIsSellerView(true);
          setSellerThreads(data.threads || []);
        } else {
          setIsSellerView(false);
          setBuyerThread(data.thread || null);
        }
      })
      .catch(() => {});
  }, [user, id]);

  // Verify Stripe Checkout session when redirected back from Stripe
  useEffect(() => {
    const payment = searchParams.get('payment');
    const sessionId = searchParams.get('session_id');

    if (payment === 'cancelled') {
      setPaymentStatus('cancelled');
      return;
    }

    if (payment === 'success' && sessionId && user) {
      api('/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({ sessionId }),
      })
        .then((data) => {
          if (data.paid && data.listing) {
            setItem((prev) =>
              prev ? { ...prev, ...data.listing, status: 'sold' } : data.listing
            );
            setPaymentStatus('success');
          }
        })
        .catch((err) => setPaymentError(err.message));
    }
  }, [searchParams, user]);

  async function handleSendBuyerMessage(e) {
    e.preventDefault();
    if (!user) {
      openAuthModal('login', 'buyer');
      return;
    }
    if (!messageText.trim()) return;
    setChatBusy(true);
    setChatError('');
    try {
      const data = await api(`/api/chats/listing/${id}/message`, {
        method: 'POST',
        body: JSON.stringify({ text: messageText.trim() }),
      });
      setBuyerThread(data.thread);
      setMessageText('');
    } catch (err) {
      setChatError(err.message);
    } finally {
      setChatBusy(false);
    }
  }

  async function handleSellerReply(e, buyerId) {
    e.preventDefault();
    const text = (replyTexts[buyerId] || '').trim();
    if (!text) return;
    setChatBusy(true);
    setChatError('');
    try {
      const data = await api(`/api/chats/listing/${id}/message`, {
        method: 'POST',
        body: JSON.stringify({ text, buyerId }),
      });
      setSellerThreads((prev) =>
        prev.map((t) => (t._id === data.thread._id ? { ...t, messages: data.thread.messages } : t))
      );
      setReplyTexts((prev) => ({ ...prev, [buyerId]: '' }));
    } catch (err) {
      setChatError(err.message);
    } finally {
      setChatBusy(false);
    }
  }

  async function handleDecision(chatId, decision) {
    setChatBusy(true);
    setChatError('');
    try {
      const data = await api(`/api/chats/${chatId}/decision`, {
        method: 'PATCH',
        body: JSON.stringify({ decision }),
      });
      setSellerThreads((prev) =>
        prev.map((t) =>
          t._id === chatId
            ? { ...t, status: data.thread.status, messages: data.thread.messages }
            : t
        )
      );
    } catch (err) {
      setChatError(err.message);
    } finally {
      setChatBusy(false);
    }
  }

  async function handleBuyWithStripe() {
    if (!user) {
      openAuthModal('login', 'buyer');
      return;
    }
    setCheckoutBusy(true);
    setPaymentError('');
    try {
      const data = await api('/api/payments/checkout', {
        method: 'POST',
        body: JSON.stringify({ listingId: item.id || item._id }),
      });
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setPaymentError(err.message);
      setCheckoutBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="container" style={{ padding: '48px 24px' }}>
        <div style={{ height: 400, background: '#eef1ec', borderRadius: 20 }} />
      </main>
    );
  }

  if (error || !item) {
    return (
      <main className="container" style={{ padding: '64px 24px', textAlign: 'center' }}>
        <h2>{error || 'Listing not found'}</h2>
        <Link href="/explore" className="btn btn-primary" style={{ marginTop: 12 }}>
          Back to Explore
        </Link>
      </main>
    );
  }

  const kind = KIND_MAP[item.category] || 'book';
  const saved = isSaved(item.id || item._id);
  const isSold = item.status === 'sold';
  const isApproved = buyerThread?.status === 'approved';

  return (
    <main className="container" style={{ paddingTop: 28, paddingBottom: 64 }}>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/explore">Explore</Link>
        <span>/</span>
        <Link href={`/explore?category=${encodeURIComponent(item.category)}`}>
          {item.category}
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--deep)', fontWeight: 600 }}>{item.item}</span>
      </nav>

      {paymentStatus === 'success' && (
        <div className="form-success" style={{ marginBottom: 20 }}>
          Payment successful! <strong>{item.item}</strong> is now yours. Check your{' '}
          <Link href="/dashboard/buyer" style={{ textDecoration: 'underline' }}>
            Buyer dashboard
          </Link>{' '}
          to view your purchases.
        </div>
      )}

      {paymentStatus === 'cancelled' && (
        <div className="form-error" style={{ marginBottom: 20 }}>
          Checkout was cancelled. No charge was made.
        </div>
      )}

      <div className="detail-grid">
        {/* Left: Visual */}
        <div className={`detail-visual visual-${kind}`}>
          {item.images?.length ? (
            <img src={item.images[0].url} alt={item.item} />
          ) : (
            <>
              <div className="detail-cond-circle">
                {item.condition}
                <br />
                condition
              </div>
              <CategoryIcon category={item.category} size={90} />
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                Illustrative product image
              </span>
            </>
          )}
        </div>

        {/* Right: Details */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span className="eyebrow">{item.category.toUpperCase()} / CAMPUS FINDS</span>
            {isSold && (
              <span className="pill pill-apricot" style={{ fontSize: 10 }}>
                SOLD
              </span>
            )}
          </div>

          <h1
            style={{
              fontFamily: 'var(--display)',
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: '-0.8px',
              margin: '0 0 10px',
            }}
          >
            {item.item}
          </h1>

          <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>
            {item.description || 'A pre-loved campus essential, ready for a new owner.'}
          </p>

          <div className="detail-seller-box">
            <div className="seller-avatar">
              {(item.sellerName || 'S').charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>
                {item.sellerName || 'Student seller'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                Campus pickup · Verified account
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div
              style={{
                fontFamily: 'var(--display)',
                fontSize: 34,
                fontWeight: 800,
                color: 'var(--deep)',
              }}
            >
              {currency(item.price)}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
              Original price {currency(item.originalPrice)}
              {item.mode === 'swap' && item.swapFor
                ? ` · Open to swap for: ${item.swapFor}`
                : ''}
            </div>
          </div>

          <div className="why-price-box">
            <h4>Why this price?</h4>
            <p>
              The recommendation considers the item&apos;s age, condition, and
              comparable historical campus sales.
            </p>
            <div className="why-price-meta">
              <span>
                {item.age} yr{item.age === 1 ? '' : 's'} used
              </span>
              <span>{item.condition}</span>
              <span>{item.category}</span>
            </div>
          </div>

          {paymentError && (
            <div className="form-error" style={{ marginBottom: 14 }}>
              {paymentError}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {!isSellerView && (
              <button
                type="button"
                className="btn btn-primary btn-lg"
                disabled={isSold || checkoutBusy || !isApproved}
                onClick={handleBuyWithStripe}
                title={
                  !isApproved
                    ? 'Ask the seller in chat and get approval first'
                    : 'Pay with Stripe'
                }
              >
                {isSold
                  ? 'Already sold'
                  : checkoutBusy
                  ? 'Redirecting to Stripe…'
                  : isApproved
                  ? `Buy now · ${currency(item.price)}`
                  : 'Buy (Needs seller approval)'}
              </button>
            )}

            <button
              type="button"
              className={isSellerView ? 'btn btn-primary btn-lg' : 'btn btn-sage btn-lg'}
              onClick={() => {
                if (!user) {
                  openAuthModal('login', 'buyer');
                  return;
                }
                setChatOpen((v) => !v);
              }}
            >
              {chatOpen
                ? 'Hide chat'
                : isSellerView
                ? `Buyer requests (${sellerThreads.length})`
                : buyerThread
                ? 'Open chat'
                : 'Message seller to buy'}
            </button>

            <button
              type="button"
              className="btn btn-white btn-lg"
              onClick={() => toggleSave(item)}
            >
              {saved ? '♥ Saved' : '♡ Save item'}
            </button>
          </div>

          {/* Buyer status helper banner */}
          {!isSellerView && !isSold && (
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)' }}>
              {!buyerThread &&
                'Step 1: Click "Message seller to buy" to ask the seller. Step 2: Once approved, pay securely with Stripe.'}
              {buyerThread?.status === 'pending' && (
                <span className="pill pill-apricot">
                  ⏳ Waiting for seller approval
                </span>
              )}
              {buyerThread?.status === 'approved' && (
                <span className="pill">
                  ✓ Seller approved! You can now click Buy now.
                </span>
              )}
              {buyerThread?.status === 'rejected' && (
                <span className="pill" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
                  Seller declined this request
                </span>
              )}
            </div>
          )}

          {/* Inline Chat Panel */}
          {chatOpen && user && (
            <div className="card-panel" style={{ marginTop: 20, padding: 20 }}>
              <h3 style={{ fontFamily: 'var(--display)', fontSize: 16, margin: '0 0 12px' }}>
                {isSellerView ? 'Incoming buyer requests' : 'Chat with seller'}
              </h3>

              {chatError && (
                <div className="form-error" style={{ marginBottom: 12 }}>
                  {chatError}
                </div>
              )}

              {!isSellerView ? (
                <>
                  <div
                    style={{
                      display: 'grid',
                      gap: 8,
                      maxHeight: 220,
                      overflowY: 'auto',
                      marginBottom: 12,
                    }}
                  >
                    {!buyerThread?.messages?.length ? (
                      <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
                        Ask the seller if this item is available and request to buy.
                      </p>
                    ) : (
                      buyerThread.messages.map((m, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '8px 12px',
                            borderRadius: 10,
                            background:
                              m.senderRole === 'buyer' ? 'var(--sage)' : 'var(--canvas)',
                            fontSize: 12,
                          }}
                        >
                          <strong>{m.senderName}:</strong> {m.text}
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleSendBuyerMessage} style={{ display: 'flex', gap: 8 }}>
                    <input
                      className="field-input"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Hi, I'd like to buy this. Is it available?"
                      maxLength={500}
                      required
                    />
                    <button type="submit" className="btn btn-primary btn-sm" disabled={chatBusy}>
                      Send
                    </button>
                  </form>
                </>
              ) : sellerThreads.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
                  No buyer messages for this listing yet.
                </p>
              ) : (
                <div style={{ display: 'grid', gap: 16 }}>
                  {sellerThreads.map((t) => {
                    const bId = t.buyer?._id || t.buyer;
                    return (
                      <div
                        key={t._id}
                        style={{
                          border: '1px solid var(--line)',
                          borderRadius: 12,
                          padding: 14,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 10,
                          }}
                        >
                          <strong style={{ fontSize: 13 }}>
                            {t.buyer?.name || 'Buyer'}
                          </strong>
                          <span className="pill" style={{ fontSize: 10, textTransform: 'uppercase' }}>
                            {t.status}
                          </span>
                        </div>

                        <div style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
                          {t.messages.map((m, idx) => (
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

                        {t.status === 'pending' && (
                          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              disabled={chatBusy}
                              onClick={() => handleDecision(t._id, 'approved')}
                            >
                              Approve to buy
                            </button>
                            <button
                              type="button"
                              className="btn btn-white btn-sm"
                              disabled={chatBusy}
                              onClick={() => handleDecision(t._id, 'rejected')}
                            >
                              Decline
                            </button>
                          </div>
                        )}

                        <form onSubmit={(e) => handleSellerReply(e, bId)} style={{ display: 'flex', gap: 8 }}>
                          <input
                            className="field-input"
                            value={replyTexts[bId] || ''}
                            onChange={(e) =>
                              setReplyTexts((prev) => ({ ...prev, [bId]: e.target.value }))
                            }
                            placeholder="Reply to buyer…"
                            maxLength={500}
                          />
                          <button type="submit" className="btn btn-sage btn-sm" disabled={chatBusy}>
                            Reply
                          </button>
                        </form>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
