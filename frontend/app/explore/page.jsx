'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useListings } from '@/hooks/useListings';
import { CATEGORIES, CONDITIONS } from '@/lib/utils';
import ListingCard from '@/components/ListingCard';

function ExploreContent() {
  const searchParams = useSearchParams();
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [condition, setCondition] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    const cat = searchParams.get('category');
    const q = searchParams.get('q');
    if (cat !== null) setCategory(cat);
    if (q !== null) setSearch(q);
  }, [searchParams]);

  const { listings, total, loading, error } = useListings({
    category,
    search,
    condition,
    minPrice,
    maxPrice,
  });

  function clearFilters() {
    setCategory('');
    setSearch('');
    setCondition('');
    setMinPrice('');
    setMaxPrice('');
    setVisibleCount(12);
  }

  return (
    <main className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <div className="section-header">
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            CAMPUS MARKETPLACE
          </div>
          <h1 className="section-title" style={{ fontSize: 30 }}>
            Explore second-life finds
          </h1>
          <p className="section-subtitle">
            {loading
              ? 'Loading campus listings…'
              : `${total} available ${total === 1 ? 'item' : 'items'} on campus`}
          </p>
        </div>

        <Link href="/sell" className="btn btn-primary">
          + Sell an item
        </Link>
      </div>

      <div className="filter-panel">
        <div className="tabs-row">
          {CATEGORIES.map((cat) => (
            <button
              key={cat || 'all'}
              type="button"
              className={`tab-btn${category === cat ? ' active' : ''}`}
              onClick={() => {
                setCategory(cat);
                setVisibleCount(12);
              }}
            >
              {cat || 'Everything'}
            </button>
          ))}
        </div>

        <div className="filter-inputs">
          <input
            type="search"
            className="input-control"
            style={{ flex: '1 1 220px' }}
            placeholder="Search books, calculators, cycles…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setVisibleCount(12);
            }}
          />

          <select
            className="input-control"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            aria-label="Condition"
          >
            <option value="">Any condition</option>
            {CONDITIONS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <input
            type="number"
            className="input-control"
            style={{ width: 110 }}
            placeholder="Min ₹"
            min="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <input
            type="number"
            className="input-control"
            style={{ width: 110 }}
            placeholder="Max ₹"
            min="0"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />

          <button type="button" className="btn btn-ghost btn-sm" onClick={clearFilters}>
            Clear
          </button>
        </div>
      </div>

      {error && (
        <div className="form-error" style={{ marginBottom: 20 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="finds-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="listing-card"
              style={{ height: 290, background: '#eef1ec' }}
            />
          ))}
        </div>
      ) : total === 0 ? (
        <div className="card-panel" style={{ textAlign: 'center', padding: '56px 24px' }}>
          <div style={{ fontSize: 32, color: 'var(--forest)', marginBottom: 10 }}>✳</div>
          <h3 style={{ fontFamily: 'var(--display)', margin: '0 0 8px' }}>
            No matching items found
          </h3>
          <p style={{ color: 'var(--muted)', marginBottom: 20 }}>
            Try adjusting your filters or post a request on the Wanted board.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button type="button" className="btn btn-white" onClick={clearFilters}>
              Reset filters
            </button>
            <Link href="/wanted" className="btn btn-primary">
              Go to Wanted board
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="finds-grid">
            {listings.slice(0, visibleCount).map((item) => (
              <ListingCard key={item.id || item._id} item={item} />
            ))}
          </div>

          {total > visibleCount && (
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <button
                type="button"
                className="btn btn-white"
                onClick={() => setVisibleCount((c) => c + 12)}
              >
                Load more items ↓
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: 40 }}>Loading marketplace…</div>}>
      <ExploreContent />
    </Suspense>
  );
}
