'use client';

import { useEffect, useRef, useState } from 'react';
import { CATEGORIES, currency } from '@/lib/utils';
import { BookIcon, CalculatorIcon } from '@/components/Icons';

const DEFAULT_WANTED = [
  {
    id: 'w1',
    category: 'Books',
    title: 'Engineering Mathematics — Vol. 1',
    note: 'Looking for the latest semester edition. Flexible on highlighting.',
    budget: 200,
    postedAt: 'Posted recently',
  },
  {
    id: 'w2',
    category: 'Calculators',
    title: 'Scientific calculator',
    note: 'Need one for the upcoming semester. Prefer a working Casio model.',
    budget: 700,
    postedAt: 'Posted recently',
  },
  {
    id: 'w3',
    category: 'Cycles',
    title: 'Cycle for daily commute',
    note: 'Looking for a sturdy cycle for getting around campus.',
    budget: 4000,
    postedAt: 'Posted recently',
  },
];

export default function WantedPage() {
  const modalRef = useRef(null);
  const [requests, setRequests] = useState(DEFAULT_WANTED);
  const [respondedId, setRespondedId] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('greenWantedRequests');
      if (saved) setRequests(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  function handleAddRequest(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const next = {
      id: `w-${Date.now()}`,
      category: form.get('category'),
      title: form.get('title'),
      note: form.get('note'),
      budget: Number(form.get('budget')),
      postedAt: 'Just now',
    };
    const updated = [next, ...requests];
    setRequests(updated);
    localStorage.setItem('greenWantedRequests', JSON.stringify(updated));
    e.currentTarget.reset();
    modalRef.current?.close();
  }

  return (
    <main className="container" style={{ paddingBottom: 64 }}>
      <section className="wanted-hero">
        <div>
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            COMMUNITY FEATURE
          </div>
          <h1
            style={{
              fontFamily: 'var(--display)',
              fontSize: 'clamp(30px, 4vw, 42px)',
              fontWeight: 800,
              letterSpacing: '-1px',
              lineHeight: 1.12,
              margin: '0 0 12px',
            }}
          >
            Ask your campus.
            <br />
            Find what you need.
          </h1>
          <p style={{ color: 'var(--muted)', maxWidth: 420, marginBottom: 22 }}>
            Post a wanted request and let students who already own the item find
            you.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={() => modalRef.current?.showModal()}
          >
            Post a wanted request
          </button>
        </div>

        <div className="wanted-hero-art">
          <BookIcon size={64} />
          <CalculatorIcon size={64} />
        </div>
      </section>

      <section style={{ marginTop: 20 }}>
        <h2 className="section-title">Wanted by students</h2>
        <p className="section-subtitle" style={{ marginBottom: 22 }}>
          Requests help match unused items with someone who needs them.
        </p>

        <div className="wanted-grid">
          {requests.map((req) => (
            <article key={req.id} className="wanted-card">
              <div className="wanted-card-top">
                <span className="wanted-cat-circle">{req.category}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {req.postedAt}
                </span>
              </div>

              <h3 style={{ fontFamily: 'var(--display)', fontSize: 17, margin: '4px 0 0' }}>
                {req.title}
              </h3>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
                {req.note}
              </p>

              <div className="wanted-card-bottom">
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)' }}>
                    BUDGET
                  </div>
                  <div style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 800 }}>
                    {currency(req.budget)}
                  </div>
                </div>

                <button
                  type="button"
                  className={respondedId === req.id ? 'btn btn-primary btn-sm' : 'btn btn-white btn-sm'}
                  onClick={() => setRespondedId(req.id)}
                >
                  {respondedId === req.id ? 'Offer noted ✓' : 'I have this'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <dialog
        className="app-dialog"
        ref={modalRef}
        onClick={(e) => {
          if (e.target === modalRef.current) modalRef.current.close();
        }}
      >
        <div className="dialog-body">
          <button
            className="dialog-close"
            type="button"
            aria-label="Close"
            onClick={() => modalRef.current?.close()}
          >
            ×
          </button>
          <div className="eyebrow">WANTED REQUEST</div>
          <h2 style={{ fontFamily: 'var(--display)', fontSize: 24, margin: '8px 0 18px' }}>
            What are you looking for?
          </h2>

          <form onSubmit={handleAddRequest} style={{ display: 'grid', gap: 14 }}>
            <label className="field-group">
              <span className="field-label">Item name</span>
              <input
                className="field-input"
                name="title"
                required
                minLength={2}
                placeholder="e.g. Drafter & scale set"
              />
            </label>

            <label className="field-group">
              <span className="field-label">Category</span>
              <select className="field-select" name="category" defaultValue="Books">
                {CATEGORIES.slice(1).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>

            <label className="field-group">
              <span className="field-label">Budget (₹)</span>
              <input
                className="field-input"
                name="budget"
                type="number"
                min="10"
                required
                placeholder="e.g. 500"
              />
            </label>

            <label className="field-group">
              <span className="field-label">Details</span>
              <textarea
                className="field-textarea"
                name="note"
                rows={2}
                required
                placeholder="Condition preference, edition, or pickup note…"
              />
            </label>

            <button type="submit" className="btn btn-primary btn-lg">
              Post request
            </button>
          </form>
        </div>
      </dialog>
    </main>
  );
}
