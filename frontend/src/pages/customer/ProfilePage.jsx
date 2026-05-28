import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { customerApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const schema = z.object({
  first_name: z.string().trim().min(1).max(80),
  last_name: z.string().trim().min(1).max(80),
  phone: z.string().trim().regex(/^\+?[0-9\s\-()]{6,20}$/u, 'Invalid phone').optional().or(z.literal('')),
});

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (user) reset({ first_name: user.first_name, last_name: user.last_name, phone: user.phone || '' });
  }, [user, reset]);

  async function onSubmit(values) {
    try {
      await customerApi.updateMe(values);
      await refresh();
      toast.success('Profile updated');
    } catch (e) {
      toast.error(e.message || 'Update failed');
    }
  }

  if (!user) return null;

  return (
    <section className="section-tight">
      <div className="container-narrow">
        <h1 className="h-display">Profile</h1>
        <p className="text-white/60 mt-2">Update your contact details</p>

        <form onSubmit={handleSubmit(onSubmit)} className="card-padded mt-8 space-y-4">
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
          <div>
            <label className="form-label">Email</label>
            <input className="form-input" disabled value={user.email} />
            <p className="text-xs text-white/40 mt-1">Email cannot be changed.</p>
          </div>
          <div>
            <label className="form-label">Phone (used for SMS)</label>
            <input className="form-input" placeholder="+61 4XX XXX XXX" {...register('phone')} />
            {errors.phone && <p className="form-error">{errors.phone.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting || !isDirty} className="btn-primary">
            {isSubmitting ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </section>
  );
}
