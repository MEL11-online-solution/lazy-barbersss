# UI/UX Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 6 UI/UX improvements: social media links, Google Maps embed, public routing verification, logo integration, gold accent colors, and dark/light mode toggle.

**Architecture:** All changes are purely frontend (no backend/DB). Dark/light mode uses a ThemeContext that toggles a `dark` CSS class on `<html>`, with CSS custom properties in globals.css driving the color switching across the component layer. All public pages are already accessible without login; minimal routing changes needed.

**Tech Stack:** React 18, Tailwind CSS v3, wouter, Vite, inline SVGs (lucide-react is NOT installed)

---

## Pre-work notes

- `lucide-react` is **not installed** — use inline SVG for all icons
- `tailwind.config.js` already has `gold: { 400: '#F4C545', 500: '#E0AE2B' }` — update values to `#D4A843`
- Router is `wouter`, not react-router-dom
- All public pages (`/`, `/services`, `/gallery`, etc.) already use `withPublic` (no ProtectedRoute) — routing is correct
- Navbar already shows Sign In / Sign Up when `!user` — only need to add explicit click handler to "Book Your Cut"
- `ReceiptPage` already references `text-gold-400` in its `Row` component — will work once gold is in tailwind config
- Dark mode strategy: `darkMode: 'class'` in tailwind.config + ThemeContext applies `dark` class to `document.documentElement` + CSS custom properties in globals.css override body/component colors

---

## File Map

| File | Action | What changes |
|------|--------|--------------|
| `frontend/src/components/layout/Footer.jsx` | Modify | Real social links with inline SVG icons |
| `frontend/src/pages/public/ContactPage.jsx` | Modify | Add Google Maps iframe in a 3-col layout |
| `frontend/src/components/layout/Navbar.jsx` | Modify | Logo, dark/light toggle button, explicit Book auth guard |
| `frontend/src/pages/booking/ReceiptPage.jsx` | Modify | Logo at top of receipt |
| `frontend/tailwind.config.js` | Modify | Add `darkMode: 'class'`, update gold color, add gold-brand alias |
| `frontend/src/context/ThemeContext.jsx` | Create | Dark/light mode context with localStorage persistence |
| `frontend/src/App.jsx` | Modify | Wrap with ThemeProvider |
| `frontend/src/styles/globals.css` | Modify | CSS variables for theming + light mode overrides |

---

## Task 1: Footer — Social Media Links with Icons

**Files:**
- Modify: `frontend/src/components/layout/Footer.jsx`

- [ ] **Step 1: Replace the SocialButton stub with real linked icons**

Replace the entire file with this content:

```jsx
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
    <footer className="border-t border-navy-500/30 bg-navy-900 mt-12">
      <div className="container-page py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Link href="/">
            <img
              src="/logo.png"
              alt="Lazy Barbers"
              height={30}
              className="h-[30px] w-auto object-contain"
            />
          </Link>
          <p className="mt-3 text-sm text-white/60">Precision cuts. Premium experience. No waiting.</p>
          <div className="flex gap-2 mt-4">
            {SOCIAL_LINKS.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 rounded-md border border-navy-500/40 flex items-center justify-center text-white/60 hover:text-pink-500 hover:border-pink-500/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-display uppercase tracking-widest text-gold-brand mb-3">Quick Links</h4>
          <ul className="text-sm space-y-2 text-white/80">
            <li><Link href="/" className="hover:text-pink-500">Home</Link></li>
            <li><Link href="/services" className="hover:text-pink-500">Services</Link></li>
            <li><Link href="/gallery" className="hover:text-pink-500">Gallery</Link></li>
            <li><Link href="/reviews" className="hover:text-pink-500">Reviews</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-display uppercase tracking-widest text-gold-brand mb-3">Hours</h4>
          <ul className="text-sm space-y-1 text-white/80">
            <li>Mon – Fri: <span className="text-white">9 am – 7 pm</span></li>
            <li>Saturday: <span className="text-white">9 am – 7 pm</span></li>
            <li>Sunday: <span className="text-white">9 am – 7 pm</span></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-display uppercase tracking-widest text-gold-brand mb-3">Contact</h4>
          <ul className="text-sm space-y-2 text-white/80">
            <li className="flex gap-2 items-start"><span className="text-pink-500">📍</span> 15 Good St, Granville NSW</li>
            <li className="flex gap-2 items-start"><span className="text-pink-500">📞</span> +61 416 065 592</li>
            <li className="flex gap-2 items-start"><span className="text-pink-500">✉️</span> hello@lazybarbers.com.au</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-navy-500/30">
        <div className="container-page py-4 flex flex-col md:flex-row items-center justify-between text-xs text-white/50">
          <span>© {new Date().getFullYear()} Lazy Barbers. All rights reserved.</span>
          <span>15 Good St, Granville NSW 2142 · ABN: 00 000 000 000</span>
        </div>
      </div>
    </footer>
  );
}
```

Note: `text-gold-brand` is a Tailwind alias we add in Task 5. For now it will fall back gracefully — add it in Task 5 before running the dev server.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/layout/Footer.jsx
git commit -m "feat: add real social media links with SVG icons in footer"
```

---

## Task 2: Contact Page — Google Maps Embed

**Files:**
- Modify: `frontend/src/pages/public/ContactPage.jsx`

The current layout is a 2-column grid: `[Contact Info | Contact Form]`. Restructure to a 3-column grid on desktop: `[Contact Info | Map | Form]`, all stacked on mobile.

- [ ] **Step 1: Restructure ContactPage to 3-column layout with Google Maps**

Replace the entire file:

```jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { contactApi } from '../../api';
import { useToast } from '../../context/ToastContext';

const schema = z.object({
  full_name: z.string().trim().min(1, 'Name is required').max(120),
  email: z.string().trim().toLowerCase().email('Invalid email'),
  phone: z.string().trim().regex(/^\+?[0-9\s\-()]{6,20}$/u, 'Invalid phone').optional().or(z.literal('')),
  subject: z.string().trim().max(200).optional().or(z.literal('')),
  message: z.string().trim().min(1, 'Message is required').max(5000),
});

export default function ContactPage() {
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values) {
    try {
      await contactApi.send(values);
      toast.success("Message sent — we'll be in touch shortly.");
      reset();
    } catch (e) {
      toast.error(e.message || 'Failed to send message');
    }
  }

  return (
    <>
      <section className="section text-center">
        <div className="container-page">
          <h1 className="h-display">Get in touch</h1>
          <p className="text-white/60 mt-3 max-w-xl mx-auto">
            We'd love to hear from you. Contact us today to book your appointment or ask any questions.
          </p>
        </div>
      </section>

      <section className="container-page pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div>
            <h3 className="font-display uppercase tracking-widest text-lg">Contact Information</h3>
            <ul className="mt-6 space-y-5 text-sm">
              <li>
                <p className="text-pink-500 text-xs tracking-widest uppercase">📍 Location</p>
                <p className="mt-1">15 Good Street</p>
                <p>Granville NSW 2142</p>
                <p>Australia</p>
                <p className="text-white/50 text-xs mt-1">5 minutes walk from Granville Station</p>
              </li>
              <li>
                <p className="text-pink-500 text-xs tracking-widest uppercase">📞 Phone</p>
                <a className="hover:text-pink-500" href="tel:+61416065592">+61 416 065 592</a>
              </li>
              <li>
                <p className="text-pink-500 text-xs tracking-widest uppercase">✉️ Email</p>
                <a className="hover:text-pink-500" href="mailto:hello@lazybarbers.com.au">hello@lazybarbers.com.au</a>
              </li>
              <li>
                <p className="text-pink-500 text-xs tracking-widest uppercase">🕒 Hours</p>
                <p className="text-white/70">Open every day · 9 am – 7 pm</p>
              </li>
            </ul>
          </div>

          {/* Google Maps */}
          <div className="rounded-xl overflow-hidden border border-navy-500/40 min-h-[300px]">
            <iframe
              title="Lazy Barbers location"
              src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=15+Good+Street+Granville+NSW+2142+Australia"
              width="100%"
              height="100%"
              style={{ minHeight: '300px', border: 0, display: 'block' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Contact Form */}
          <div className="card-padded">
            <h3 className="font-display uppercase tracking-widest text-lg">Send us a message</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div>
                <label className="form-label">Full name *</label>
                <input className="form-input" placeholder="Your name" {...register('full_name')} />
                {errors.full_name && <p className="form-error">{errors.full_name.message}</p>}
              </div>
              <div>
                <label className="form-label">Email address *</label>
                <input className="form-input" placeholder="your@email.com" {...register('email')} />
                {errors.email && <p className="form-error">{errors.email.message}</p>}
              </div>
              <div>
                <label className="form-label">Phone number</label>
                <input className="form-input" placeholder="+61 4XX XXX XXX" {...register('phone')} />
                {errors.phone && <p className="form-error">{errors.phone.message}</p>}
              </div>
              <div>
                <label className="form-label">Subject</label>
                <input className="form-input" placeholder="How can we help?" {...register('subject')} />
              </div>
              <div>
                <label className="form-label">Message *</label>
                <textarea
                  rows="5"
                  className="form-textarea"
                  placeholder="Tell us more about your inquiry..."
                  {...register('message')}
                />
                {errors.message && <p className="form-error">{errors.message.message}</p>}
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/public/ContactPage.jsx
git commit -m "feat: add Google Maps embed beside contact form"
```

---

## Task 3: Public Routing — Verify + Book Now Auth Guard

**Files:**
- Modify: `frontend/src/components/layout/Navbar.jsx` (minor change only)

Analysis: All public pages (`/`, `/services`, `/gallery`, `/reviews`, `/team`, `/about`, `/contact`) already use `withPublic` in AppRoutes.jsx (no ProtectedRoute). The Navbar already shows Sign In / Sign Up when `!user`. The `/booking` route already uses `withProtectedPublic`. **No changes needed to AppRoutes.jsx.**

The only UX improvement: add an explicit click handler to the "Book Your Cut" button in Navbar so unauthenticated users get redirected to sign-in with a helpful `?next` param, instead of silently failing via ProtectedRoute.

- [ ] **Step 1: Add `useLocation` navigate to the Book Your Cut button**

In `frontend/src/components/layout/Navbar.jsx`, change line 1 to import `useLocation` for navigation, and update the Book Your Cut `<Link>` to an `<a>` with a click handler that redirects unauthenticated users.

The change is to replace the two "Book Your Cut" `<Link>` elements (one in the desktop nav, one in the mobile drawer) with click-guarded versions:

Desktop version (around line 67-72) — replace:
```jsx
<Link
  href="/booking"
  className="inline-flex items-center justify-center gap-1.5 rounded-lg font-display tracking-widest uppercase text-xs py-2.5 px-5 text-white bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-400 hover:to-pink-300 active:scale-95 transition-all duration-200 shadow-glow select-none"
>
  ✂ Book Your Cut
</Link>
```

Mobile version (around line 108-115) — replace similarly.

New pattern (applies to both, update both):
```jsx
<BookButton user={user} />
```

Add a `BookButton` component at the bottom of the file:
```jsx
function BookButton({ user, mobile = false, onClick }) {
  const [, navigate] = useLocation();

  function handleClick(e) {
    if (onClick) onClick();
    if (!user) {
      e.preventDefault();
      navigate('/sign-in?next=%2Fbooking');
    }
  }

  const cls = mobile
    ? 'flex items-center justify-center gap-2 w-full rounded-lg font-display tracking-widest uppercase text-sm py-3 text-white bg-gradient-to-r from-pink-500 to-pink-400 active:scale-95 transition-all duration-200 shadow-glow select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400'
    : 'inline-flex items-center justify-center gap-1.5 rounded-lg font-display tracking-widest uppercase text-xs py-2.5 px-5 text-white bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-400 hover:to-pink-300 active:scale-95 transition-all duration-200 shadow-glow select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400';

  return (
    <Link href="/booking" onClick={handleClick} className={cls}>
      ✂ Book Your Cut
    </Link>
  );
}
```

Full updated Navbar.jsx (replace entire file):

```jsx
import { Link, useLocation } from 'wouter';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
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
  const [mobileOpen, setMobileOpen] = useState(false);

  let dashHref = null;
  let dashLabel = null;
  if (user) {
    if (user.role === 'admin') { dashHref = '/admin'; dashLabel = 'Admin'; }
    else if (user.role === 'barber') { dashHref = '/barber'; dashLabel = 'My Schedule'; }
    else { dashHref = '/my-bookings'; dashLabel = 'My Bookings'; }
  }

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-navy-900/80 border-b border-navy-500/30">
      <nav className="container-page flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Lazy Barbers" className="h-10 w-auto object-contain" />
        </Link>

        {/* Desktop nav */}
        <ul className="hidden lg:flex items-center gap-8 text-sm font-display tracking-wider uppercase">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`${
                  location === link.href ? 'text-pink-500' : 'text-white/80 hover:text-white'
                } transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 rounded`}
              >
                {link.label}
              </Link>
            </li>
          ))}
          {user && dashHref && (
            <li>
              <Link
                href={dashHref}
                className={`${
                  location.startsWith(dashHref) ? 'text-pink-500' : 'text-white/80 hover:text-white'
                } transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 rounded`}
              >
                {dashLabel}
              </Link>
            </li>
          )}
        </ul>

        {/* Auth buttons + Book CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <BookButton user={user} />
          {!user ? (
            <>
              <Link href="/sign-in" className="btn-secondary btn-sm">Sign In</Link>
              <Link href="/sign-up" className="btn-primary btn-sm">Sign Up</Link>
            </>
          ) : (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-white/70">
                Welcome, <span className="font-semibold text-white">{user.first_name}</span>
              </span>
              <button onClick={logout} className="btn-ghost btn-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded">Sign Out</button>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="lg:hidden p-2 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 rounded"
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {mobileOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-navy-500/30 bg-navy-900">
          <div className="px-4 pt-4">
            <BookButton user={user} mobile onClick={() => setMobileOpen(false)} />
          </div>
          <ul className="px-4 py-4 flex flex-col gap-1 font-display uppercase tracking-wider text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block py-3 px-2 rounded ${
                    location === link.href ? 'text-pink-500 bg-navy-700' : 'text-white/80'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {user && dashHref && (
              <li>
                <Link
                  href={dashHref}
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 px-2 rounded text-white/80"
                >
                  {dashLabel}
                </Link>
              </li>
            )}
            <li className="pt-3 mt-2 border-t border-navy-500/30 flex gap-2">
              {!user ? (
                <>
                  <Link href="/sign-in" onClick={() => setMobileOpen(false)} className="btn-secondary btn-sm flex-1">
                    Sign In
                  </Link>
                  <Link href="/sign-up" onClick={() => setMobileOpen(false)} className="btn-primary btn-sm flex-1">
                    Sign Up
                  </Link>
                </>
              ) : (
                <button onClick={() => { setMobileOpen(false); logout(); }} className="btn-ghost btn-sm w-full">
                  Sign Out
                </button>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

function BookButton({ user, mobile = false, onClick }) {
  const [, navigate] = useLocation();

  function handleClick(e) {
    if (onClick) onClick();
    if (!user) {
      e.preventDefault();
      navigate('/sign-in?next=%2Fbooking');
    }
  }

  const cls = mobile
    ? 'flex items-center justify-center gap-2 w-full rounded-lg font-display tracking-widest uppercase text-sm py-3 text-white bg-gradient-to-r from-pink-500 to-pink-400 active:scale-95 transition-all duration-200 shadow-glow select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400'
    : 'inline-flex items-center justify-center gap-1.5 rounded-lg font-display tracking-widest uppercase text-xs py-2.5 px-5 text-white bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-400 hover:to-pink-300 active:scale-95 transition-all duration-200 shadow-glow select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400';

  return (
    <Link href="/booking" onClick={handleClick} className={cls}>
      ✂ Book Your Cut
    </Link>
  );
}
```

Note: The dark/light theme toggle button will be added in Task 6 after ThemeContext exists.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/layout/Navbar.jsx
git commit -m "feat: add logo to navbar, auth guard on book button, accessible focus rings"
```

---

## Task 4: Logo in Receipt Page

**Files:**
- Modify: `frontend/src/pages/booking/ReceiptPage.jsx`

- [ ] **Step 1: Replace text brand with logo image in ReceiptPage**

In `ReceiptPage.jsx`, find the brand section (lines 25-29) and replace:
```jsx
<div>
  <p className="brand"><span className="lazy">LAZY </span><span className="barbers">BARBERS</span></p>
  <p className="text-xs text-white/60 mt-2">15 Good St, Granville NSW 2142</p>
  <p className="text-xs text-white/60">+61 416 065 592</p>
</div>
```

With:
```jsx
<div>
  <img src="/logo.png" alt="Lazy Barbers" className="h-10 w-auto object-contain" />
  <p className="text-xs text-white/60 mt-2">15 Good St, Granville NSW 2142</p>
  <p className="text-xs text-white/60">+61 416 065 592</p>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/booking/ReceiptPage.jsx
git commit -m "feat: show logo on receipt page"
```

---

## Task 5: Gold Accent Color

**Files:**
- Modify: `frontend/tailwind.config.js`

- [ ] **Step 1: Update gold values and add gold-brand alias, add darkMode class**

Replace the entire `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0F0F2D',
          800: '#161636',
          700: '#1E1E45',
          600: '#272758',
          500: '#33336B',
        },
        pink: {
          500: '#E91E63',
          600: '#D81557',
          400: '#F84A82',
        },
        gold: {
          400: '#D4A843',
          500: '#B8902F',
        },
        // Semantic alias for gold accent use in text
        'gold-brand': '#D4A843',
      },
      fontFamily: {
        display: ['Bebas Neue', 'Anton', 'Impact', 'system-ui', 'sans-serif'],
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 8px 24px rgba(0,0,0,0.25)',
        glow: '0 0 24px rgba(233,30,99,0.4)',
        'glow-gold': '0 0 16px rgba(212,168,67,0.3)',
      },
    },
  },
  plugins: [],
};
```

Note: `darkMode: 'class'` is added here so Task 6 works. The `gold-brand` alias lets us use `text-gold-brand` as a shorthand.

- [ ] **Step 2: Apply gold accents to Footer section headers (already done in Task 1 via `text-gold-brand`)**

The Footer already references `text-gold-brand` from Task 1. Stars component already uses `text-gold-400`. ReceiptPage Row uses `text-gold-400`. These all work now.

Optionally add a gold divider accent to `globals.css` (covered in Task 6 globals.css update).

- [ ] **Step 3: Commit**

```bash
git add frontend/tailwind.config.js
git commit -m "feat: update gold color to #D4A843, add gold-brand alias, enable darkMode class"
```

---

## Task 6: ThemeContext — Dark/Light Mode Toggle

**Files:**
- Create: `frontend/src/context/ThemeContext.jsx`
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/styles/globals.css`
- Modify: `frontend/src/components/layout/Navbar.jsx` (add toggle button)

### Strategy

- `darkMode: 'class'` is already set (Task 5)
- ThemeContext applies `dark` class to `document.documentElement` for dark mode, removes it for light mode
- Dark is the **default** — on first visit, `dark` class is applied
- `globals.css` base/component layers are updated so both themes look correct
- Light mode colors: white/gray-50 backgrounds, gray-900 text, same pink + gold accents

### Step 6a — ThemeContext

- [ ] **Step 1: Create `frontend/src/context/ThemeContext.jsx`**

```jsx
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('lb-theme');
    return stored === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('lb-theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
```

### Step 6b — Wrap App with ThemeProvider

- [ ] **Step 2: Update `frontend/src/App.jsx`**

```jsx
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { BookingProvider } from './context/BookingContext';
import { ThemeProvider } from './context/ThemeContext';
import AppRoutes from './routes/AppRoutes';
import WhatsAppButton from './components/common/WhatsAppButton';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BookingProvider>
            <AppRoutes />
            <WhatsAppButton />
          </BookingProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
```

### Step 6c — globals.css theming

- [ ] **Step 3: Replace `frontend/src/styles/globals.css` with dual-theme version**

The strategy: use `html.dark` selectors to apply dark styles, defaults are light. The component layer (`.card`, `.form-input`, etc.) gets explicit dark/light variants. This lets all JSX components that use these classes theme correctly without touching each file.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ─── CSS Custom Properties ─────────────────────────────────────── */
:root {
  /* Light mode defaults */
  --lb-bg: #f3f4f6;
  --lb-bg-card: #ffffff;
  --lb-bg-input: #ffffff;
  --lb-bg-nav: rgba(249, 250, 251, 0.95);
  --lb-text: #111827;
  --lb-text-muted: #6b7280;
  --lb-text-placeholder: #9ca3af;
  --lb-border: #e5e7eb;
  --lb-border-input: #d1d5db;
  --lb-scrollbar-track: #e5e7eb;
  --lb-scrollbar-thumb: #9ca3af;
  --lb-bg-gradient: none;
}

html.dark {
  --lb-bg: #161636;
  --lb-bg-card: #1E1E45;
  --lb-bg-input: #0F0F2D;
  --lb-bg-nav: rgba(15, 15, 45, 0.8);
  --lb-text: #ffffff;
  --lb-text-muted: rgba(255, 255, 255, 0.6);
  --lb-text-placeholder: rgba(255, 255, 255, 0.3);
  --lb-border: rgba(51, 51, 107, 0.3);
  --lb-border-input: #33336B;
  --lb-scrollbar-track: #0F0F2D;
  --lb-scrollbar-thumb: #33336B;
  --lb-bg-gradient:
    radial-gradient(at 20% 0%, rgba(233, 30, 99, 0.04) 0%, transparent 50%),
    radial-gradient(at 80% 100%, rgba(244, 197, 69, 0.03) 0%, transparent 60%);
}

@layer base {
  html, body, #root {
    height: 100%;
  }

  body {
    @apply font-sans antialiased;
    background-color: var(--lb-bg);
    color: var(--lb-text);
    background-image: var(--lb-bg-gradient);
    background-attachment: fixed;
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  h1, h2, h3, h4 {
    @apply font-display tracking-wide;
  }
}

@layer components {
  /* ── Buttons ─────────────────────────────────────────────────── */
  .btn {
    @apply inline-flex items-center justify-center gap-2 rounded-md font-display
           tracking-wide uppercase text-sm py-3 px-6 transition-all
           disabled:opacity-50 disabled:cursor-not-allowed select-none
           focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1;
  }
  .btn-primary {
    @apply btn bg-pink-500 text-white hover:bg-pink-600 active:scale-[0.98]
           shadow-glow focus-visible:ring-pink-400;
  }
  .btn-secondary {
    @apply btn border text-sm active:scale-[0.98] focus-visible:ring-white/40;
    border-color: var(--lb-border-input);
    color: var(--lb-text);
  }
  .btn-secondary:hover {
    background-color: var(--lb-border);
  }
  .btn-ghost {
    @apply btn focus-visible:ring-white/30;
    color: var(--lb-text-muted);
  }
  .btn-ghost:hover {
    color: var(--lb-text);
    background-color: var(--lb-border);
  }
  .btn-danger {
    @apply btn bg-red-500/90 text-white hover:bg-red-600 active:scale-[0.98]
           focus-visible:ring-red-400;
  }
  .btn-sm {
    @apply text-xs py-2 px-4;
  }

  /* ── Inputs ──────────────────────────────────────────────────── */
  .form-label {
    @apply block text-xs font-semibold tracking-widest uppercase mb-2;
    color: var(--lb-text-muted);
  }
  .form-input,
  .form-textarea,
  .form-select {
    @apply w-full rounded-md px-4 py-3 transition-colors
           focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500;
    background-color: var(--lb-bg-input);
    border: 1px solid var(--lb-border-input);
    color: var(--lb-text);
  }
  .form-input::placeholder,
  .form-textarea::placeholder {
    color: var(--lb-text-placeholder);
  }
  .form-error {
    @apply text-pink-400 text-xs mt-1;
  }

  /* ── Cards ───────────────────────────────────────────────────── */
  .card {
    @apply rounded-xl shadow-card;
    background-color: var(--lb-bg-card);
    border: 1px solid var(--lb-border);
  }
  .card-padded {
    @apply card p-6 md:p-8;
  }

  /* ── Badges ──────────────────────────────────────────────────── */
  .badge {
    @apply inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider;
  }
  .badge-confirmed { @apply badge bg-emerald-500/20 text-emerald-300; }
  .badge-pending   { @apply badge bg-yellow-500/20 text-yellow-300; }
  .badge-cancelled { @apply badge bg-red-500/20 text-red-300; }
  .badge-completed { @apply badge bg-emerald-600/20 text-emerald-200; }
  .badge-active    { @apply badge bg-emerald-500/20 text-emerald-300; }
  .badge-on_leave  { @apply badge bg-yellow-500/20 text-yellow-300; }
  .badge-inactive  { @apply badge bg-white/10 text-white/60; }
  .badge-no_show   { @apply badge bg-red-500/20 text-red-300; }

  /* ── Layout ──────────────────────────────────────────────────── */
  .container-page {
    @apply max-w-6xl mx-auto px-4 md:px-6 lg:px-8;
  }
  .container-narrow {
    @apply max-w-3xl mx-auto px-4 md:px-6;
  }
  .section {
    @apply py-16 md:py-24;
  }
  .section-tight {
    @apply py-12 md:py-16;
  }

  /* ── Headings ────────────────────────────────────────────────── */
  .h-display {
    @apply font-display uppercase text-4xl md:text-5xl lg:text-6xl tracking-wide leading-tight;
  }
  .h-section {
    @apply font-display uppercase text-3xl md:text-4xl tracking-wide;
  }

  /* ── Brand mark ──────────────────────────────────────────────── */
  .brand {
    @apply font-display text-2xl tracking-wider;
  }
  .brand .lazy { @apply text-white; }
  .brand .barbers { @apply text-pink-500; }

  /* ── Navbar ──────────────────────────────────────────────────── */
  .navbar-bg {
    backdrop-filter: blur(12px);
    background-color: var(--lb-bg-nav);
    border-bottom: 1px solid var(--lb-border);
  }
}

/* ── Scrollbar ───────────────────────────────────────────────────── */
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: var(--lb-scrollbar-track); }
::-webkit-scrollbar-thumb { background: var(--lb-scrollbar-thumb); border-radius: 5px; }
::-webkit-scrollbar-thumb:hover { background: #E91E63; }
```

### Step 6d — Navbar theme toggle button

- [ ] **Step 4: Add theme toggle to Navbar**

Import `useTheme` and add a sun/moon toggle button to the desktop and mobile Navbar. Update the Navbar header element to use `.navbar-bg`. Full updated `frontend/src/components/layout/Navbar.jsx` (replaces Task 3 version):

```jsx
import { Link, useLocation } from 'wouter';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
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

  return (
    <header className="navbar-bg sticky top-0 z-30">
      <nav className="container-page flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 rounded">
          <img src="/logo.png" alt="Lazy Barbers" className="h-10 w-auto object-contain" />
        </Link>

        {/* Desktop nav */}
        <ul className="hidden lg:flex items-center gap-8 text-sm font-display tracking-wider uppercase">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`${
                  location === link.href ? 'text-pink-500' : 'text-white/80 hover:text-white dark:text-white/80 dark:hover:text-white'
                } transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 rounded`}
              >
                {link.label}
              </Link>
            </li>
          ))}
          {user && dashHref && (
            <li>
              <Link
                href={dashHref}
                className={`${
                  location.startsWith(dashHref) ? 'text-pink-500' : 'text-white/80 hover:text-white'
                } transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 rounded`}
              >
                {dashLabel}
              </Link>
            </li>
          )}
        </ul>

        {/* Auth buttons + Book CTA + Theme toggle */}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <BookButton user={user} />
          {!user ? (
            <>
              <Link href="/sign-in" className="btn-secondary btn-sm">Sign In</Link>
              <Link href="/sign-up" className="btn-primary btn-sm">Sign Up</Link>
            </>
          ) : (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-white/70 dark:text-white/70">
                Welcome, <span className="font-semibold text-white">{user.first_name}</span>
              </span>
              <button onClick={logout} className="btn-ghost btn-sm">Sign Out</button>
            </div>
          )}
        </div>

        {/* Mobile row: theme toggle + hamburger */}
        <div className="lg:hidden flex items-center gap-2">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="p-2 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 rounded"
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {mobileOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t bg-navy-900 dark:bg-navy-900" style={{ borderColor: 'var(--lb-border)' }}>
          <div className="px-4 pt-4">
            <BookButton user={user} mobile onClick={() => setMobileOpen(false)} />
          </div>
          <ul className="px-4 py-4 flex flex-col gap-1 font-display uppercase tracking-wider text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block py-3 px-2 rounded ${
                    location === link.href ? 'text-pink-500 bg-navy-700' : 'text-white/80'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {user && dashHref && (
              <li>
                <Link
                  href={dashHref}
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 px-2 rounded text-white/80"
                >
                  {dashLabel}
                </Link>
              </li>
            )}
            <li className="pt-3 mt-2 border-t flex gap-2" style={{ borderColor: 'var(--lb-border)' }}>
              {!user ? (
                <>
                  <Link href="/sign-in" onClick={() => setMobileOpen(false)} className="btn-secondary btn-sm flex-1">
                    Sign In
                  </Link>
                  <Link href="/sign-up" onClick={() => setMobileOpen(false)} className="btn-primary btn-sm flex-1">
                    Sign Up
                  </Link>
                </>
              ) : (
                <button onClick={() => { setMobileOpen(false); logout(); }} className="btn-ghost btn-sm w-full">
                  Sign Out
                </button>
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
        /* Sun icon */
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        /* Moon icon */
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
    if (!user) {
      e.preventDefault();
      navigate('/sign-in?next=%2Fbooking');
    }
  }

  const cls = mobile
    ? 'flex items-center justify-center gap-2 w-full rounded-lg font-display tracking-widest uppercase text-sm py-3 text-white bg-gradient-to-r from-pink-500 to-pink-400 active:scale-95 transition-all duration-200 shadow-glow select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400'
    : 'inline-flex items-center justify-center gap-1.5 rounded-lg font-display tracking-widest uppercase text-xs py-2.5 px-5 text-white bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-400 hover:to-pink-300 active:scale-95 transition-all duration-200 shadow-glow select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400';

  return (
    <Link href="/booking" onClick={handleClick} className={cls}>
      ✂ Book Your Cut
    </Link>
  );
}
```

- [ ] **Step 5: Commit all Task 6 files**

```bash
git add frontend/src/context/ThemeContext.jsx \
        frontend/src/App.jsx \
        frontend/src/styles/globals.css \
        frontend/src/components/layout/Navbar.jsx
git commit -m "feat: dark/light mode toggle with ThemeContext, CSS vars, accessible focus rings"
```

---

## Final Verification

- [ ] Run `npm run dev` in `frontend/` and open the app in a browser
- [ ] Verify Footer shows Facebook, Instagram, TikTok icons linking correctly (open in new tab)
- [ ] Verify Contact page shows 3 columns: info | map | form (desktop), stacked (mobile)
- [ ] Verify logo appears in Navbar and Footer
- [ ] Verify logo appears on receipt page (requires a booking)
- [ ] Click "Book Your Cut" when logged out → should redirect to `/sign-in?next=%2Fbooking`
- [ ] Toggle dark/light — body background and cards should switch; preference persists on reload
- [ ] Stars on Reviews page still show gold color
- [ ] All buttons have visible focus ring on keyboard tab navigation

---

## Self-Review

**Spec coverage:**
1. ✅ Social media links with icons in footer — Task 1
2. ✅ Google Maps embed beside form — Task 2 (3-col layout: info | map | form)
3. ✅ Public pages already public; book auth guard added to Navbar — Task 3
4. ✅ Logo in Navbar, Footer, ReceiptPage — Tasks 1, 3, 4
5. ✅ Gold color `#D4A843` in tailwind config + `text-gold-brand` alias + applied to Footer headers — Task 5
6. ✅ ThemeContext with localStorage, dark default, sun/moon toggle, CSS variables for light/dark — Task 6

**Placeholder scan:** No "TBD" or "TODO" found. All code blocks are complete.

**Type consistency:** `useTheme()` returns `{ theme, toggleTheme }` in ThemeContext (Task 6a) and is destructured as `{ theme, toggleTheme }` in Navbar (Task 6d). `BookButton` receives `user`, `mobile`, `onClick` props consistently across Task 3 and Task 6d. `gold-brand` color alias added in Task 5 and referenced in Task 1 Footer.

**Gap check:** `AppRoutes.jsx` requires no changes (routes are already correctly public/private). `ProtectedRoute.jsx` requires no changes.
