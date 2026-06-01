import { useEffect, useState } from 'react';
import { adminApi } from '../../api';
import { formatTime, statusLabel, initials } from '../../lib/format';
import { PageLoader } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';

function BarberAvatar({ barber }) {
  const [failed, setFailed] = useState(false);
  const fullName = `${barber.first_name || ''} ${barber.last_name || ''}`.trim();
  if (barber.avatar_url && !failed) {
    return (
      <img
        src={barber.avatar_url}
        alt={fullName}
        onError={() => setFailed(true)}
        className="w-10 h-10 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-sm font-bold keep-white">
      {initials(barber.first_name, barber.last_name)}
    </div>
  );
}

export default function AdminSchedulePage() {
  const toast = useToast();
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [schedule, setSchedule] = useState(null);

  useEffect(() => {
    let alive = true;
    adminApi
      .schedule(date)
      .then((d) => alive && setSchedule(d.schedule))
      .catch((e) => {
        toast.error(e.message || 'Failed to load schedule');
        if (alive) setSchedule([]);
      });
    return () => { alive = false; };
  }, [date, toast]);

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="h-display">Schedule</h1>
          <p className="mt-1" style={{ color: 'var(--lb-text-muted)' }}>All barbers' bookings for the selected day</p>
        </div>
        <input
          type="date"
          className="form-input max-w-xs"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {!schedule ? (
        <PageLoader />
      ) : schedule.length === 0 ? (
        <p className="text-center py-12" style={{ color: 'var(--lb-text-muted)' }}>No barbers configured.</p>
      ) : (
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-8">
          {schedule.map(({ barber, bookings }) => (
            <div key={barber.id} className="card-padded">
              <div className="flex items-center gap-3">
                <BarberAvatar barber={barber} />
                <div>
                  <p className="font-display tracking-wider uppercase" style={{ color: 'var(--lb-text)' }}>{barber.first_name} {barber.last_name}</p>
                  <p className="text-xs" style={{ color: 'var(--lb-text-muted)' }}>{barber.specialty || 'Barber'}</p>
                </div>
                <span className={`ml-auto badge-${barber.status}`}>{statusLabel(barber.status)}</span>
              </div>

              <div className="mt-4 space-y-2">
                {bookings.length === 0 ? (
                  <p className="text-sm" style={{ color: 'var(--lb-text-muted)' }}>No bookings.</p>
                ) : (
                  bookings.map((b) => (
                    <div key={b.id} className="card p-3 grid grid-cols-[64px_1fr_auto] gap-2 items-center">
                      <span className="font-display text-pink-500">{formatTime(b.start_at)}</span>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--lb-text)' }}>{b.service_name}</p>
                        <p className="text-xs" style={{ color: 'var(--lb-text-muted)' }}>{b.customer_first_name} {b.customer_last_name}</p>
                      </div>
                      <span className={`badge-${b.status}`}>{statusLabel(b.status)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
