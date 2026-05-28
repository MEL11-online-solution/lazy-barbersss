import { useEffect, useState } from 'react';
import { servicesApi, barbersApi } from '../../api';
import { useBooking } from '../../context/BookingContext';
import { formatMoney } from '../../lib/format';
import Spinner from '../common/Spinner';
import BarberAvatar from '../common/BarberAvatar';

export default function StepService({ onBack, onNext }) {
  const { state, set } = useBooking();
  const [services, setServices] = useState(null);
  const [barbers, setBarbers] = useState([]);

  useEffect(() => {
    let alive = true;
    Promise.all([servicesApi.list(), barbersApi.list()])
      .then(([s, b]) => {
        if (!alive) return;
        setServices(s);
        setBarbers(b.filter((x) => x.status === 'active'));
      })
      .catch(() => alive && setServices([]));
    return () => { alive = false; };
  }, []);

  if (!services) return <Spinner size="lg" />;

  const selected = state.service;

  return (
    <div className="grid lg:grid-cols-2 gap-4 mt-4">
      <div className="card-padded">
        <h3 className="font-display uppercase tracking-widest" style={{ color: 'var(--lb-text)' }}>Select your service</h3>

        <label className="form-label mt-6">Service *</label>
        <select
          className="form-select"
          value={selected?.id || ''}
          onChange={(e) => {
            const svc = services.find((s) => String(s.id) === e.target.value);
            set({ service: svc || null });
          }}
        >
          <option value="">Choose a service…</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {formatMoney(s.price_cents)}
            </option>
          ))}
        </select>

        <label className="form-label mt-6">Preferred barber</label>
        <select
          className="form-select"
          value={state.barber?.id ?? ''}
          onChange={(e) => {
            if (!e.target.value) return set({ barber: null });
            const b = barbers.find((x) => String(x.id) === e.target.value);
            set({ barber: b || null });
          }}
        >
          <option value="">Any available barber</option>
          {barbers.map((b) => (
            <option key={b.id} value={b.id}>{b.first_name} {b.last_name}</option>
          ))}
        </select>

        {state.barber && (
          <div className="mt-3 flex items-center gap-3 card p-3">
            <BarberAvatar barber={state.barber} size={48} borderWidth={2} />
            <div>
              <p className="font-medium" style={{ color: 'var(--lb-text)' }}>{state.barber.first_name} {state.barber.last_name}</p>
              <p className="text-xs" style={{ color: 'var(--lb-text-muted)' }}>{state.barber.specialty || 'Barber'}</p>
            </div>
          </div>
        )}

        <div className="mt-6 card p-3">
          <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-white/50 mb-2">All services</p>
          <ul className="divide-y divide-navy-500/30">
            {services.map((s) => (
              <li
                key={s.id}
                onClick={() => set({ service: s })}
                className={`p-3 flex items-center justify-between cursor-pointer rounded ${
                  selected?.id === s.id ? 'bg-pink-500/20' : 'hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                <span className="font-medium text-gray-900 dark:text-white">✂️ {s.name}</span>
                <span className="text-gold-400 font-semibold">{formatMoney(s.price_cents)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card-padded">
        <h3 className="font-display uppercase tracking-widest text-pink-500">Selected Service</h3>

        <div className="mt-4">
          {selected ? (
            <>
              <div className="card p-6 flex items-center gap-4">
                <div className="w-16 h-16 rounded bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-2xl">
                  ✂️
                </div>
                <div>
                  <p className="font-display tracking-wider uppercase text-xl text-gray-900 dark:text-white">{selected.name}</p>
                  <p className="text-gray-500 dark:text-white/50 text-xs uppercase tracking-widest">{selected.duration_minutes} min</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-white/80 mt-4 text-sm">{selected.description}</p>
              <div className="mt-6 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-white/50">Price</p>
                  <p className="text-gold-400 font-display text-2xl">From {formatMoney(selected.price_cents)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-white/50">Duration</p>
                  <p className="font-display text-2xl text-gray-900 dark:text-white">~{selected.duration_minutes} min</p>
                </div>
              </div>
            </>
          ) : (
            <div className="card p-12 text-center text-gray-400 dark:text-white/50">Pick a service to see details</div>
          )}
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={onBack} className="btn-secondary flex-1">← Back</button>
          <button
            onClick={onNext}
            disabled={!selected}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            Next: Pick a time →
          </button>
        </div>
      </div>
    </div>
  );
}
