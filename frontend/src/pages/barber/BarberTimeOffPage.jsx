import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { barberPortalApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import { formatDate, statusLabel } from '../../lib/format';
import { PageLoader } from '../../components/common/Spinner';

const schema = z
  .object({
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u),
    reason: z.string().trim().max(500).optional().or(z.literal('')),
  })
  .refine((d) => d.start_date <= d.end_date, {
    path: ['end_date'],
    message: 'End date must be on or after start date',
  });

export default function BarberTimeOffPage() {
  const toast = useToast();
  const [requests, setRequests] = useState(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm({ resolver: zodResolver(schema) });

  async function refresh() {
    try {
      const r = await barberPortalApi.timeOff();
      setRequests(r);
    } catch (e) {
      toast.error(e.message || 'Could not load requests');
      setRequests([]);
    }
  }

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, []);

  async function submit(values) {
    try {
      await barberPortalApi.requestTimeOff(values);
      toast.success('Request submitted — pending admin review');
      reset();
      await refresh();
    } catch (e) {
      toast.error(e.message || 'Submission failed');
    }
  }

  if (!requests) return <PageLoader />;

  return (
    <>
      <div>
        <h1 className="h-display">Time Off</h1>
        <p className="mt-2" style={{ color: 'var(--lb-text-muted)' }}>Request days off — admin approves before they take effect.</p>
      </div>

      <div className="card-padded mt-6">
        <h3 className="font-display uppercase tracking-widest" style={{ color: 'var(--lb-text)' }}>New Request</h3>
        <form onSubmit={handleSubmit(submit)} className="grid sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="form-label">Start date</label>
            <input type="date" className="form-input" {...register('start_date')} />
            {errors.start_date && <p className="form-error">{errors.start_date.message}</p>}
          </div>
          <div>
            <label className="form-label">End date</label>
            <input type="date" className="form-input" {...register('end_date')} />
            {errors.end_date && <p className="form-error">{errors.end_date.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="form-label">Reason (optional)</label>
            <textarea rows="3" className="form-textarea" placeholder="Vacation, sick day, personal…" {...register('reason')} />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>

      <h3 className="font-display uppercase tracking-widest text-xl mt-10" style={{ color: 'var(--lb-text)' }}>Your Requests</h3>
      <div className="card mt-3 overflow-hidden">
        {requests.length === 0 ? (
          <p className="p-6 text-center" style={{ color: 'var(--lb-text-muted)' }}>No requests yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ borderBottom: '1px solid var(--lb-border)' }}>
              <tr>
                {['Period', 'Reason', 'Status', 'Requested'].map((h) => (
                  <th key={h} className="text-left p-4 text-xs uppercase tracking-widest" style={{ color: 'var(--lb-text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.map((r, i) => (
                <tr key={r.id} style={{ borderTop: i > 0 ? '1px solid var(--lb-border)' : undefined }}>
                  <td className="p-4" style={{ color: 'var(--lb-text)' }}>{r.startDate} → {r.endDate}</td>
                  <td className="p-4" style={{ color: 'var(--lb-text-muted)' }}>{r.reason || '—'}</td>
                  <td className="p-4">
                    <span className={r.status === 'approved' ? 'badge-confirmed' : r.status === 'denied' ? 'badge-cancelled' : 'badge-pending'}>
                      {statusLabel(r.status)}
                    </span>
                  </td>
                  <td className="p-4" style={{ color: 'var(--lb-text-muted)' }}>{formatDate(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
