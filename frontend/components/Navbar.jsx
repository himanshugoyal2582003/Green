'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Top navigation bar + mobile bottom navigation.
 */
export default function Navbar({ user, onOpenAuth }) {
  const pathname = usePathname();

  const dashboardHref = user ? `/dashboard/${user.role}` : '/dashboard';

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link className="brand" href="/">
            <span className="brand-circle" />
            <span className="brand-text">
              <span className="brand-name">green.</span>
              <span className="brand-sub">SECOND LIFE</span>
            </span>
          </Link>

          <nav className="nav-links" aria-label="Main navigation">
            <Link
              href="/explore"
              className={`nav-link${pathname.startsWith('/explore') ? ' active' : ''}`}
            >
              Explore
            </Link>
            <Link
              href="/wanted"
              className={`nav-link${pathname.startsWith('/wanted') ? ' active' : ''}`}
            >
              Wanted
            </Link>
            <Link href="/#how" className="nav-link">
              How it works
            </Link>
          </nav>

          <div className="nav-actions">
            {user ? (
              <Link href={dashboardHref} className="btn btn-ghost">
                <span>My space</span>
                <span className="role-chip">{user.role}</span>
              </Link>
            ) : (
              <button type="button" className="btn btn-ghost" onClick={onOpenAuth}>
                My space
              </button>
            )}

            <Link href="/sell" className="btn btn-primary">
              Sell an item
            </Link>
          </div>
        </div>
      </header>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <Link href="/explore" className={pathname.startsWith('/explore') ? 'active' : ''}>
          <span>Explore</span>
        </Link>
        <Link href="/wanted" className={pathname.startsWith('/wanted') ? 'active' : ''}>
          <span>Wanted</span>
        </Link>
        <Link href="/sell" className={pathname.startsWith('/sell') ? 'active' : ''}>
          <span>Sell</span>
        </Link>
        <Link href={dashboardHref} className={pathname.startsWith('/dashboard') ? 'active' : ''}>
          <span>My space</span>
        </Link>
      </nav>
    </>
  );
}
