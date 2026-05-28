import { useEffect, useState } from 'react';
import { barbersApi } from '../../api';
import Stars from '../../components/common/Stars';
import BarberAvatar from '../../components/common/BarberAvatar';
import { PageLoader } from '../../components/common/Spinner';
import { useScrollRevealGroup } from '../../hooks/useScrollReveal';

export default function TeamPage() {
  const [barbers, setBarbers] = useState(null);
  const teamRef = useScrollRevealGroup();

  useEffect(() => {
    let alive = true;
    barbersApi.list().then((d) => alive && setBarbers(d)).catch(() => alive && setBarbers([]));
    return () => { alive = false; };
  }, []);

  if (!barbers) return <PageLoader />;

  return (
    <>
      <section className="section text-center">
        <div className="container-page">
          <div className="flex items-center justify-center gap-3 mb-1">
            <span className="h-px w-8 bg-gold-400 inline-block" />
            <span className="text-gold-400 text-xs tracking-widest uppercase font-display">Expert</span>
            <span className="h-px w-8 bg-gold-400 inline-block" />
          </div>
          <h1 className="h-display text-gold-400">Meet our team</h1>
          <p className="mt-3" style={{ color: 'var(--lb-text-muted)' }}>Expert barbers with years of industry experience</p>
        </div>
      </section>

      <section className="container-page pb-16">
        <div ref={teamRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {barbers.map((b) => (
            <div key={b.id} className="card overflow-hidden">
              <div className="pt-8 flex items-center justify-center">
                <BarberAvatar barber={b} sizeClass="w-[120px] h-[120px] md:w-[150px] md:h-[150px]" size={150} borderWidth={3} hover />
              </div>
              <div className="p-6 text-center">
                <h3 className="font-display tracking-wider uppercase text-xl" style={{ color: 'var(--lb-text)' }}>
                  {b.first_name} {b.last_name}
                </h3>
                <p className="text-sm mt-1" style={{ color: 'var(--lb-text-muted)' }}>{b.specialty || 'Barber'}</p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <Stars value={b.rating} />
                  <span className="text-gold-400 text-sm">{Number(b.rating).toFixed(1)}/5</span>
                </div>
                {b.bio && <p className="mt-4 text-sm text-left" style={{ color: 'var(--lb-text-muted)' }}>{b.bio}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
