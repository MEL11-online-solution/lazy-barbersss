import { Link, useLocation } from 'wouter';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const NAV_LINKS = [
  { href: '/home', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/team', label: 'Team' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  let dashHref = null;
  let dashLabel = null;
  if (user) {
    if (user.role === 'admin') { dashHref = '/admin'; dashLabel = 'Admin'; }
    else if (user.role === 'barber') { dashHref = '/barber'; dashLabel = 'My Schedule'; }
    else { dashHref = '/my-bookings'; dashLabel = 'My Bookings'; }
  }

  const isActive = (href) => location === href || (href === '/home' && location === '/');

  return (
    <header className="navbar-bg sticky top-0 z-30">
      <nav className="container-page flex items-center justify-between h-16">
        <Link href="/home" className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 rounded-lg">
          <div className="rounded-xl overflow-hidden dark:bg-transparent bg-navy-900 p-1">
            <img src="/logo.png" alt="Lazy Barbers" className="h-9 w-auto object-contain block" />
          </div>
        </Link>

        <ul className="hidden lg:flex items-center gap-6 text-sm font-display tracking-wider uppercase">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`${isActive(link.href) ? 'text-pink-500' : 'hover:text-pink-400'} transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 rounded`}
                style={{ color: isActive(link.href) ? undefined : 'var(--lb-text-muted)' }}
              >
                {link.label}
              </Link>
            </li>
          ))}
          {user && dashHref && (
            <li>
              <Link
                href={dashHref}
                className={`${location.startsWith(dashHref) ? 'text-pink-500' : 'hover:text-pink-400'} transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 rounded`}
                style={{ color: location.startsWith(dashHref) ? undefined : 'var(--lb-text-muted)' }}
              >
                {dashLabel}
              </Link>
            </li>
          )}
        </ul>

        <div className="hidden lg:flex items-center gap-2">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <BookButton user={user} />
          {!user ? (
            <>
              <Link href="/home" className="btn-ghost btn-sm">Browse</Link>
              <Link href="/sign-in" className="btn-secondary btn-sm">Sign In</Link>
              <Link href="/sign-up" className="btn-primary btn-sm">Sign Up</Link>
            </>
          ) : (
            <div className="flex items-center gap-3 text-sm">
              <Link href="/profile" className="hover:text-pink-400 transition-colors" style={{ color: 'var(--lb-text-muted)' }}>
                Welcome, <span className="font-semibold" style={{ color: 'var(--lb-text)' }}>{user.first_name}</span>
              </Link>
              <Link href="/profile" className="btn-ghost btn-sm">Profile</Link>
              <button onClick={logout} className="btn-ghost btn-sm">Sign Out</button>
            </div>
          )}
        </div>

        <div className="lg:hidden flex items-center gap-2">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 rounded"
            style={{ color: 'var(--lb-text)' }}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {mobileOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="lg:hidden border-t" style={{ backgroundColor: 'var(--lb-bg-card)', borderColor: 'var(--lb-border)' }}>
          <div className="px-4 pt-4">
            <BookButton user={user} mobile onClick={() => setMobileOpen(false)} />
          </div>
          <ul className="px-4 py-4 flex flex-col gap-1 font-display uppercase tracking-wider text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block py-3 px-2 rounded transition-colors ${isActive(link.href) ? 'text-pink-500' : ''}`}
                  style={{ color: isActive(link.href) ? undefined : 'var(--lb-text-muted)' }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {user && dashHref && (
              <li>
                <Link href={dashHref} onClick={() => setMobileOpen(false)} className="block py-3 px-2 rounded" style={{ color: 'var(--lb-text-muted)' }}>
                  {dashLabel}
                </Link>
              </li>
            )}
            <li className="pt-3 mt-2 border-t flex flex-col gap-2" style={{ borderColor: 'var(--lb-border)' }}>
              {!user ? (
                <>
                  <Link href="/home" onClick={() => setMobileOpen(false)} className="btn-ghost btn-sm w-full text-center">Browse</Link>
                  <Link href="/sign-in" onClick={() => setMobileOpen(false)} className="btn-secondary btn-sm flex-1">Sign In</Link>
                  <Link href="/sign-up" onClick={() => setMobileOpen(false)} className="btn-primary btn-sm flex-1">Sign Up</Link>
                </>
              ) : (
                <>
                  <Link href="/profile" onClick={() => setMobileOpen(false)} className="btn-secondary btn-sm w-full text-center">Profile</Link>
                  <button onClick={() => { setMobileOpen(false); logout(); }} className="btn-ghost btn-sm w-full">Sign Out</button>
                </>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

function ThemeToggle({ theme, toggleTheme }) {
  const isDark = theme === 'dark';
  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-9 h-9 rounded-md flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
      style={{ color: 'var(--lb-text-muted)' }}
    >
      {isDark ? (
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
        </svg>
      )}
    </button>
  );
}

function BookButton({ user, mobile = false, onClick }) {
  const [, navigate] = useLocation();
  function handleClick(e) {
    if (onClick) onClick();
    if (!user) { e.preventDefault(); navigate('/sign-in?next=%2Fbooking'); }
  }
  const cls = mobile
    ? 'flex items-center justify-center gap-2 w-full rounded-lg font-display tracking-widest uppercase text-sm py-3 text-white bg-gradient-to-r from-pink-500 to-pink-400 active:scale-95 transition-all duration-200 shadow-glow select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400'
    : 'inline-flex items-center justify-center gap-1.5 rounded-lg font-display tracking-widest uppercase text-xs py-2.5 px-5 text-white bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-400 hover:to-pink-300 active:scale-95 transition-all duration-200 shadow-glow select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400';
  return (
    <Link href="/booking" onClick={handleClick} className={cls}>✂ Book Your Cut</Link>
  );
}
