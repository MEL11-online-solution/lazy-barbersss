import { useLocation } from 'wouter';
import { useBooking } from '../../context/BookingContext';
import { bookingsApi } from '../../api';
import client from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatTime, formatMoney } from '../../lib/format';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Card element always rendered on a dark (#0F0F2D) background, so white text is always correct.
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#ffffff',
      fontFamily: 'inherit',
      fontSize: '16px',
      '::placeholder': { color: 'rgba(255,255,255,0.4)' },
    },
    invalid: { color: '#f87171' },
  },
};

function PaymentFormInner({ onBack }) {
  const { state, set, reset } = useBooking();
  const toast = useToast();
  const [, navigate] = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [cardError, setCardError] = useState(null);

  const stripe = useStripe();
  const elements = useElements();

  async function confirm() {
    if (!state.service || !state.startAt) {
      toast.error('Booking details incomplete');
      return;
    }
    setSubmitting(true);
    setCardError(null);

    try {
      // Online payments: charge FIRST — only create the booking if payment succeeds.
      // This prevents ghost bookings when a card is declined.
      let paymentIntentId = null;
      let cardLast4 = null;

      if (state.paymentMethod === 'online') {
        if (!stripe || !elements) {
          toast.error('Stripe is not loaded. Please refresh and try again.');
          setSubmitting(false);
          return;
        }

        // Step 1: Create PaymentIntent (no booking reference yet)
        const intentRes = await client.post('/bookings/create-payment-intent', {
          amount_cents: state.service.price_cents,
        });

        // Step 2: Confirm the card — if this fails, nothing is written to the DB
        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
          intentRes.data.clientSecret,
          { payment_method: { card: elements.getElement(CardElement) } }
        );

        if (stripeError) {
          setCardError(stripeError.message);
          setSubmitting(false);
          return;
        }

        // Capture the PaymentIntent ID and card last4 to persist on the booking
        paymentIntentId = paymentIntent.id;
        const pm = paymentIntent.payment_method;
        cardLast4 = (pm && typeof pm === 'object' && pm.card?.last4) ? pm.card.last4 : null;
      }

      // Payment succeeded (or counter) — now create the booking
      const result = await bookingsApi.create({
        service_id: state.service.id,
        barber_id: state.barber?.id ?? null,
        start_at: state.startAt,
        payment_method: state.paymentMethod,
        notes: state.notes || null,
        payment_intent_id: paymentIntentId,
        card_last4: cardLast4,
      });

      sessionStorage.setItem(`booking-sms-${result.booking.id}`, result.sms_body || '');
      reset();
      navigate(`/booking/confirmation/${result.booking.id}`);
    } catch (e) {
      toast.error(e.message || 'Could not confirm booking');
      setSubmitting(false);
    }
  }

  const subtotal = state.service?.price_cents || 0;
  const total = subtotal;

  return (
    <div className="card-padded mt-4 max-w-2xl mx-auto">
      <h3 className="font-display uppercase tracking-widest" style={{ color: 'var(--lb-text)' }}>Order Summary</h3>

      <div className="card mt-4 divide-y divide-navy-500/30">
        <Row label="Service" value={state.service?.name} />
        <Row
          label="Barber"
          value={state.barber ? `${state.barber.first_name} ${state.barber.last_name}` : 'Any available'}
        />
        <Row label="Date & Time" value={`${formatDate(state.startAt)} · ${formatTime(state.startAt)}`} />
        <Row label="Duration" value={`${state.service?.duration_minutes} minutes`} />
        <Row label="Location" value="Lazy Barbers HQ, Granville" />
        <Row label="Subtotal" value={formatMoney(subtotal)} />
        <Row label="Total" value={formatMoney(total)} highlight />
      </div>

      <div className="mt-6">
        <p className="form-label">💳 Payment Method</p>
        <div className="grid grid-cols-2 gap-3">
          <PaymentOption
            active={state.paymentMethod === 'online'}
            onClick={() => set({ paymentMethod: 'online' })}
            icon="💳"
            title="Pay Online"
            desc="Credit card or debit card"
          />
          <PaymentOption
            active={state.paymentMethod === 'counter'}
            onClick={() => set({ paymentMethod: 'counter' })}
            icon="🏪"
            title="Pay at Counter"
            desc="Pay after your service"
          />
        </div>
      </div>

      {state.paymentMethod === 'online' && (
        <div className="mt-4">
          <p className="form-label">Card Details</p>
          {/* Fixed dark background so Stripe's white text is always legible */}
          <div className="rounded-lg p-4" style={{ backgroundColor: '#0F0F2D', border: '1px solid rgba(51,51,107,0.6)' }}>
            <CardElement options={CARD_ELEMENT_OPTIONS} onChange={() => setCardError(null)} />
          </div>
          {cardError && (
            <p className="mt-2 text-red-400 text-sm">{cardError}</p>
          )}
        </div>
      )}

      <div className="mt-4">
        <label className="form-label">Notes (optional)</label>
        <textarea
          className="form-textarea"
          rows="2"
          placeholder="Anything you'd like the barber to know?"
          value={state.notes}
          onChange={(e) => set({ notes: e.target.value })}
        />
      </div>

      <div className="flex gap-3 mt-8">
        <button onClick={onBack} className="btn-secondary flex-1">← Back</button>
        <button
          onClick={confirm}
          disabled={submitting || (state.paymentMethod === 'online' && !stripe)}
          className="btn-primary flex-1"
        >
          {submitting
            ? state.paymentMethod === 'online' ? 'Processing…' : 'Confirming…'
            : 'Confirm Booking →'}
        </button>
      </div>
    </div>
  );
}

export default function StepPayment(props) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormInner {...props} />
    </Elements>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between p-4">
      <span className={highlight ? 'font-display uppercase tracking-widest text-gray-900 dark:text-white' : 'text-gray-600 dark:text-white/70'}>
        {label}
      </span>
      <span className={highlight ? 'font-display text-2xl text-pink-500' : 'text-gold-400'}>
        {value}
      </span>
    </div>
  );
}

function PaymentOption({ active, onClick, icon, title, desc }) {
  return (
    <button
      onClick={onClick}
      className={`text-left card p-4 transition-all ${
        active ? 'border-pink-500 ring-2 ring-pink-500/30' : 'hover:border-pink-500/40'
      }`}
    >
      <div className="text-2xl">{icon}</div>
      <p className="font-semibold mt-2 text-gray-900 dark:text-white">{title}</p>
      <p className="text-gray-500 dark:text-white/60 text-xs mt-1">{desc}</p>
    </button>
  );
}
