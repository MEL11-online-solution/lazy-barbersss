import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { servicesApi } from '../../api';
import { formatMoney } from '../../lib/format';
import { PageLoader } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  category: z.string().trim().max(80).optional().or(z.literal('')),
  price: z.coerce.number().min(0),
  duration_minutes: z.coerce.number().int().min(5).max(480),
  is_active: z.boolean().default(true),
  display_order: z.coerce.number().int().min(0).default(0),
});

export default function AdminServicesPage() {
  const toast = useToast();
  const [list, setList] = useState(null);
  const [editing, setEditing] = useState(null);
  const [busyId, setBusyId] = useState(null);

  async function refresh() {
    try {
      setList(await servicesApi.listAdmin());
    } catch (e) {
      toast.error(e.message || 'Failed to load');
      setList([]);
    }
  }
  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, []);

  async function remove(svc) {
    if (!confirm(`Deactivate "${svc.name}"?`)) return;
    setBusyId(svc.id);
    try {
      await servicesApi.remove(svc.id);
      toast.success('Service deactivated');
      await refresh();
    } catch (e) {
      toast.error(e.message || 'Failed');
    } finally {
      setBusyId(null);
    }
  }

  if (!list) return <PageLoader />;

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="h-display">Manage Services</h1>
          <p className="mt-1" style={{ color: 'var(--lb-text-muted)' }}>View and manage all barber services</p>
        </div>
        <button onClick={() => setEditing('new')} className="btn-primary">+ Add new service</button>
      </div>

      <div className="card mt-8 overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ borderBottom: '1px solid var(--lb-border)' }}>
            <tr>
              {['Service', 'Category', 'Price', 'Duration', 'Status', ''].map((h, i) => (
                <th key={i} className={`p-4 text-xs uppercase tracking-widest ${i === 5 ? 'text-right' : 'text-left'}`} style={{ color: 'var(--lb-text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((s, i) => (
              <tr key={s.id} style={{ borderTop: i > 0 ? '1px solid var(--lb-border)' : undefined }}>
                <td className="p-4 font-semibold" style={{ color: 'var(--lb-text)' }}>{s.name}</td>
                <td className="p-4" style={{ color: 'var(--lb-text-muted)' }}>{s.category || '—'}</td>
                <td className="p-4 text-gold-400">{formatMoney(s.price_cents)}</td>
                <td className="p-4" style={{ color: 'var(--lb-text-muted)' }}>{s.duration_minutes} min</td>
                <td className="p-4">
                  <span className={s.is_active ? 'badge-confirmed' : 'badge-cancelled'}>
                    {s.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4 flex gap-2 justify-end">
                  <button onClick={() => setEditing(s)} className="btn-secondary btn-sm">Edit</button>
                  <button onClick={() => remove(s)} disabled={busyId === s.id} className="btn-ghost btn-sm text-red-500">
                    {busyId === s.id ? '...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan="6" className="p-8 text-center" style={{ color: 'var(--lb-text-muted)' }}>No services yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <ServiceModal
        open={!!editing}
        service={editing === 'new' ? null : editing}
        onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); refresh(); }}
      />
    </>
  );
}

function ServiceModal({ open, service, onClose, onSaved }) {
  const toast = useToast();
  const isEdit = !!service;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!open) return;
    reset(
      service
        ? {
            name: service.name,
            description: service.description || '',
            category: service.category || '',
            price: service.price_cents / 100,
            duration_minutes: service.duration_minutes,
            is_active: service.is_active,
            display_order: service.display_order,
          }
        : { name: '', description: '', category: '', price: 0, duration_minutes: 30, is_active: true, display_order: 0 }
    );
  }, [open, service, reset]);

  async function submit(values) {
    const payload = {
      name: values.name,
      description: values.description || null,
      category: values.category || null,
      price_cents: Math.round(values.price * 100),
      duration_minutes: values.duration_minutes,
      is_active: values.is_active,
      display_order: values.display_order,
    };
    try {
      if (isEdit) await servicesApi.update(service.id, payload);
      else await servicesApi.create(payload);
      toast.success(isEdit ? 'Service updated' : 'Service created');
      onSaved();
    } catch (e) {
      toast.error(e.message || 'Save failed');
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Service' : 'New Service'}>
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <div>
          <label className="form-label">Name</label>
          <input className="form-input" {...register('name')} />
          {errors.name && <p className="form-error">{errors.name.message}</p>}
        </div>
        <div>
          <label className="form-label">Description</label>
          <textarea rows="3" className="form-textarea" {...register('description')} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Category</label>
            <input className="form-input" {...register('category')} />
          </div>
          <div>
            <label className="form-label">Display order</label>
            <input type="number" className="form-input" {...register('display_order')} />
          </div>
          <div>
            <label className="form-label">Price ($)</label>
            <input type="number" step="0.01" className="form-input" {...register('price')} />
            {errors.price && <p className="form-error">{errors.price.message}</p>}
          </div>
          <div>
            <label className="form-label">Duration (minutes)</label>
            <input type="number" className="form-input" {...register('duration_minutes')} />
            {errors.duration_minutes && <p className="form-error">{errors.duration_minutes.message}</p>}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--lb-text-muted)' }}>
          <input type="checkbox" className="accent-pink-500" {...register('is_active')} />
          Active (visible to customers)
        </label>
        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
