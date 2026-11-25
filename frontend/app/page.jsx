'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useListings } from '@/hooks/useListings';
import ListingCard from '@/components/ListingCard';
import { BookIcon, CalculatorIcon, CycleIcon } from '@/components/Icons';

export default function HeroLandingPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [pickup, setPickup] = useState('Campus pickup');

  const { listings, loading } = useListings({
    category: '',
    search: '',
    condition: '',
    minPrice: '',
    maxPrice: '',
  });

  function handleSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    router.push(`/explore${params.toString() ? `?${params}` : ''}`);
  }

  return (
    <main>
      {/* ── Deep Forest Hero Banner ── */}
      <section className="hero-banner">
        <div className="container hero-grid">
          <div>
            <div className="hero-eyebrow">THE CAMPUS MARKETPLACE</div>
            <h1 className="hero-title">
              Good things
              <br />
              deserve a second life.
            </h1>
            <p className="hero-subtitle">
              Find books, calculators and cycles your next semester needs — at a
              price that feels fair.
            </p>
            <div className="hero-cta-row">
              <Link href="/explore" className="btn btn-primary btn-lg" style={{ background: '#265c42' }}>
                Explore marketplace
              </Link>
              <a href="#how" className="btn btn-white btn-lg">
                How it works
              </a>
            </div>
          </div>

          <div className="hero-cards">
            <Link href="/explore?category=Books" className="hero-icon-card">
              <div className="hero-icon-box book">
                <BookIcon size={48} />
              </div>
              <span className="hero-icon-label">READ AGAIN</span>
            </Link>
            <Link href="/explore?category=Calculators" className="hero-icon-card">
              <div className="hero-icon-box calc">
                <CalculatorIcon size={48} />
              </div>
              <span className="hero-icon-label">SOLVE MORE</span>
            </Link>
            <Link href="/explore?category=Cycles" className="hero-icon-card">
              <div className="hero-icon-box cycle">
                <CycleIcon size={52} />
              </div>
              <span className="hero-icon-label">RIDE ON</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Value Prop Strip ── */}
      <section className="value-strip">
        <div className="container value-grid">
          <div className="value-item">
            <h4>01 FAIR PRICE SUGGESTIONS</h4>
            <p>Know what a used item is worth before you list.</p>
          </div>
          <div className="value-item">
            <h4>02 CAMPUS-FIRST</h4>
            <p>Discover useful finds from fellow students.</p>
          </div>
          <div className="value-item">
            <h4>03 LESS WASTE</h4>
            <p>Keep good things in circulation for longer.</p>
          </div>
        </div>
      </section>

      {/* ── Quick Search Bar ── */}
      <section className="search-section">
        <div className="container">
          <form className="search-bar" onSubmit={handleSearch}>
            <div className="search-input-wrap">
              <span style={{ color: 'var(--muted)' }}>⌕</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search books, calculators, cycles..."
              />
            </div>
            <select value={pickup} onChange={(e) => setPickup(e.target.value)}>
              <option>Campus pickup</option>
              <option>Hostel gate</option>
              <option>Library steps</option>
            </select>
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* ── A Better Start to the Semester ── */}
      <section className="page-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">A better start to the semester</h2>
              <p className="section-subtitle">
                Find a second-hand essential ready for its next owner.
              </p>
            </div>
          </div>

          <div className="semester-grid">
            <Link href="/explore?category=Books" className="cat-tile">
              <div className="cat-dot">
                <BookIcon size={18} />
              </div>
              <div>
                <h3>Books</h3>
                <p>Textbooks, notes &amp; more</p>
              </div>
            </Link>

            <Link href="/explore?category=Calculators" className="cat-tile">
              <div className="cat-dot">
                <CalculatorIcon size={18} />
              </div>
              <div>
                <h3>Calculators</h3>
                <p>Scientific &amp; everyday</p>
              </div>
            </Link>

            <Link href="/explore?category=Cycles" className="cat-tile">
              <div className="cat-dot">
                <CycleIcon size={20} />
              </div>
              <div>
                <h3>Cycles</h3>
                <p>Ride around campus</p>
              </div>
            </Link>

            <div className="wanted-callout">
              <div>
                <div className="eyebrow">LOOKING FOR SOMETHING SPECIFIC?</div>
                <h3>Let your campus know.</h3>
              </div>
              <div className="wanted-callout-bottom">
                <p>Post a request. A fellow student might have it.</p>
                <Link href="/wanted" className="btn btn-white btn-sm">
                  Explore wanted →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Fresh Finds From Campus ── */}
      <section className="page-section" style={{ paddingTop: 12 }}>
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Fresh finds from campus</h2>
              <p className="section-subtitle">
                Pre-loved items posted by students on your campus
              </p>
            </div>
            <Link href="/explore" className="pill">
              View all →
            </Link>
          </div>

          <div className="finds-grid">
            {loading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="listing-card"
                  style={{ height: 290, background: '#eef1ec' }}
                />
              ))
            ) : (
              listings.slice(0, 3).map((item) => (
                <ListingCard key={item.id || item._id} item={item} />
              ))
            )}

            <div className="thoughtful-card">
              <div>
                <div className="eyebrow">A LITTLE CHECK GOES A LONG WAY</div>
                <h3>
                  Good finds.
                  <br />
                  Thoughtful choices.
                </h3>
                <ul className="thoughtful-list">
                  <li>
                    <span>01</span> Ask about the item&apos;s condition
                  </li>
                  <li>
                    <span>02</span> Compare the price and details
                  </li>
                  <li>
                    <span>03</span> Meet on campus. Check before paying.
                  </li>
                </ul>
              </div>
              <p className="thoughtful-foot">Make the next semester a little greener.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how" className="page-section">
        <div className="container">
          <div className="section-header">
            <div>
              <div className="eyebrow" style={{ marginBottom: 6 }}>
                SIMPLE CAMPUS EXCHANGES
              </div>
              <h2 className="section-title">How it works</h2>
            </div>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-num">01 / BROWSE</div>
              <h3>Find your next semester essential</h3>
              <p>
                Filter by category, condition, or price. Save items to compare
                before messaging.
              </p>
            </div>
            <div className="step-card">
              <div className="step-num">02 / FAIR PRICING</div>
              <h3>Data-backed starting prices</h3>
              <p>
                Every listing gets a fair price range based on age, condition,
                and past campus sales.
              </p>
            </div>
            <div className="step-card">
              <div className="step-num">03 / MEET ON CAMPUS</div>
              <h3>Inspect &amp; pass it on</h3>
              <p>
                Meet at the library or hostel gate, check the item in person,
                and give it a second life.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
