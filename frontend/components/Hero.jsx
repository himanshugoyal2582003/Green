'use client';

/** Hero section with decorative book art */
export default function Hero({ resultCount, onSell }) {
  return (
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow">
          <span className="eyebrow-dot" /> THE CAMPUS CIRCULAR
        </div>
        <h1>
          Good things
          <br />
          deserve <span className="highlight">another go.</span>
        </h1>
        <p className="hero-desc">
          The books you've outgrown. The cycle you've outpaced. Give them a new
          home, and make someone's day.
        </p>
        <div className="hero-actions">
          <a className="button button-dark button-large" href="#marketplace">
            Find your next favourite <span>↘</span>
          </a>
          <button className="button button-plain" onClick={onSell}>
            I have something to pass on <span>→</span>
          </button>
        </div>
        <div className="hero-social">
          <div className="avatar-stack">
            <i>M</i>
            <i>R</i>
            <i>A</i>
            <i>+</i>
          </div>
          <span>
            <strong>{resultCount}</strong> good things looking for a new home
          </span>
        </div>
      </div>

      <div className="hero-art">
        <div className="art-orbit orbit-one" />
        <div className="art-orbit orbit-two" />
        <div className="art-sun" />
        <div className="art-tag">
          A little less waste
          <br />
          <b>A lot more good.</b>
        </div>
        <div className="art-book book-back">
          <span>
            THE
            <br />
            ART OF
            <br />
            STARTING
          </span>
          <small>again, better</small>
        </div>
        <div className="art-book book-front">
          <div className="book-sun" />
          <span>
            THE
            <br />
            CREATIVE
            <br />
            STUDENT
          </span>
          <small>make room for more</small>
          <div className="book-stem" />
        </div>
        <div className="art-circle" />
        <div className="art-sticker">
          PASSED
          <br />
          ON WITH
          <br />
          <b>LOVE ↗</b>
        </div>
      </div>
    </section>
  );
}
