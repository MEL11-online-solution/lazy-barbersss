import { useEffect, useState } from 'react';
import { adminApi } from '../../api';
import { formatTime, formatMoney, statusLabel } from '../../lib/format';
import { PageLoader } from '../../components/common/Spinner';
import RevenueChart from '../../components/admin/RevenueChart';
import { Link } from 'wouter';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState(null);
  const [today, setToday] = useState(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      adminApi.stats(),
      adminApi.bookings({ page: 1, page_size: 5 }),
      adminApi.schedule(),
    ])
      .then(([s, r, sched]) => {
        if (!alive) return;
        setStats(s);
        setRecent(r.rows);
        const flat = sched.schedule
          .flatMap((entry) =>
            entry.bookings.map((b) => ({
              ...b,
              barber_name: `${entry.barber.first_name} ${entry.barber.last_name.charAt(0)}.`,
            }))
          )
          .sort((a, b) => a.start_at.localeCompare(b.start_at));
        setToday(flat);
      })
      .catch(() => alive && setStats({ bookings_today: 0, weekly_revenue: 0, total_customers: 0, active_barbers: 0 }));
    return () => { alive = false; };
  }, []);

  if (!stats || !recent || !today) return <PageLoader />;

  return (
    <>
      <div>
        <h1 className="h-display">Dashboard</h1>
        <p className="mt-1" style={{ color: 'var(--lb-text-muted)' }}>Welcome back. Here's your business snapshot.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <Stat
          label="Today's bookings"
          value={stats.bookings_today}
          delta={stats.bookings_yesterday_delta != null
            ? `${stats.bookings_yesterday_delta >= 0 ? '+' : ''}${stats.bookings_yesterday_delta} from yesterday`
            : null}
        />
        <Stat label="Weekly revenue" value={formatMoney(stats.weekly_revenue * 100)} />
        <Stat label="Total customers" value={stats.total_customers} delta="+ all time" />
        <Stat label="Active barbers" value={stats.active_barbers} delta="All available" />
      </div>

      <div className="mt-8">
        <RevenueChart days={7} variant="compact" title="Revenue" />
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="h-section text-2xl">Recent bookings</h2>
        <Link href="/admin/schedule" className="text-pink-500 text-sm hover:underline">View all →</Link>
      </div>
      <div className="card mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ borderBottom: '1px solid var(--lb-border)' }}>
            <tr>
              {['ID', 'Customer', 'Service', 'Time', 'Status'].map((h) => (
                <th key={h} className="text-left p-4 text-xs uppercase tracking-widest" style={{ color: 'var(--lb-text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.map((b, i) => (
              <tr key={b.id} style={{ borderTop: i > 0 ? '1px solid var(--lb-border)' : undefined }}>
                <td className="p-4 text-pink-500 font-mono text-xs">{b.reference}</td>
                <td className="p-4" style={{ color: 'var(--lb-text)' }}>{b.customer_first_name} {b.customer_last_name}</td>
                <td className="p-4" style={{ color: 'var(--lb-text)' }}>{b.service_name}</td>
                <td className="p-4" style={{ color: 'var(--lb-text-muted)' }}>{formatTime(b.start_at)}</td>
                <td className="p-4"><span className={`badge-${b.status}`}>{statusLabel(b.status)}</span></td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr><td colSpan="5" className="p-8 text-center" style={{ color: 'var(--lb-text-muted)' }}>No bookings yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="h-section text-2xl mt-10">Today's schedule</h2>
      <div className="card-padded mt-3">
        {today.length === 0 ? (
          <p className="text-center py-8" style={{ color: 'var(--lb-text-muted)' }}>Nothing scheduled today.</p>
        ) : (
          <ul className="space-y-3">
            {today.map((b) => (
              <li key={b.id} className="grid grid-cols-[80px_1fr_auto] gap-4 items-center">
                <span className="font-display text-pink-500">{formatTime(b.start_at)}</span>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--lb-text)' }}>{b.service_name}</p>
                  <p className="text-xs" style={{ color: 'var(--lb-text-muted)' }}>
                    {b.customer_first_name} {b.customer_last_name} → {b.barber_name}
                  </p>
                </div>
                <span className={`badge-${b.status}`}>{statusLabel(b.status)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function Stat({ label, value, delta }) {
  return (
    <div className="card-padded">
      <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--lb-text-muted)' }}>{label}</p>
      <p className="text-3xl font-display mt-2" style={{ color: 'var(--lb-text)' }}>{value}</p>
      {delta && <p className="text-emerald-500 text-xs mt-2">{delta}</p>}
    </div>
  );
}
