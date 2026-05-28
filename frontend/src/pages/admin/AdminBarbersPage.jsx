import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { barbersApi } from '../../api';
import { statusLabel } from '../../lib/format';
import BarberAvatar from '../../components/common/BarberAvatar';
import { PageLoader } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';

const createSchema = z.object({
  first_name: z.string().trim().min(1).max(80),
  last_name: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().regex(/^\+?[0-9\s\-()]{6,20}$/u, 'Invalid phone').optional().or(z.literal('')),
  password: z.string().min(8, 'Min 8 characters'),
  specialty: z.string().trim().max(120).optional().or(z.literal('')),
  status: z.enum(['active', 'on_leave', 'inactive']).default('active'),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
});

export default function AdminBarbersPage() {
  const toast = useToast();
  const [barbers, setBarbers] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  async function refresh() {
    try {
      setBarbers(await barbersApi.listAll());
    } catch (e) {
      toast.error(e.message || 'Failed to load');
      setBarbers([]);
    }
  }
  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, []);

  if (!barbers) return <PageLoader />;

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="h-display">Manage Barbers</h1>
          <p className="mt-1" style={{ color: 'var(--lb-text-muted)' }}>View and manage all barber team members</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">+ Add Barber</button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {barbers.map((b) => (
          <BarberCard key={b.id} barber={b} onChanged={refresh} />
        ))}
      </div>

      <AddBarberModal open={showAdd} onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); refresh(); }} />
    </>
  );
}

function BarberCard({ barber, onChanged }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function setStatus(status) {
    setBusy(true);
    try {
      await barbersApi.update(barber.id, { status });
      toast.success(`Status set to ${statusLabel(status)}`);
      onChanged();
    } catch (e) {
      toast.error(e.message || 'Failed');
    } finally { setBusy(false); }
  }

  return (
    <div className="card-padded text-center">
      <div className="flex items-center gap-3">
        <BarberAvatar barber={barber} size={40} borderWidth={2} />
        <div className="text-left min-w-0">
          <h3 className="font-display tracking-wider uppercase truncate" style={{ color: 'var(--lb-text)' }}>{barber.first_name} {barber.last_name}</h3>
          <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--lb-text-muted)' }}>{barber.specialty || 'Barber'}</p>
        </div>
      </div>
      <div className="mt-3"><span className={`badge-${barber.status}`}>{statusLabel(barber.status)}</span></div>
      <p className="text-xs mt-3" style={{ color: 'var(--lb-text-muted)' }}>{barber.email}</p>

      <div className="flex gap-2 mt-4 justify-center flex-wrap">
        <select
          className="form-select py-1 text-xs"
          value={barber.status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={busy}
        >
          <option value="active">Active</option>
          <option value="on_leave">On Leave</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>
  );
}

function AddBarberModal({ open, onClose, onSaved }) {
  const toast = useToast();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm({ resolver: zodResolver(createSchema) });

  useEffect(() => { if (open) reset({ status: 'active' }); }, [open, reset]);

  async function submit(values) {
    try {
      await barbersApi.create(values);
      toast.success('Barber created');
      onSaved();
    } catch (e) {
      toast.error(e.message || 'Save failed');
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add new barber">
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">First name</label>
            <input className="form-input" {...register('first_name')} />
            {errors.first_name && <p className="form-error">{errors.first_name.message}</p>}
          </div>
          <div>
            <label className="form-label">Last name</label>
            <input className="form-input" {...register('last_name')} />
            {errors.last_name && <p className="form-error">{errors.last_name.message}</p>}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Email</label>
            <input className="form-input" {...register('email')} />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>
          <div>
            <label className="form-label">Phone</label>
            <input className="form-input" {...register('phone')} placeholder="+61 4XX XXX XXX" />
            {errors.phone && <p className="form-error">{errors.phone.message}</p>}
          </div>
        </div>
        <div>
          <label className="form-label">Temporary password</label>
          <input type="text" className="form-input" {...register('password')} placeholder="At least 8 characters" />
          {errors.password && <p className="form-error">{errors.password.message}</p>}
          <p className="text-xs mt-1" style={{ color: 'var(--lb-text-muted)' }}>The barber should change this on first login.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Specialty</label>
            <input className="form-input" {...register('specialty')} placeholder="e.g. Beard specialist" />
          </div>
          <div>
            <label className="form-label">Status</label>
            <select className="form-select" {...register('status')}>
              <option value="active">Active</option>
              <option value="on_leave">On Leave</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div>
          <label className="form-label">Notes</label>
          <textarea rows="2" className="form-textarea" {...register('notes')} />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Creating…' : 'Add barber'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
