import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { servicesApi } from '../../api';
import { useBooking } from '../../context/BookingContext';
import { formatMoney } from '../../lib/format';
import { PageLoader } from '../../components/common/Spinner';
import { useScrollRevealGroup } from '../../hooks/useScrollReveal';

export default function ServicesPage() {
  const [services, setServices] = useState(null);
  const [, navigate] = useLocation();
  const { set } = useBooking();
  const cardsRef = useScrollRevealGroup();

  useEffect(() => {
    let alive = true;
    servicesApi.list().then((d) => alive && setServices(d)).catch(() => alive && setServices([]));
    return () => { alive = false; };
  }, []);

  function bookService(svc) {
    set({ service: svc, step: 2 });
    navigate('/booking');
  }

  if (!services) return <PageLoader />;

  return (
    <>
      <section className="section text-center">
        <div className="container-page">
          <div className="flex items-center justify-center gap-3 mb-1">
            <span className="h-px w-8 bg-gold-400 inline-block" />
            <span className="text-gold-400 text-xs tracking-widest uppercase font-display">Premium</span>
            <span className="h-px w-8 bg-gold-400 inline-block" />
          </div>
          <h1 className="h-display text-gold-400">Our Services</h1>
          <p className="mt-3" style={{ color: 'var(--lb-text-muted)' }}>Premium barbering services tailored to your style and needs</p>
        </div>
      </section>

      <section className="container-page pb-12">
        <div ref={cardsRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <div key={s.id} className="card-padded relative overflow-hidden" style={{ borderLeft: '3px solid #D4A843' }}>
              {i === 0 && (
                <span className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-display tracking-widest uppercase bg-red-600 text-white">
                  POPULAR
                </span>
              )}
              <h3 className="font-display tracking-wider uppercase text-2xl" style={{ color: 'var(--lb-text)' }}>{s.name}</h3>
              <p className="text-gold-400 font-display text-4xl mt-2">{formatMoney(s.price_cents)}</p>
              <p className="text-sm mt-4" style={{ color: 'var(--lb-text-muted)' }}>{s.description}</p>
              <p className="text-xs mt-4 tracking-widest uppercase" style={{ color: 'var(--lb-text-muted)', opacity: 0.7 }}>{s.duration_minutes} min</p>
              <button onClick={() => bookService(s)} className="btn-primary mt-5 w-full">Book Now</button>
            </div>
          ))}
        </div>
      </section>

      <section className="section-tight">
        <div className="container-page text-center">
          <h2 className="h-section text-gold-400">Pricing Overview</h2>
          <p className="mt-2" style={{ color: 'var(--lb-text-muted)' }}>All services include complimentary consultation and premium finishing</p>

          <div className="card mt-10 overflow-hidden">
            <table className="w-full text-left">
              <thead style={{ borderBottom: '1px solid var(--lb-border)' }}>
                <tr>
                  <th className="p-4 text-xs uppercase tracking-widest" style={{ color: 'var(--lb-text-muted)' }}>Service</th>
                  <th className="p-4 text-xs uppercase tracking-widest" style={{ color: 'var(--lb-text-muted)' }}>Duration</th>
                  <th className="p-4 text-xs uppercase tracking-widest hidden md:table-cell" style={{ color: 'var(--lb-text-muted)' }}>Description</th>
                  <th className="p-4 text-xs uppercase tracking-widest text-right" style={{ color: 'var(--lb-text-muted)' }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s, i) => (
                  <tr key={s.id} style={{ borderTop: i > 0 ? '1px solid var(--lb-border)' : undefined }}>
                    <td className="p-4 font-semibold" style={{ color: 'var(--lb-text)' }}>{s.name}</td>
                    <td className="p-4" style={{ color: 'var(--lb-text-muted)' }}>{s.duration_minutes} min</td>
                    <td className="p-4 hidden md:table-cell" style={{ color: 'var(--lb-text-muted)' }}>{s.description}</td>
                    <td className="p-4 text-right text-gold-400 font-display text-xl">{formatMoney(s.price_cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Link href="/booking" className="btn-primary mt-10">Book an appointment</Link>
        </div>
      </section>
    </>
  );
}
