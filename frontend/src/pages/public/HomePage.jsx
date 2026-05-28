import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { servicesApi, barbersApi, reviewsApi, clubApi } from '../../api';
import Stars from '../../components/common/Stars';
import { initials, formatMoney } from '../../lib/format';
import { useScrollRevealGroup, useScrollReveal } from '../../hooks/useScrollReveal';
import { useToast } from '../../context/ToastContext';

const LOCATIONS = [
  { icon: '📍', name: 'Granville', address: '15 Good St, Granville NSW 2142', note: '5 min walk from Granville Station' },
  { icon: '📍', name: 'Campsie', address: '62 Beamish St, Campsie NSW 2194', note: 'Near Campsie Station' },
];

export default function HomePage() {
  const toast = useToast();
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ average_rating: 4.6, total_count: 120 });
  const [joinEmail, setJoinEmail] = useState('');
  const [joinFirstName, setJoinFirstName] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);

  const servicesRef = useScrollRevealGroup();
  const teamRef = useScrollRevealGroup();
  const reviewsRef = useScrollRevealGroup();
  const locationsRef = useScrollRevealGroup(80);
  const joinRef = useScrollReveal();
  const ctaRef = useScrollReveal();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [s, b, r] = await Promise.all([
          servicesApi.list(),
          barbersApi.list(),
          reviewsApi.list({ page_size: 3 }),
        ]);
        if (!alive) return;
        setServices(s.slice(0, 3));
        setBarbers(b.filter((x) => x.status === 'active').slice(0, 3));
        setReviews(r.rows);
        if (r.meta?.summary) setReviewSummary(r.meta.summary);
      } catch {
        /* fallback to empty lists */
      }
    })();
    return () => { alive = false; };
  }, []);

  async function handleJoin(e) {
    e.preventDefault();
    if (!joinEmail.trim() || joinLoading) return;
    setJoinLoading(true);
    try {
      const res = await clubApi.join({ email: joinEmail.trim(), firstName: joinFirstName.trim() || undefined });
      if (res.already_member) {
        toast.info("You're already a member! Check your inbox for exclusive offers.");
      } else {
        toast.success('Welcome to the club! Check your email for your VIP benefits.');
        setJoinEmail('');
        setJoinFirstName('');
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setJoinLoading(false);
    }
  }

  return (
    <>
      {/* Hero — no scroll animation, above the fold */}
      <section className="section text-center">
        <div className="container-page">
          <span
            className="inline-block px-4 py-1.5 rounded-full border text-sm tracking-wider font-display"
            style={{ borderColor: '#D4A843', color: '#D4A843', backgroundColor: 'rgba(212,168,67,0.08)' }}
          >
            📍 GRANVILLE &amp; CAMPSIE · TWO LOCATIONS
          </span>
          <h1
            className="font-display uppercase tracking-wide leading-tight mt-6"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 5.5rem)' }}
          >
            PRECISION <span className="text-pink-500">CUTS.</span><br />
            PREMIUM <span className="text-pink-500">EXPERIENCE.</span>
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-lg" style={{ color: 'var(--lb-text-muted)' }}>
            No waiting. Premium haircuts and grooming trusted by 120+ satisfied clients across Granville and Campsie.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Stars value={reviewSummary.average_rating} />
            <span className="text-sm" style={{ color: 'var(--lb-text-muted)' }}>
              {reviewSummary.average_rating} ({reviewSummary.total_count}+ Reviews)
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link href="/booking" className="btn-primary">Book your cut now</Link>
            <Link href="/contact" className="btn-secondary">Get in touch</Link>
          </div>
          <p className="mt-6 text-xs tracking-widest uppercase" style={{ color: 'var(--lb-text-muted)', opacity: 0.7 }}>
            🚶 5 min walk from Granville Station · Campsie CBD
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="section-tight">
        <div className="container-page text-center">
          <div className="flex items-center justify-center gap-3 mb-1">
            <span className="h-px w-8 bg-gold-400 inline-block" />
            <span className="text-gold-400 text-xs tracking-widest uppercase font-display">Premium</span>
            <span className="h-px w-8 bg-gold-400 inline-block" />
          </div>
          <h2 className="h-section text-gold-400">Our Services</h2>
          <p className="mt-2" style={{ color: 'var(--lb-text-muted)' }}>Premium barbering services tailored to your style</p>
          <div ref={servicesRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10 text-left">
            {services.map((s, i) => (
              <div
                key={s.id}
                className="card-padded relative overflow-hidden"
                style={{ borderLeft: '3px solid #D4A843' }}
              >
                {i === 0 && (
                  <span className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-display tracking-widest uppercase bg-red-600 text-white">
                    HOT
                  </span>
                )}
                <h3 className="font-display tracking-wider uppercase text-xl">{s.name}</h3>
                <p className="text-gold-400 font-display text-3xl mt-2">{formatMoney(s.price_cents)}</p>
                <p className="text-sm mt-3" style={{ color: 'var(--lb-text-muted)' }}>{s.description}</p>
              </div>
            ))}
          </div>
          <Link href="/services" className="btn-primary mt-8">View all services</Link>
        </div>
      </section>

      {/* Team */}
      <section className="section-tight">
        <div className="container-page text-center">
          <div className="flex items-center justify-center gap-3 mb-1">
            <span className="h-px w-8 bg-gold-400 inline-block" />
            <span className="text-gold-400 text-xs tracking-widest uppercase font-display">Expert</span>
            <span className="h-px w-8 bg-gold-400 inline-block" />
          </div>
          <h2 className="h-section text-gold-400">Meet our team</h2>
          <p className="mt-2" style={{ color: 'var(--lb-text-muted)' }}>Expert barbers with years of experience</p>
          <div ref={teamRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
            {barbers.map((b) => (
              <div key={b.id} className="card overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
                  <span className="font-display text-6xl keep-white">
                    {initials(b.first_name, b.last_name)}
                  </span>
                </div>
                <div className="p-5 text-center">
                  <h3 className="font-display tracking-wider uppercase text-xl">{b.first_name}</h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--lb-text-muted)' }}>{b.specialty || 'Barber'}</p>
                  <div className="mt-3"><Stars value={b.rating} /></div>
                  <p className="text-gold-400 text-xs mt-1">{Number(b.rating).toFixed(1)}/5</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/team" className="btn-primary mt-8">View full team</Link>
        </div>
      </section>

      {/* Reviews */}
      <section className="section-tight">
        <div className="container-page text-center">
          <div className="flex items-center justify-center gap-3 mb-1">
            <span className="h-px w-8 bg-gold-400 inline-block" />
            <span className="text-gold-400 text-xs tracking-widest uppercase font-display">Trusted</span>
            <span className="h-px w-8 bg-gold-400 inline-block" />
          </div>
          <h2 className="h-section text-gold-400">Customer Reviews</h2>
          <p className="mt-2" style={{ color: 'var(--lb-text-muted)' }}>What our clients say about us</p>
          <div ref={reviewsRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10 text-left">
            {reviews.map((r) => (
              <div key={r.id} className="card-padded">
                <Stars value={r.rating} />
                <p className="text-sm mt-3 italic" style={{ color: 'var(--lb-text)' }}>"{r.comment}"</p>
                <p className="text-sm mt-3" style={{ color: 'var(--lb-text-muted)' }}>— {r.customer_name}</p>
              </div>
            ))}
          </div>
          <Link href="/reviews" className="btn-primary mt-8">View all reviews</Link>
        </div>
      </section>

      {/* Locations */}
      <section className="section-tight" id="locations">
        <div className="container-page text-center">
          <div className="flex items-center justify-center gap-3 mb-1">
            <span className="h-px w-8 bg-gold-400 inline-block" />
            <span className="text-gold-400 text-xs tracking-widest uppercase font-display">Find Us</span>
            <span className="h-px w-8 bg-gold-400 inline-block" />
          </div>
          <h2 className="h-section text-gold-400">Two Locations</h2>
          <p className="mt-2" style={{ color: 'var(--lb-text-muted)' }}>Serving Granville and Campsie communities</p>
          <div ref={locationsRef} className="grid sm:grid-cols-2 gap-6 mt-10 max-w-2xl mx-auto text-left">
            {LOCATIONS.map((loc) => (
              <div key={loc.name} className="card-padded" style={{ borderTop: '3px solid #D4A843' }}>
                <p className="text-gold-400 text-xs tracking-widest uppercase font-display mb-2">{loc.icon} {loc.name}</p>
                <p className="font-semibold" style={{ color: 'var(--lb-text)' }}>{loc.address}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--lb-text-muted)' }}>{loc.note}</p>
                <p className="text-xs mt-2" style={{ color: 'var(--lb-text-muted)' }}>Open every day · 9 am – 7 pm</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join the Club */}
      <section className="section-tight" id="join">
        <div ref={joinRef} className="container-narrow text-center">
          <div
            className="card-padded relative overflow-hidden"
            style={{ borderTop: '3px solid #D4A843' }}
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="h-px w-8 bg-gold-400 inline-block" />
              <span className="text-gold-400 text-xs tracking-widest uppercase font-display">Exclusive</span>
              <span className="h-px w-8 bg-gold-400 inline-block" />
            </div>
            <h2 className="h-section text-gold-400">Join the Club</h2>
            <p className="mt-3 max-w-md mx-auto" style={{ color: 'var(--lb-text-muted)' }}>
              Sign up for exclusive deals, early booking access, and special member offers. No spam — just cuts.
            </p>
            <form onSubmit={handleJoin} className="mt-6 max-w-sm mx-auto space-y-3">
              <input
                type="text"
                value={joinFirstName}
                onChange={(e) => setJoinFirstName(e.target.value)}
                placeholder="First name (optional)"
                className="form-input w-full"
              />
              <div className="flex gap-3">
                <input
                  type="email"
                  required
                  value={joinEmail}
                  onChange={(e) => setJoinEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="form-input flex-1"
                />
                <button
                  type="submit"
                  disabled={joinLoading}
                  className="btn-primary whitespace-nowrap disabled:opacity-60"
                  style={{ backgroundImage: 'linear-gradient(135deg, #D4A843, #c49a38)', boxShadow: '0 0 16px rgba(212,168,67,0.3)' }}
                >
                  {joinLoading ? 'Joining…' : 'Join Now'}
                </button>
              </div>
            </form>
            <p className="text-xs mt-3" style={{ color: 'var(--lb-text-muted)', opacity: 0.7 }}>
              🔒 Your details are safe with us. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section ref={ctaRef} className="section-tight">
        <div className="container-narrow text-center">
          <h2 className="h-section">Ready for your next cut?</h2>
          <p className="mt-2" style={{ color: 'var(--lb-text-muted)' }}>Book your appointment now and experience premium barbering</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Link href="/booking" className="btn-primary">Book now</Link>
            <Link href="/contact" className="btn-secondary">Contact us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
