import { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import { bookingsApi } from '../../api';
import { formatDate, formatTime, formatDateTime, formatMoney } from '../../lib/format';
import { PageLoader } from '../../components/common/Spinner';

export default function ReceiptPage() {
  const params = useParams();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    let alive = true;
    bookingsApi.receipt(params.id).then((b) => alive && setBooking(b)).catch(() => alive && setBooking(false));
    return () => { alive = false; };
  }, [params.id]);

  if (booking === null) return <PageLoader />;
  if (booking === false) return (
    <div className="container-page py-16 text-center text-gray-400 dark:text-white/60">Receipt not available</div>
  );

  const totalCents = booking.price_cents;
  const gstCents = Math.round(totalCents / 11);
  const subtotalCents = totalCents - gstCents;

  const paymentDisplay = booking.card_last4
    ? `Visa ending ****${booking.card_last4}`
    : booking.payment_method === 'online' ? 'Card (online)' : 'Pay at Counter';

  return (
    <section className="section">
      <div className="container-narrow">
        <div className="card-padded print:bg-white print:text-black">

          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-2xl font-display font-bold tracking-widest uppercase" style={{ color: 'var(--lb-text)' }}>
                TAX INVOICE
              </p>
              <p className="text-xs text-gray-500 dark:text-white/50 mt-1">ABN: 00 000 000 000</p>
              <div className="mt-3">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--lb-text)' }}>Lazy Barbers</p>
                <p className="text-xs text-gray-500 dark:text-white/50">15 Good St, Granville NSW 2142</p>
                <p className="text-xs text-gray-500 dark:text-white/50">62 Beamish St, Campsie NSW 2194</p>
                <p className="text-xs text-gray-500 dark:text-white/50">+61 416 065 592</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`badge ${booking.payment_status === 'paid' ? 'badge-confirmed' : 'badge-pending'}`}>
                {booking.payment_status === 'paid' ? 'PAID ✓' : 'UNPAID'}
              </span>
              <p className="text-xs text-gray-500 dark:text-white/60 mt-2">Receipt #{booking.reference}</p>
              <p className="text-xs text-gray-500 dark:text-white/60">{formatDate(booking.created_at)}</p>
              <p className="text-xs text-gray-500 dark:text-white/60">{formatTime(booking.created_at)}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px mt-6" style={{ background: 'linear-gradient(90deg, #D4A843 0%, #E91E63 100%)' }} />

          {/* Billed To */}
          <div className="mt-6">
            <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-white/50 mb-2">Billed To</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {booking.customer_first_name} {booking.customer_last_name}
            </p>
            <p className="text-sm text-gray-600 dark:text-white/70">{booking.customer_email}</p>
            {booking.customer_phone && (
              <p className="text-sm text-gray-600 dark:text-white/70">{booking.customer_phone}</p>
            )}
          </div>

          {/* Appointment line items */}
          <table className="w-full mt-8 text-sm">
            <thead style={{ borderBottom: '1px solid var(--lb-border)' }}>
              <tr>
                <th className="pb-3 text-left text-xs uppercase tracking-widest text-gray-500 dark:text-white/60">Service</th>
                <th className="pb-3 text-left text-xs uppercase tracking-widest text-gray-500 dark:text-white/60">Barber</th>
                <th className="pb-3 text-left text-xs uppercase tracking-widest text-gray-500 dark:text-white/60">Duration</th>
                <th className="pb-3 text-left text-xs uppercase tracking-widest text-gray-500 dark:text-white/60">Appointment</th>
                <th className="pb-3 text-right text-xs uppercase tracking-widest text-gray-500 dark:text-white/60">Price</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--lb-border)' }}>
                <td className="py-4 text-gray-900 dark:text-white">{booking.service_name}</td>
                <td className="py-4 text-gray-900 dark:text-white">{booking.barber_first_name}</td>
                <td className="py-4 text-gray-900 dark:text-white">~{booking.service_duration_minutes} min</td>
                <td className="py-4 text-gray-900 dark:text-white">{formatDateTime(booking.start_at)}</td>
                <td className="py-4 text-right text-gray-900 dark:text-white">{formatMoney(totalCents)}</td>
              </tr>
            </tbody>
          </table>

          {/* Tax summary */}
          <div className="mt-6 ml-auto max-w-xs">
            <TaxRow label="Subtotal (ex-GST)" value={formatMoney(subtotalCents)} />
            <TaxRow label="GST (10%)" value={formatMoney(gstCents)} />
            <TaxRow label="Total (inc-GST)" value={`${formatMoney(totalCents)} AUD`} highlight />
          </div>

          {/* Payment method */}
          <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--lb-border)' }}>
            <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-white/50 mb-2">Payment</p>
            <p className="text-sm text-gray-900 dark:text-white">
              {booking.payment_method === 'online' ? '💳' : '🏪'} {paymentDisplay}
            </p>
            {booking.transaction_id && (
              <p className="text-xs text-gray-500 dark:text-white/50 mt-1 font-mono">
                Txn: {booking.transaction_id}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8 print:hidden">
            <button onClick={() => window.print()} className="btn-secondary btn-sm">🖨️ Print</button>
          </div>

          <p className="text-xs text-gray-400 dark:text-white/50 mt-6 text-center">
            Thank you for choosing Lazy Barbers. This document serves as a valid Australian tax invoice. ✂️
          </p>
        </div>
      </div>
    </section>
  );
}

function TaxRow({ label, value, highlight }) {
  return (
    <div
      className={`flex items-center justify-between py-1 ${
        highlight ? 'font-display text-lg pt-3 mt-2' : 'text-gray-600 dark:text-white/70'
      }`}
      style={{
        ...(highlight ? { borderTop: '1px solid var(--lb-border)', color: '#D4A843' } : {}),
      }}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
