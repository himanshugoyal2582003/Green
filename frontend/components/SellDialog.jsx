'use client';

import { useRef, useState } from 'react';
import { CATEGORIES, CONDITIONS, currency } from '@/lib/utils';
import { api } from '@/lib/api';

/**
 * Modal dialog for creating a new listing.
 * Props:
 *   dialogRef    — ref forwarded from parent (so parent can open/close)
 *   onPosted     — called with the new listing after successful submit
 */
export default function SellDialog({ dialogRef, onPosted }) {
  const [mode, setMode] = useState('sell');
  const [suggestion, setSuggestion] = useState(null);
  const [posted, setPosted] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await api('/api/listings', {
        method: 'POST',
        body: new FormData(event.currentTarget),
      });
      setSuggestion(data.pricing);
      setPosted(data.listing);
      onPosted(data.listing);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function handleClose() {
    dialogRef.current?.close();
    // Reset for next open
    setSuggestion(null);
    setPosted(null);
    setError('');
    setMode('sell');
  }

  function viewInMarketplace() {
    handleClose();
    document.querySelector('#marketplace')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <dialog
      className="app-dialog"
      ref={dialogRef}
      onClick={(e) => { if (e.target === dialogRef.current) handleClose(); }}
    >
      <form id="sell-form" className="sell-form" onSubmit={handleSubmit}>
        <button className="dialog-close" type="button" aria-label="Close" onClick={handleClose}>
          ×
        </button>

        <div className="eyebrow">YOUR NEXT GOOD DEED</div>
        <h2>
          Let something <span>go.</span>
        </h2>
        <p className="dialog-intro">
          Sell it or find a swap. Either way, we'll show you a fair price from past campus sales.
        </p>

        {posted ? (
          <section className="success-panel">
            <div className="success-icon">✳</div>
            <div className="eyebrow">OUT INTO THE WORLD</div>
            <h2>
              One more good thing, <span>passed on.</span>
            </h2>
            <p>
              "{posted.item}" is live at {currency(posted.price)}.{' '}
              {suggestion?.explanation}
            </p>
            <button type="button" className="button button-dark" onClick={viewInMarketplace}>
              See it in the marketplace <span>↗</span>
            </button>
          </section>
        ) : (
          <>
            <div className="form-grid">
              <label className="field">
                Pass it on by
                <select name="mode" value={mode} onChange={(e) => setMode(e.target.value)}>
                  <option value="sell">Selling</option>
                  <option value="swap">Swapping</option>
                </select>
              </label>

              {mode === 'swap' && (
                <label className="field">
                  Looking for
                  <input name="swapFor" required minLength="2" maxLength="80" placeholder="e.g. a desk lamp" />
                </label>
              )}

              <label className="field wide">
                What are you passing on?
                <input name="item" required minLength="2" maxLength="80" placeholder="e.g. Scientific calculator" />
              </label>

              <label className="field wide">
                Item photos{' '}
                <span className="optional">up to 6 · JPG, PNG, WebP or AVIF · 5 MB each</span>
                <input
                  name="images"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  multiple
                />
              </label>

              <label className="field">
                Category
                <select name="category" required defaultValue="">
                  <option value="" disabled>Choose one</option>
                  {CATEGORIES.slice(1).map((v) => <option key={v}>{v}</option>)}
                </select>
              </label>

              <label className="field">
                Condition
                <select name="condition" required defaultValue="">
                  <option value="" disabled>Choose one</option>
                  {CONDITIONS.map((v) => <option key={v}>{v}</option>)}
                </select>
              </label>

              <label className="field">
                Age (years)
                <input name="age" type="number" min="0" max="30" step="0.5" required placeholder="e.g. 2" />
              </label>

              <label className="field">
                Original price (₹)
                <input name="originalPrice" type="number" min="1" required placeholder="e.g. 1,200" />
              </label>

              <label className="field wide">
                A little about it <span className="optional">optional</span>
                <textarea name="description" maxLength="240" rows="2" placeholder="Anything the next owner should know?" />
              </label>
            </div>

            {suggestion && (
              <div className="price-preview">
                <span className="preview-label">YOUR FAIR STARTING PRICE</span>
                <strong>{currency(suggestion.fairPrice)}</strong>
                <span>
                  Fair range: {currency(suggestion.range.low)}–{currency(suggestion.range.high)} ·{' '}
                  {suggestion.sampleSize} past sales
                </span>
              </div>
            )}

            {error && <div className="form-error">{error}</div>}

            <button className="button button-dark button-submit" type="submit" disabled={busy}>
              {busy ? 'Finding your fair price…' : 'Find my fair price'} <span>↗</span>
            </button>
            <p className="privacy-note">Listings are saved with your seller account.</p>
          </>
        )}
      </form>
    </dialog>
  );
}
