import { Link } from 'wouter';

const SOCIAL_LINKS = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/p/Lazy-Barbers-61554922094895/',
    icon: (
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3l-.5 3H13v6.8c4.56-.93 8-4.96 8-9.8z"/>
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/lazy_barbers/',
    icon: (
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@lazy.barbers',
    icon: (
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.73a4.85 4.85 0 01-1.01-.04z"/>
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer
      className="mt-12"
      style={{
        backgroundColor: 'var(--lb-bg-card)',
        borderTop: '1px solid var(--lb-border)',
      }}
    >
      <div className="container-page py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* Brand */}
        <div className="lg:col-span-2">
          <Link href="/">
            <img
              src="/logo.png"
              alt="Lazy Barbers"
              height={30}
              className="h-[30px] w-auto object-contain"
              loading="lazy"
            />
          </Link>
          <p className="mt-3 text-sm" style={{ color: 'var(--lb-text-muted)' }}>
            Precision cuts. Premium experience. No waiting.
          </p>
          <div className="flex gap-2 mt-4">
            {SOCIAL_LINKS.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 rounded-md flex items-center justify-center hover:text-pink-500 hover:border-pink-500/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
                style={{ color: 'var(--lb-text-muted)', border: '1px solid var(--lb-border)' }}
              >
                {icon}
              </a>
            ))}
          </div>
          {/* Locations */}
          <div className="mt-5 space-y-2 text-sm" style={{ color: 'var(--lb-text-muted)' }}>
            <p><span className="text-pink-500">📍</span> 15 Good St, Granville NSW 2142</p>
            <p><span className="text-pink-500">📍</span> 62 Beamish St, Campsie NSW 2194</p>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-display uppercase tracking-widest text-gold-brand mb-3">Quick Links</h4>
          <ul className="text-sm space-y-2" style={{ color: 'var(--lb-text)' }}>
            <li><Link href="/home" className="hover:text-pink-500 transition-colors">Home</Link></li>
            <li><Link href="/services" className="hover:text-pink-500 transition-colors">Services</Link></li>
            <li><Link href="/gallery" className="hover:text-pink-500 transition-colors">Gallery</Link></li>
            <li><Link href="/reviews" className="hover:text-pink-500 transition-colors">Reviews</Link></li>
            <li><Link href="/team" className="hover:text-pink-500 transition-colors">Our Team</Link></li>
            <li><Link href="/about" className="hover:text-pink-500 transition-colors">About</Link></li>
            <li><Link href="/contact#faq" className="hover:text-pink-500 transition-colors">FAQ</Link></li>
            <li><Link href="/about#terms" className="hover:text-pink-500 transition-colors">Terms &amp; Conditions</Link></li>
            <li><Link href="/home#join" className="hover:text-pink-500 transition-colors">Join the Club</Link></li>
          </ul>
        </div>

        {/* Hours */}
        <div>
          <h4 className="text-xs font-display uppercase tracking-widest text-gold-brand mb-3">Hours</h4>
          <ul className="text-sm space-y-1" style={{ color: 'var(--lb-text-muted)' }}>
            <li>Mon – Fri: <span style={{ color: 'var(--lb-text)' }}>9 am – 7 pm</span></li>
            <li>Saturday: <span style={{ color: 'var(--lb-text)' }}>9 am – 7 pm</span></li>
            <li>Sunday: <span style={{ color: 'var(--lb-text)' }}>9 am – 7 pm</span></li>
          </ul>
          <h4 className="text-xs font-display uppercase tracking-widest text-gold-brand mb-3 mt-6">Awards</h4>
          <ul className="text-sm space-y-1" style={{ color: 'var(--lb-text-muted)' }}>
            <li>🥇 Local Business Award 2024</li>
            <li>🥇 ABA Finalist 2024</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-xs font-display uppercase tracking-widest text-gold-brand mb-3">Contact</h4>
          <ul className="text-sm space-y-2" style={{ color: 'var(--lb-text)' }}>
            <li className="flex gap-2 items-start"><span className="text-pink-500">📞</span> <a href="tel:+61416065592" className="hover:text-pink-500 transition-colors">+61 416 065 592</a></li>
            <li className="flex gap-2 items-start"><span className="text-pink-500">✉️</span> <a href="mailto:hello@lazybarbers.com.au" className="hover:text-pink-500 transition-colors">hello@lazybarbers.com.au</a></li>
          </ul>
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--lb-border)' }}>
        <div
          className="container-page py-4 flex flex-col md:flex-row items-center justify-between text-xs gap-2"
          style={{ color: 'var(--lb-text-muted)' }}
        >
          <span>© {new Date().getFullYear()} Lazy Barbers. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/about#terms" className="hover:text-pink-500 transition-colors">Terms &amp; Conditions</Link>
            <span>ABN: 00 000 000 000</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
