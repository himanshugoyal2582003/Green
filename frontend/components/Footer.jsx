import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <Link href="/" style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 18 }}>
          green.
        </Link>

        <div className="footer-links">
          <Link href="/#how">How it works</Link>
          <Link href="/explore">Explore</Link>
          <Link href="/wanted">Wanted board</Link>
          <Link href="/sell">Sell an item</Link>
        </div>

        <span className="footer-note">Give useful things another semester.</span>
      </div>
    </footer>
  );
}
