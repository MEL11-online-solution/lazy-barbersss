import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { barberPortalApi, bookingsApi } from '../../api';
import { formatDate, formatTime, statusLabel } from '../../lib/format';
import { PageLoader } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';

export default function BarberDashboardPage() {
  const toast = useToast();
  const [today, setToday] = useState(null);
  const [upcoming, setUpcoming] = useState(null);
  const [tab, setTab] = useState('appointments');
  const [busyId, setBusyId] = useState(null);

  async function refresh() {
    try {
      const [t, all] = await Promise.all([
        barberPortalApi.appointmentsToday(),
        barberPortalApi.appointments(tab === 'completed' ? 'completed' : 'scheduled'),
      ]);
      setToday(t);
      const now = Date.now();
      const threeDays = now + 3 * 86400000;
      const future = all.filter((b) => {
        const start = new Date(b.start_at).getTime();
        return start > now && start <= threeDays;
      });
      setUpcoming(tab === 'completed' ? all : future);
    } catch (e) {
      toast.error(e.message || 'Could not load schedule');
      setToday([]); setUpcoming([]);
    }
  }

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [tab]);

  async function setStatus(id, status) {
    setBusyId(id);
    try {
      await bookingsApi.setStatus(id, status);
      toast.success(`Marked ${statusLabel(status)}`);
      await refresh();
    } catch (e) {
      toast.error(e.message || 'Update failed');
    } finally {
      setBusyId(null);
    }
  }

  if (!today || !upcoming) return <PageLoader />;

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="h-display">My Schedule</h1>
          <p className="mt-1" style={{ color: 'var(--lb-text-muted)' }}>View your appointments and manage time-off</p>
        </div>
        <Link href="/barber/time-off" className="btn-primary">Apply for Time-Off</Link>
      </div>

      <div className="flex gap-6 mt-6" style={{ borderBottom: '1px solid var(--lb-border)' }}>
        {['appointments', 'completed'].map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`pb-3 text-sm font-display tracking-widest uppercase border-b-2 transition-colors ${
              tab === k ? 'border-pink-500 text-pink-500' : 'border-transparent'
            }`}
            style={tab !== k ? { color: 'var(--lb-text-muted)' } : undefined}
          >
            {k === 'appointments' ? 'Appointments' : 'Completed'}
          </button>
        ))}
      </div>

      {tab === 'appointments' && (
        <>
          <h2 className="h-section text-2xl mt-8">Today's Appointments</h2>
          <BookingTable rows={today} showActions onAction={setStatus} busyId={busyId} columns={['time', 'customer', 'service', 'status', 'actions']} />

          <h2 className="h-section text-2xl mt-10">Next 3 Days</h2>
          <BookingTable rows={upcoming} columns={['date', 'time', 'customer', 'service', 'status']} />
        </>
      )}

      {tab === 'completed' && (
        <>
          <h2 className="h-section text-2xl mt-8">Completed Bookings</h2>
          <BookingTable rows={upcoming} columns={['date', 'time', 'customer', 'service', 'status']} />
        </>
      )}
    </>
  );
}

function BookingTable({ rows, columns, showActions, onAction, busyId }) {
  if (!rows || rows.length === 0) {
    return <div className="card p-6 mt-3 text-center" style={{ color: 'var(--lb-text-muted)' }}>No appointments to show.</div>;
  }
  const headers = { date: 'Date', time: 'Time', customer: 'Customer', service: 'Service', status: 'Status', actions: 'Actions' };
  return (
    <div className="card mt-3 overflow-x-auto">
      <table className="w-full text-sm">
        <thead style={{ borderBottom: '1px solid var(--lb-border)' }}>
          <tr>
            {columns.map((c) => (
              <th key={c} className="text-left p-4 text-xs uppercase tracking-widest" style={{ color: 'var(--lb-text-muted)' }}>{headers[c]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((b, i) => (
            <tr key={b.id} style={{ borderTop: i > 0 ? '1px solid var(--lb-border)' : undefined }}>
              {columns.includes('date') && <td className="p-4" style={{ color: 'var(--lb-text-muted)' }}>{formatDate(b.start_at)}</td>}
              {columns.includes('time') && <td className="p-4 font-semibold" style={{ color: 'var(--lb-text)' }}>{formatTime(b.start_at)}</td>}
              {columns.includes('customer') && (
                <td className="p-4" style={{ color: 'var(--lb-text)' }}>{b.customer_first_name} {b.customer_last_name}</td>
              )}
              {columns.includes('service') && <td className="p-4" style={{ color: 'var(--lb-text)' }}>{b.service_name}</td>}
              {columns.includes('status') && (
                <td className="p-4"><span className={`badge-${b.status}`}>{statusLabel(b.status)}</span></td>
              )}
              {columns.includes('actions') && (
                <td className="p-4">
                  {(b.status === 'confirmed' || b.status === 'pending') ? (
                    <div className="flex gap-2">
                      <button onClick={() => onAction(b.id, 'completed')} disabled={busyId === b.id} className="btn-secondary btn-sm">
                        Mark Done
                      </button>
                      <button onClick={() => onAction(b.id, 'no_show')} disabled={busyId === b.id} className="btn-ghost btn-sm text-red-500">
                        No Show
                      </button>
                    </div>
                  ) : '—'}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
