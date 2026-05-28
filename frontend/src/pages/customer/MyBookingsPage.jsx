import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { bookingsApi, availabilityApi } from '../../api';
import { formatDate, formatTime, statusLabel } from '../../lib/format';
import { useToast } from '../../context/ToastContext';
import { PageLoader } from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';

export default function MyBookingsPage() {
  const toast = useToast();
  const [bookings, setBookings] = useState(null);
  const [busyId, setBusyId] = useState(null);

  // Reschedule modal state
  const [rescheduleFor, setRescheduleFor] = useState(null); // booking object
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  async function refresh() {
    try {
      const data = await bookingsApi.listMine();
      setBookings(data);
    } catch (e) {
      toast.error(e.message || 'Could not load bookings');
      setBookings([]);
    }
  }

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, []);

  async function cancel(b) {
    if (!confirm(`Cancel booking ${b.reference}?`)) return;
    setBusyId(b.id);
    try {
      await bookingsApi.cancel(b.id);
      toast.success('Booking cancelled');
      await refresh();
    } catch (e) {
      toast.error(e.message || 'Could not cancel');
    } finally {
      setBusyId(null);
    }
  }

  function openReschedule(b) {
    setRescheduleFor(b);
    setDate(b.start_at.slice(0, 10));
    setSlots([]);
    setSelectedSlot(null);
  }

  async function loadSlots() {
    if (!rescheduleFor || !date) return;
    setLoadingSlots(true);
    try {
      const r = await availabilityApi.get({
        service_id: rescheduleFor.service_id,
        barber_id: rescheduleFor.barber_id,
        date,
      });
      setSlots(r.slots);
    } catch (e) {
      toast.error(e.message || 'Could not load slots');
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  useEffect(() => { if (rescheduleFor) loadSlots(); /* eslint-disable-next-line */ }, [date, rescheduleFor]);

  async function confirmReschedule() {
    if (!selectedSlot) return toast.error('Pick a new time');
    try {
      await bookingsApi.reschedule(rescheduleFor.id, selectedSlot.start_at);
      toast.success('Booking rescheduled');
      setRescheduleFor(null);
      await refresh();
    } catch (e) {
      toast.error(e.message || 'Could not reschedule');
    }
  }

  if (!bookings) return <PageLoader />;

  return (
    <section className="section-tight">
      <div className="container-page">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="h-display">My Bookings</h1>
            <p className="text-white/60 mt-2">View and manage your appointments</p>
          </div>
          <Link href="/booking" className="btn-primary">+ Book Appointment</Link>
        </div>

        <div className="card mt-8 overflow-hidden">
          <div className="hidden md:grid grid-cols-[1.2fr_1fr_1fr_1fr_0.8fr_1.2fr] gap-4 px-6 py-4 border-b border-navy-500/30 text-xs uppercase tracking-widest text-white/60">
            <span>Service</span>
            <span>Barber</span>
            <span>Date</span>
            <span>Time</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>

          {bookings.length === 0 ? (
            <p className="p-8 text-center text-white/60">You don't have any bookings yet.</p>
          ) : (
            <div className="divide-y divide-navy-500/20">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1fr_1fr_0.8fr_1.2fr] gap-4 px-6 py-4 items-center"
                >
                  <div>
                    <p className="md:hidden text-xs text-white/40 uppercase">Service</p>
                    <p className="font-semibold">{b.service_name}</p>
                  </div>
                  <div>
                    <p className="md:hidden text-xs text-white/40 uppercase">Barber</p>
                    <p>{b.barber_first_name} {b.barber_last_name}</p>
                  </div>
                  <div>
                    <p className="md:hidden text-xs text-white/40 uppercase">Date</p>
                    <p>{formatDate(b.start_at)}</p>
                  </div>
                  <div>
                    <p className="md:hidden text-xs text-white/40 uppercase">Time</p>
                    <p>{formatTime(b.start_at)}</p>
                  </div>
                  <div>
                    <span className={`badge-${b.status}`}>{statusLabel(b.status)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    {(b.status === 'confirmed' || b.status === 'pending') ? (
                      <>
                        <button onClick={() => openReschedule(b)} className="btn-secondary btn-sm">
                          Reschedule
                        </button>
                        <button
                          onClick={() => cancel(b)}
                          disabled={busyId === b.id}
                          className="btn-ghost btn-sm text-red-300"
                        >
                          {busyId === b.id ? '...' : 'Cancel'}
                        </button>
                      </>
                    ) : (
                      <span className="text-white/30 text-sm">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={!!rescheduleFor}
        onClose={() => setRescheduleFor(null)}
        title="Reschedule booking"
        footer={
          <>
            <button onClick={() => setRescheduleFor(null)} className="btn-secondary">Cancel</button>
            <button onClick={confirmReschedule} disabled={!selectedSlot} className="btn-primary">
              Confirm new time
            </button>
          </>
        }
      >
        {rescheduleFor && (
          <div className="space-y-4">
            <p className="text-sm text-white/70">
              Currently: <span className="text-white">{formatDate(rescheduleFor.start_at)} · {formatTime(rescheduleFor.start_at)}</span>
            </p>
            <div>
              <label className="form-label">New date</label>
              <input
                type="date"
                className="form-input"
                value={date}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <p className="form-label">New time</p>
              {loadingSlots ? (
                <p className="text-white/50 text-sm">Loading slots…</p>
              ) : slots.length === 0 ? (
                <p className="text-white/50 text-sm">No slots available on that day.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map((s) => (
                    <button
                      key={s.time}
                      disabled={!s.available}
                      onClick={() => setSelectedSlot(s)}
                      className={`py-2 rounded text-sm transition-colors ${
                        selectedSlot?.time === s.time
                          ? 'bg-pink-500 text-white'
                          : s.available
                          ? 'bg-navy-900 hover:bg-navy-700'
                          : 'bg-navy-900/40 text-white/20 line-through cursor-not-allowed'
                      }`}
                    >
                      {formatTime(s.start_at)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
