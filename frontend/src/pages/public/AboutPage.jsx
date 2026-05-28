import { useState } from 'react';
import { Link } from 'wouter';
import { useScrollRevealGroup, useScrollReveal } from '../../hooks/useScrollReveal';

const VALUES = [
  { icon: '🎯', title: 'Precision', desc: 'Every cut is delivered with meticulous attention to detail and craftsmanship.' },
  { icon: '⭐', title: 'Excellence', desc: 'We strive for excellence in every aspect of service delivery and customer experience.' },
  { icon: '🤝', title: 'Community', desc: 'We believe in building genuine relationships with our clients and supporting the local community.' },
  { icon: '⚡', title: 'Efficiency', desc: 'Respect for your time means no long waits and seamless service delivery.' },
];

const TIMELINE = [
  { year: '2020', title: 'Founded', desc: 'Lazy Barbers officially opened its doors in Granville with a vision to revolutionize the barbering experience.' },
  { year: '2021', title: 'Growth', desc: 'Expanded team with expert barbers. Reached 50+ satisfied clients and maintained 4.6+ star rating.' },
  { year: '2022', title: 'Recognition', desc: 'Recognized as one of the best barbershops in the region with 100+ customer reviews.' },
  { year: '2023', title: 'Expansion', desc: 'Introduced premium services and online booking system to enhance customer convenience.' },
  { year: '2024+', title: 'Future', desc: 'Continuing to innovate and serve our growing community with exceptional barbering services.' },
];

const AWARDS = [
  { icon: '🥇', title: 'Winner', sub: 'Local Business Award 2024', desc: 'Recognised for outstanding customer service and community contribution in the local area.' },
  { icon: '🥇', title: 'Finalist', sub: 'Australian Business Award 2024', desc: 'Nominated among the top barbershops in Australia for innovation in service delivery.' },
];

const LOCATIONS = [
  { icon: '📍', name: 'Granville', address: '15 Good St, Granville NSW 2142', note: '5 min walk from Granville Station', phone: '+61 416 065 592' },
  { icon: '📍', name: 'Campsie', address: '62 Beamish St, Campsie NSW 2194', note: 'Near Campsie Station', phone: '+61 416 065 592' },
];

const TERMS = [
  {
    title: 'Cancellation Policy',
    body: 'We require a minimum of 24 hours notice to cancel or reschedule your booking. Cancellations made with less than 24 hours notice may forfeit any deposit paid.',
  },
  {
    title: 'Refund Policy',
    body: 'If you are not satisfied with your service, please contact us within 48 hours. We offer complimentary adjustments or a full refund where the service was not delivered as expected.',
  },
  {
    title: 'Late Arrival Policy',
    body: 'We allow a 15-minute grace period for late arrivals. After 15 minutes, your booking may be cancelled and your appointment slot given to the next customer.',
  },
  {
    title: 'No-Show Policy',
    body: 'Repeated no-shows (3 or more) may result in booking restrictions or a requirement to pay a deposit for future appointments.',
  },
  {
    title: 'Payment Terms',
    body: 'Online payments are processed securely via Stripe. Counter payments (cash, card, Apple Pay) are accepted at our locations. All prices are in AUD and inclusive of GST.',
  },
  {
    title: 'Privacy Policy',
    body: 'Your personal information (name, email, phone, booking history) is stored securely and used solely to manage your appointments. We do not share your data with third parties. You may request deletion of your data at any time by contacting us.',
  },
];

export default function AboutPage() {
  const valuesRef = useScrollRevealGroup();
  const timelineRef = useScrollRevealGroup(80);
  const awardsRef = useScrollRevealGroup();
  const locationsRef = useScrollRevealGroup(80);
  const storyRef = useScrollReveal();
  const termsRef = useScrollReveal();

  return (
    <>
      <section className="section text-center">
        <div className="container-page">
          <div className="flex items-center justify-center gap-3 mb-1">
            <span className="h-px w-8 bg-gold-400 inline-block" />
            <span className="text-gold-400 text-xs tracking-widest uppercase font-display">Our Story</span>
            <span className="h-px w-8 bg-gold-400 inline-block" />
          </div>
          <h1 className="h-display">About Lazy Barbers</h1>
          <p className="mt-3 max-w-xl mx-auto" style={{ color: 'var(--lb-text-muted)' }}>
            Precision cuts. Premium experience. No waiting.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="container-page pb-12">
        <div ref={storyRef} className="max-w-3xl">
          <h2 className="h-section text-gold-400">Our Story</h2>
          <div className="mt-6 space-y-4 leading-relaxed" style={{ color: 'var(--lb-text-muted)' }}>
            <p>
              Lazy Barbers was founded with a simple mission: to provide premium barbering services
              without the hassle of long wait times. We believe that everyone deserves access to
              high-quality grooming services delivered by skilled professionals in a welcoming atmosphere.
            </p>
            <p>
              Starting in the heart of Granville — just a 5-minute walk from the station — we've grown
              to serve the Campsie community too. Over 120+ satisfied clients trust us with their
              grooming needs, and we're just getting started.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container-page pb-16">
        <h2 className="h-section text-gold-400">Our Values</h2>
        <div ref={valuesRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {VALUES.map((v) => (
            <div key={v.title} className="card-padded text-center" style={{ borderTop: '3px solid #D4A843' }}>
              <div className="text-4xl">{v.icon}</div>
              <h3 className="font-display uppercase tracking-wider mt-3" style={{ color: 'var(--lb-text)' }}>{v.title}</h3>
              <p className="text-sm mt-2" style={{ color: 'var(--lb-text-muted)' }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Awards */}
      <section className="container-page pb-16" id="awards">
        <div className="flex items-center gap-3 mb-6">
          <span className="h-px w-8 bg-gold-400 inline-block" />
          <h2 className="h-section text-gold-400">Awards &amp; Recognition</h2>
        </div>
        <div ref={awardsRef} className="grid sm:grid-cols-2 gap-6">
          {AWARDS.map((a) => (
            <div key={a.sub} className="card-padded flex gap-4 items-start" style={{ borderLeft: '4px solid #D4A843' }}>
              <span className="text-4xl flex-shrink-0">{a.icon}</span>
              <div>
                <p className="text-gold-400 text-xs tracking-widest uppercase font-display">{a.title}</p>
                <h3 className="font-display tracking-wider uppercase mt-1" style={{ color: 'var(--lb-text)' }}>{a.sub}</h3>
                <p className="text-sm mt-2" style={{ color: 'var(--lb-text-muted)' }}>{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-6 mt-6">
          {['/gallery/award/award1.jpg', '/gallery/award/award3.jpg'].map((src) => (
            <img
              key={src}
              src={src}
              alt="Lazy Barbers award"
              loading="lazy"
              className="w-full object-cover"
              style={{
                maxHeight: '300px',
                borderRadius: '12px',
                border: '2px solid #D4A843',
                boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
              }}
            />
          ))}
        </div>
      </section>

      {/* Journey */}
      <section className="container-page pb-16">
        <h2 className="h-section text-gold-400">Our Journey</h2>
        <div ref={timelineRef} className="mt-6 space-y-4">
          {TIMELINE.map((item) => (
            <div key={item.year} className="card-padded grid sm:grid-cols-[120px_1fr] gap-4">
              <p className="text-gold-400 font-display text-2xl">{item.year}</p>
              <div>
                <h3 className="font-display uppercase tracking-wider" style={{ color: 'var(--lb-text)' }}>{item.title}</h3>
                <p className="text-sm mt-1" style={{ color: 'var(--lb-text-muted)' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Locations */}
      <section className="container-page pb-16" id="locations">
        <div className="flex items-center gap-3 mb-6">
          <span className="h-px w-8 bg-gold-400 inline-block" />
          <h2 className="h-section text-gold-400">Our Locations</h2>
        </div>
        <div ref={locationsRef} className="grid sm:grid-cols-2 gap-6">
          {LOCATIONS.map((loc) => (
            <div key={loc.name} className="card-padded" style={{ borderTop: '3px solid #D4A843' }}>
              <p className="text-gold-400 text-xs tracking-widest uppercase font-display mb-2">{loc.icon} {loc.name}</p>
              <p className="font-semibold text-lg" style={{ color: 'var(--lb-text)' }}>{loc.address}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--lb-text-muted)' }}>{loc.note}</p>
              <p className="text-sm mt-3" style={{ color: 'var(--lb-text-muted)' }}>
                <span className="text-pink-500">📞</span>{' '}
                <a href={`tel:${loc.phone.replace(/\s/g, '')}`} className="hover:text-pink-500 transition-colors">{loc.phone}</a>
              </p>
              <p className="text-xs mt-2" style={{ color: 'var(--lb-text-muted)' }}>Open every day · 9 am – 7 pm</p>
            </div>
          ))}
        </div>
      </section>

      {/* Terms & Conditions */}
      <section className="container-page pb-24" id="terms">
        <div ref={termsRef}>
          <div className="flex items-center gap-3 mb-2">
            <span className="h-px w-8 bg-gold-400 inline-block" />
            <span className="text-gold-400 text-xs tracking-widest uppercase font-display">Policies</span>
          </div>
          <h2 className="h-section text-gold-400 mb-8">Terms &amp; Conditions</h2>
          <div className="space-y-4 max-w-3xl">
            {TERMS.map((t) => (
              <TermsItem key={t.title} title={t.title} body={t.body} />
            ))}
          </div>
          <p className="mt-8 text-sm" style={{ color: 'var(--lb-text-muted)' }}>
            For any questions about our policies, please{' '}
            <Link href="/contact" className="text-pink-500 hover:underline">contact us</Link>{' '}
            or call <a href="tel:+61416065592" className="text-pink-500 hover:underline">+61 416 065 592</a>.
          </p>
        </div>
      </section>
    </>
  );
}

function TermsItem({ title, body }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-5 text-left transition-colors"
        style={{ color: 'var(--lb-text)' }}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-display uppercase tracking-wider text-sm">{title}</span>
        <span className="text-gold-400 text-xl ml-4 flex-shrink-0" style={{ transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm leading-relaxed" style={{ color: 'var(--lb-text-muted)', borderTop: '1px solid var(--lb-border)' }}>
          <p className="pt-4">{body}</p>
        </div>
      )}
    </div>
  );
}
