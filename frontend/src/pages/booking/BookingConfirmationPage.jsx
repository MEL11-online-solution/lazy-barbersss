import { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'wouter';
import { bookingsApi } from '../../api';
import { formatDate, formatTime, formatMoney } from '../../lib/format';
import { PageLoader } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';

export default function BookingConfirmationPage() {
  const params = useParams();
  const [, navigate] = useLocation();
  const toast = useToast();
  const [booking, setBooking] = useState(null);
  const [smsBody, setSmsBody] = useState('');

  useEffect(() => {
    let alive = true;
    bookingsApi
      .get(params.id)
      .then((b) => alive && setBooking(b))
      .catch((e) => {
        toast.error(e.message || 'Could not load booking');
        navigate('/my-bookings');
      });
    const stashed = sessionStorage.getItem(`booking-sms-${params.id}`);
    if (stashed) setSmsBody(stashed);
  }, [params.id, navigate, toast]);

  if (!booking) return <PageLoader />;

  // Build a Google Calendar add-to-calendar link
  function gcalLink() {
    const start = new Date(booking.start_at);
    const end = new Date(booking.end_at);
    const fmt = (d) =>
      d.toISOString().replace(/[-:]|\.\d{3}/g, '');
    const p = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${booking.service_name} @ Lazy Barbers`,
      dates: `${fmt(start)}/${fmt(end)}`,
      details: `Booking ${booking.reference} with ${booking.barber_first_name}`,
      location: '15 Good St, Granville NSW',
    });
    return `https://calendar.google.com/calendar/render?${p.toString()}`;
  }

  return (
    <section className="section">
      <div className="container-narrow">
        <div className="card-padded text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500 mx-auto flex items-center justify-center text-3xl">
            ✓
          </div>
          <h1 className="h-section text-emerald-600 dark:text-emerald-400 mt-4">Booking Confirmed!</h1>
          <p className="text-gray-500 dark:text-white/60 mt-2 text-sm">Your appointment has been successfully booked.</p>

          <div className="mt-6 card divide-y divide-navy-500/30 text-left">
            <Row label="Booking Ref" value={booking.reference} highlight />
            <Row label="Service" value={booking.service_name} />
            <Row label="Barber" value={`${booking.barber_first_name} ${booking.barber_last_name}`} />
            <Row label="Date" value={formatDate(booking.start_at)} />
            <Row label="Time" value={formatTime(booking.start_at)} />
            <Row label="Location" value="15 Good St, Granville NSW" />
            <Row label="Price" value={formatMoney(booking.price_cents)} gold />
            <Row label="Payment" value={booking.payment_method === 'online' ? 'Paid online' : 'Pay at counter'} />
          </div>

          {smsBody && booking.customer_phone && (
            <div className="mt-6 card p-4 text-left">
              <p className="text-emerald-600 dark:text-emerald-400 text-xs uppercase tracking-widest font-semibold">
                💬 SMS sent to: {booking.customer_phone}
              </p>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-sm text-gray-700 dark:text-white/80 leading-relaxed">
                {smsBody}
              </pre>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 mt-6">
            <a
              href={gcalLink()}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary btn-sm flex flex-col gap-1 py-4"
            >
              <span className="text-xl">📅</span>
              <span>Add to Calendar</span>
            </a>
            <Link
              href={`/booking/receipt/${booking.id}`}
              className="btn-secondary btn-sm flex flex-col gap-1 py-4"
            >
              <span className="text-xl">🧾</span>
              <span>View Receipt</span>
            </Link>
            <Link href="/" className="btn-primary btn-sm flex flex-col gap-1 py-4">
              <span className="text-xl">🏠</span>
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value, highlight, gold }) {
  return (
    <div className="flex items-center justify-between p-3">
      <span className="text-gray-600 dark:text-white/70">{label}</span>
      <span className={highlight ? 'text-pink-500 font-semibold' : gold ? 'text-gold-400' : 'text-gray-900 dark:text-white'}>
        {value}
      </span>
    </div>
  );
}
