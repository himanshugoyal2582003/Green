'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/components/AuthContext';
import { api } from '@/lib/api';
import { CATEGORIES, CONDITIONS, currency } from '@/lib/utils';

export default function SellPage() {
  const { user, openAuthModal } = useAuthContext();

  const [item, setItem] = useState('');
  const [category, setCategory] = useState('Calculators');
  const [condition, setCondition] = useState('Good');
  const [age, setAge] = useState('2');
  const [originalPrice, setOriginalPrice] = useState('1200');
  const [mode, setMode] = useState('sell');
  const [swapFor, setSwapFor] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);

  const [estimate, setEstimate] = useState(null);
  const [aiInfo, setAiInfo] = useState(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [estError, setEstError] = useState('');
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [posted, setPosted] = useState(null);

  // Live fair price estimate as user edits category / condition / age / originalPrice
  useEffect(() => {
    const yrs = Number(age);
    const orig = Number(originalPrice);
    if (!category || !condition || !Number.isFinite(yrs) || yrs < 0 || !Number.isFinite(orig) || orig <= 0) {
      setEstimate(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setEstError('');
        const data = await api('/api/listings/suggest', {
          method: 'POST',
          body: JSON.stringify({
            category,
            condition,
            age: yrs,
            originalPrice: orig,
          }),
        });
        setEstimate(data);
      } catch (err) {
        setEstimate(null);
        setEstError(err.message);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [category, condition, age, originalPrice]);

  async function handleGeminiLookup() {
    if (!item || item.trim().length < 2) {
      setEstError('Enter an item name first to search its real-world price.');
      return;
    }
    setAiBusy(true);
    setEstError('');
    try {
      const data = await api('/api/listings/ai-price', {
        method: 'POST',
        body: JSON.stringify({
          item: item.trim(),
          category,
          condition,
          age: Number(age) || 1,
        }),
      });
      if (data.aiSource === 'gemini') {
        setOriginalPrice(String(data.originalPrice));
        setEstimate(data);
        setAiInfo({ source: data.aiSource, note: data.aiNote });
      } else {
        setEstError('Could not fetch live Gemini price — using your entered original price.');
      }
    } catch (err) {
      setEstError(err.message);
    } finally {
      setAiBusy(false);
    }
  }

  async function handlePublish(e) {
    e.preventDefault();
    if (!user || !['seller', 'admin'].includes(user.role)) {
      openAuthModal('signup', 'seller');
      return;
    }

    setBusy(true);
    setSubmitError('');

    const formData = new FormData();
    formData.append('item', item);
    formData.append('category', category);
    formData.append('condition', condition);
    formData.append('age', age);
    formData.append('originalPrice', originalPrice);
    formData.append('mode', mode);
    if (mode === 'swap') formData.append('swapFor', swapFor);
    formData.append('description', description);
    for (const f of files) {
      formData.append('images', f);
    }

    try {
      const data = await api('/api/listings', {
        method: 'POST',
        body: formData,
      });
      setPosted(data.listing);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (posted) {
    return (
      <main className="container" style={{ padding: '64px 24px', maxWidth: 620 }}>
        <div className="card-panel" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 36, color: 'var(--forest)', marginBottom: 12 }}>✳</div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>
            OUT INTO THE WORLD
          </div>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 28, margin: '0 0 10px' }}>
            One more good thing, passed on.
          </h1>
          <p style={{ color: 'var(--muted)', marginBottom: 26 }}>
            <strong>{posted.item}</strong> is now live at{' '}
            <strong>{currency(posted.price)}</strong>.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/explore" className="btn btn-primary">
              Browse marketplace
            </Link>
            <Link href="/dashboard/seller" className="btn btn-white">
              Go to Seller dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
      <div style={{ marginBottom: 28 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>
          SELL SOMETHING USEFUL
        </div>
        <h1 className="section-title" style={{ fontSize: 32 }}>
          Give it a second life.
        </h1>
        <p className="section-subtitle">
          List in under a minute. We&apos;ll help you find a fair starting price.
        </p>
      </div>

      {!user && (
        <div className="sage-panel" style={{ marginBottom: 24, padding: '16px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13 }}>
            You need a <strong>Seller</strong> account to publish listings.
          </span>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => openAuthModal('signup', 'seller')}
          >
            Sign in / Create seller account
          </button>
        </div>
      )}

      {user && user.role === 'buyer' && (
        <div className="form-error" style={{ marginBottom: 24 }}>
          You are currently signed in as a <strong>Buyer</strong>. Sign out from
          My space and create a Seller account to list items.
        </div>
      )}

      <form onSubmit={handlePublish} className="sell-layout">
        {/* Left: Item Details */}
        <div className="card-panel">
          <h2 style={{ fontFamily: 'var(--display)', fontSize: 20, margin: '0 0 4px' }}>
            Item details
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 12, margin: '0 0 22px' }}>
            A few quick details help us suggest a fair starting price.
          </p>

          <div className="form-grid-2">
            <label className="field-group">
              <span className="field-label">Item name</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="field-input"
                  required
                  minLength={2}
                  maxLength={80}
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                  placeholder="e.g. Casio fx-991EX"
                />
                <button
                  type="button"
                  className="btn btn-sage btn-sm"
                  onClick={handleGeminiLookup}
                  disabled={aiBusy}
                  title="Search real-world price using Gemini AI"
                >
                  {aiBusy ? 'Searching…' : '✨ AI Price'}
                </button>
              </div>
            </label>

            <label className="field-group">
              <span className="field-label">Category</span>
              <select
                className="field-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.slice(1).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-group">
              <span className="field-label">Product age (years)</span>
              <input
                className="field-input"
                type="number"
                min="0"
                max="30"
                step="0.5"
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </label>

            <label className="field-group">
              <span className="field-label">Original price (₹)</span>
              <input
                className="field-input"
                type="number"
                min="1"
                required
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
              />
            </label>

            <div className="field-group full">
              <span className="field-label">Current condition</span>
              <div className="condition-pills">
                {CONDITIONS.map((cond) => (
                  <button
                    key={cond}
                    type="button"
                    className={`cond-circle-btn${condition === cond ? ' active' : ''}`}
                    onClick={() => setCondition(cond)}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            <label className="field-group">
              <span className="field-label">Pass it on by</span>
              <select
                className="field-select"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <option value="sell">Selling</option>
                <option value="swap">Swapping</option>
              </select>
            </label>

            {mode === 'swap' && (
              <label className="field-group">
                <span className="field-label">Looking for</span>
                <input
                  className="field-input"
                  required
                  minLength={2}
                  maxLength={80}
                  value={swapFor}
                  onChange={(e) => setSwapFor(e.target.value)}
                  placeholder="e.g. a desk lamp"
                />
              </label>
            )}

            <label className="field-group full">
              <span className="field-label">Description (optional)</span>
              <textarea
                className="field-textarea"
                rows={3}
                maxLength={240}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details about usage, accessories, or small marks…"
              />
            </label>

            <div className="field-group full">
              <span className="field-label">Add photos (optional, up to 6)</span>
              <label className="dropzone">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  multiple
                  hidden
                  onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 6))}
                />
                <div style={{ fontSize: 20, marginBottom: 4 }}>+</div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>
                  {files.length
                    ? `${files.length} photo${files.length > 1 ? 's' : ''} selected`
                    : 'Drop photos here or browse files'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                  Clear photos help buyers decide faster
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Live Fair Price Card */}
        <aside className="sage-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span className="eyebrow">YOUR FAIR PRICE</span>
            <span className="pill" style={{ background: 'var(--white)', fontSize: 10 }}>
              LIVE ESTIMATE
            </span>
          </div>

          <div
            style={{
              fontFamily: 'var(--display)',
              fontSize: 40,
              fontWeight: 800,
              color: 'var(--deep)',
              lineHeight: 1.1,
            }}
          >
            {estimate ? currency(estimate.fairPrice) : '—'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            Suggested starting price
          </div>

          {aiInfo && (
            <div
              style={{
                marginTop: 12,
                padding: '8px 12px',
                borderRadius: 10,
                background: 'var(--white)',
                fontSize: 11,
                color: 'var(--deep)',
              }}
            >
              <strong>
                {aiInfo.source === 'gemini' ? '✨ Gemini AI real-world price' : 'Baseline price'}:
              </strong>{' '}
              {currency(originalPrice)} ({aiInfo.note}) → reduced by age &amp; condition index.
            </div>
          )}

          {estimate && (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 18,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                <span>
                  {currency(estimate.range.low)}
                  <br />
                  <small style={{ fontWeight: 400, color: 'var(--muted)' }}>
                    Lower range
                  </small>
                </span>
                <span style={{ textAlign: 'right' }}>
                  {currency(estimate.range.high)}
                  <br />
                  <small style={{ fontWeight: 400, color: 'var(--muted)' }}>
                    Upper range
                  </small>
                </span>
              </div>

              <div className="price-range-bar">
                <div className="price-range-fill" />
              </div>

              <h4 style={{ fontFamily: 'var(--display)', margin: '0 0 6px', fontSize: 14 }}>
                Why this price?
              </h4>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 18px' }}>
                {estimate.explanation}
              </p>
            </>
          )}

          {estError && (
            <p style={{ fontSize: 12, color: 'var(--danger)', margin: '12px 0' }}>
              {estError}
            </p>
          )}

          {submitError && (
            <div className="form-error" style={{ marginBottom: 14 }}>
              {submitError}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: 8 }}
            disabled={busy}
          >
            {busy ? 'Publishing…' : 'Publish listing'}
          </button>

          <p style={{ fontSize: 11, color: 'var(--muted)', margin: '12px 0 0' }}>
            Listings are saved directly to your Seller dashboard.
          </p>
        </aside>
      </form>
    </main>
  );
}
