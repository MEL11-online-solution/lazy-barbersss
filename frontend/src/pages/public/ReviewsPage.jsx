import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { reviewsApi, bookingsApi } from '../../api';
import Stars from '../../components/common/Stars';
import { PageLoader } from '../../components/common/Spinner';
import { useScrollRevealGroup } from '../../hooks/useScrollReveal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatTime } from '../../lib/format';

export default function ReviewsPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const toast = useToast();

  const [reviews, setReviews] = useState(null);
  const [summary, setSummary] = useState({ average_rating: 0, total_count: 0 });
  const reviewsRef = useScrollRevealGroup();

  // Review form state
  const [showForm, setShowForm] = useState(false);
  const [completedBookings, setCompletedBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;
    reviewsApi.list({ page_size: 50 }).then((r) => {
      if (!alive) return;
      setReviews(r.rows);
      if (r.meta?.summary) setSummary(r.meta.summary);
    }).catch(() => alive && setReviews([]));
    return () => { alive = false; };
  }, []);

  async function openForm() {
    if (!user) {
      navigate('/sign-in');
      return;
    }
    setShowForm(true);
    setLoadingBookings(true);
    try {
      const bookings = await bookingsApi.listMine();
      const completed = (bookings || []).filter((b) => b.status === 'completed');
      setCompletedBookings(completed);
      if (completed.length > 0) setSelectedBookingId(String(completed[0].id));
    } catch {
      setCompletedBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  }

  function closeForm() {
    setShowForm(false);
    setSelectedBookingId('');
    setRating(5);
    setComment('');
  }

  async function submitReview(e) {
    e.preventDefault();
    if (!selectedBookingId || !comment.trim()) return;
    setSubmitting(true);
    try {
      await reviewsApi.create({
        booking_id: Number(selectedBookingId),
        rating,
        comment: comment.trim(),
      });
      toast.success('Thank you! Your review has been published.');
      closeForm();
      // Refresh reviews
      const r = await reviewsApi.list({ page_size: 50 });
      setReviews(r.rows);
      if (r.meta?.summary) setSummary(r.meta.summary);
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  }

  if (!reviews) return <PageLoader />;

  return (
    <>
      <section className="section text-center">
        <div className="container-page">
          <div className="flex items-center justify-center gap-3 mb-1">
            <span className="h-px w-8 bg-gold-400 inline-block" />
            <span className="text-gold-400 text-xs tracking-widest uppercase font-display">Trusted</span>
            <span className="h-px w-8 bg-gold-400 inline-block" />
          </div>
          <h1 className="h-display text-gold-400">Customer Reviews</h1>
          <p className="mt-3" style={{ color: 'var(--lb-text-muted)' }}>See what our satisfied clients have to say</p>

          <div className="card-padded mt-10 inline-block">
            <p className="text-gold-400 font-display text-7xl">{summary.average_rating.toFixed(1)}</p>
            <div className="my-2"><Stars value={summary.average_rating} /></div>
            <p className="text-sm" style={{ color: 'var(--lb-text-muted)' }}>Based on {summary.total_count}+ verified customer reviews</p>
          </div>

          <div className="mt-8">
            <button onClick={openForm} className="btn-primary">
              Write a Review
            </button>
          </div>
        </div>
      </section>

      {/* Review Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeForm(); }}
        >
          <div className="card-padded w-full max-w-md relative" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <button
              onClick={closeForm}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white text-xl leading-none"
              aria-label="Close"
            >
              ×
            </button>

            <h2 className="h-section mb-4" style={{ color: 'var(--lb-text)' }}>Write a Review</h2>

            {loadingBookings ? (
              <p className="text-center py-6" style={{ color: 'var(--lb-text-muted)' }}>Loading your bookings…</p>
            ) : completedBookings.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-lg mb-2" style={{ color: 'var(--lb-text)' }}>No completed bookings yet</p>
                <p className="text-sm" style={{ color: 'var(--lb-text-muted)' }}>
                  Complete a booking first to leave a review.
                </p>
                <button onClick={closeForm} className="btn-secondary mt-4 btn-sm">Close</button>
              </div>
            ) : (
              <form onSubmit={submitReview} className="space-y-5">
                {/* Booking selector */}
                <div>
                  <label className="form-label">Select booking</label>
                  <select
                    className="form-input"
                    value={selectedBookingId}
                    onChange={(e) => setSelectedBookingId(e.target.value)}
                    required
                  >
                    {completedBookings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.service_name} — {b.barber_first_name} — {formatDate(b.start_at)} {formatTime(b.start_at)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Star rating */}
                <div>
                  <label className="form-label">Rating</label>
                  <div className="flex gap-2 mt-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n)}
                        className="text-2xl leading-none transition-transform hover:scale-110"
                      >
                        <span style={{ color: n <= rating ? '#D4A843' : 'var(--lb-border)' }}>★</span>
                      </button>
                    ))}
                    <span className="ml-1 text-sm self-center" style={{ color: 'var(--lb-text-muted)' }}>
                      {rating}/5
                    </span>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="form-label">Your review</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    placeholder="Tell us about your experience…"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    minLength={5}
                    maxLength={2000}
                  />
                </div>

                <div className="flex gap-3">
                  <button type="submit" disabled={submitting} className="btn-primary flex-1">
                    {submitting ? 'Submitting…' : 'Submit Review'}
                  </button>
                  <button type="button" onClick={closeForm} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Reviews grid */}
      <section className="container-page pb-16">
        <div ref={reviewsRef} className="grid sm:grid-cols-2 gap-4">
          {reviews.map((r) => (
            <div key={r.id} className="card-padded">
              <div className="flex justify-between items-start">
                <p className="font-semibold" style={{ color: 'var(--lb-text)' }}>{r.customer_name}</p>
                <Stars value={r.rating} />
              </div>
              <p className="text-sm mt-3 italic" style={{ color: 'var(--lb-text)' }}>"{r.comment}"</p>
              {r.service_name && (
                <p className="text-xs mt-3 uppercase tracking-widest" style={{ color: 'var(--lb-text-muted)', opacity: 0.7 }}>{r.service_name}</p>
              )}
            </div>
          ))}
          {reviews.length === 0 && (
            <p className="text-center col-span-full py-8" style={{ color: 'var(--lb-text-muted)' }}>No reviews yet — be the first!</p>
          )}
        </div>
      </section>
    </>
  );
}
