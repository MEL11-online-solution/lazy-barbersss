import { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../../context/AuthContext';
import { adminApi, barberPortalApi } from '../../api';
import { formatDateTime } from '../../lib/format';

const NOTIF_SEEN_KEY = 'lb_admin_notifications_seen';

const ADMIN_LINKS = [
  { href: '/admin',             label: 'Dashboard',  icon: '📊' },
  { href: '/admin/schedule',    label: 'Schedule',   icon: '🗓' },
  { href: '/admin/services',    label: 'Services',   icon: '✂️' },
  { href: '/admin/customers',   label: 'Customers',  icon: '👥' },
  { href: '/admin/revenue',     label: 'Revenue',    icon: '💰' },
  { href: '/admin/barbers',     label: 'Barbers',    icon: '💈' },
  { href: '/admin/contact',     label: 'Messages',   icon: '✉️' },
  { href: '/admin/club-members', label: 'Club Members', icon: '🎟️' },
  { href: '/admin/audit-logs',  label: 'Audit Logs',  icon: '📋' },
];

const BARBER_LINKS = [
  { href: '/barber',            label: 'My Schedule', icon: '🗓' },
  { href: '/barber/time-off',   label: 'Time Off',    icon: '🌴' },
];

export default function DashboardLayout({ children, role = 'admin' }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const links = role === 'admin' ? ADMIN_LINKS : BARBER_LINKS;
  const portalLabel = role === 'admin' ? 'ADMIN PORTAL' : 'BARBER PORTAL';
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    if (role !== 'barber') return;
    let alive = true;
    barberPortalApi
      .me()
      .then((b) => { if (alive) setAvatarUrl(b?.avatar_url || null); })
      .catch(() => { if (alive) setAvatarUrl(null); });
    return () => { alive = false; };
  }, [role]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ backgroundColor: 'var(--lb-bg)' }}>
      {/* Sidebar */}
      <aside className="dash-sidebar lg:w-64 lg:min-h-screen lg:flex lg:flex-col">
        <div className="p-6" style={{ borderBottom: '1px solid var(--lb-border)' }}>
          <Link href="/home" className="brand block">
            <span className="lazy">LAZY </span>
            <span className="barbers">BARBERS</span>
          </Link>
          <p
            className="text-xs mt-1 tracking-widest uppercase font-display"
            style={{ color: 'var(--lb-text-muted)' }}
          >
            {portalLabel}
          </p>
        </div>

        <nav className="px-3 py-4 flex-1">
          <ul className="space-y-1">
            {links.map((l) => {
              const active = location === l.href;
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={`dash-nav-item flex items-center gap-3 px-4 py-3 text-sm font-display tracking-widest uppercase ${
                      active ? 'dash-nav-active' : ''
                    }`}
                    style={active ? undefined : { color: 'var(--lb-text-muted)' }}
                  >
                    <span>{l.icon}</span>
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-3 pb-4" style={{ borderTop: '1px solid var(--lb-border)' }}>
          <Link
            href="/profile"
            className="dash-nav-item flex items-center gap-3 px-4 py-3 text-sm font-display tracking-widest uppercase"
            style={{ color: 'var(--lb-text-muted)' }}
          >
            <span>⚙️</span> Settings
          </Link>
          <button
            onClick={logout}
            className="dash-nav-item w-full text-left flex items-center gap-3 px-4 py-3 text-sm font-display tracking-widest uppercase hover:text-red-600"
            style={{ color: 'var(--lb-text-muted)' }}
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        {/* Topbar */}
        <div className="dash-topbar">
          <div className="px-6 lg:px-10 py-4 flex items-center justify-end gap-3 text-sm">
            {role === 'admin' && <NotificationBell />}
            <span style={{ color: 'var(--lb-text-muted)' }}>Signed in as</span>
            <span className="font-semibold" style={{ color: 'var(--lb-text)' }}>
              {user?.first_name} {user?.last_name}
            </span>
            {avatarUrl && !avatarFailed ? (
              <img
                src={avatarUrl}
                alt={`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Profile'}
                onError={() => setAvatarFailed(true)}
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <span className="keep-white w-9 h-9 rounded-full bg-pink-500 flex items-center justify-center text-xs font-bold">
                {(user?.first_name || '').charAt(0)}
              </span>
            )}
          </div>
        </div>
        <div className="px-6 lg:px-10 py-8">{children}</div>
      </main>
    </div>
  );
}

function NotificationBell() {
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [lastSeen, setLastSeen] = useState(() => {
    const stored = localStorage.getItem(NOTIF_SEEN_KEY);
    return stored ? new Date(stored).getTime() : Date.now() - 24 * 60 * 60 * 1000;
  });
  const wrapRef = useRef(null);

  const load = useCallback(() => {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    adminApi.recentBookings(since).then(setBookings).catch(() => {});
  }, []);

  // Initial fetch + poll every 60s so the badge stays fresh.
  useEffect(() => {
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, [load]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const unread = bookings.filter((b) => b.created_at && new Date(b.created_at).getTime() > lastSeen).length;

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      // Opening marks everything as seen.
      const now = Date.now();
      localStorage.setItem(NOTIF_SEEN_KEY, new Date(now).toISOString());
      setLastSeen(now);
    }
  }

  function goToBooking() {
    setOpen(false);
    setLocation('/admin');
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        onClick={toggle}
        aria-label="Notifications"
        className="relative w-9 h-9 rounded-full flex items-center justify-center transition-colors"
        style={{ color: 'var(--lb-text)', border: '1px solid var(--lb-border)' }}
      >
        <span style={{ fontSize: '16px' }}>🔔</span>
        {unread > 0 && (
          <span
            className="absolute -top-1 -right-1 keep-white text-[10px] font-bold rounded-full flex items-center justify-center"
            style={{ minWidth: '18px', height: '18px', padding: '0 4px', background: '#ef4444', lineHeight: 1 }}
          >
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 rounded-lg shadow-xl z-50 overflow-hidden"
          style={{
            width: '320px',
            background: 'var(--lb-bg-card)',
            border: '1px solid var(--lb-border)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
          }}
        >
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--lb-border)' }}>
            <p className="font-display uppercase tracking-widest text-xs" style={{ color: 'var(--lb-text)' }}>
              Recent Bookings
            </p>
          </div>
          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {bookings.length === 0 ? (
              <p className="px-4 py-6 text-sm text-center" style={{ color: 'var(--lb-text-muted)' }}>
                No new bookings in the last 24 hours.
              </p>
            ) : (
              bookings.map((b) => (
                <button
                  key={b.id}
                  onClick={goToBooking}
                  className="w-full text-left px-4 py-3 transition-colors hover:opacity-80"
                  style={{ borderBottom: '1px solid var(--lb-border)', color: 'var(--lb-text)' }}
                >
                  <p className="text-sm">
                    <span className="text-gold-400 font-semibold">New:</span>{' '}
                    {b.service_name} with {b.barber_first_name || 'Any'}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--lb-text-muted)' }}>
                    {formatDateTime(b.start_at)}
                  </p>
                </button>
              ))
            )}
          </div>
          <button
            onClick={goToBooking}
            className="w-full text-center px-4 py-3 text-xs font-display uppercase tracking-widest text-pink-500 hover:underline"
          >
            View all bookings →
          </button>
        </div>
      )}
    </div>
  );
}
