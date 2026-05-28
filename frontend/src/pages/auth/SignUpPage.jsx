import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation } from 'wouter';
import { authApi } from '../../api/auth.api';
import { useToast } from '../../context/ToastContext';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';

const schema = z
  .object({
    first_name: z.string().trim().min(1, 'Required').max(80),
    last_name: z.string().trim().min(1, 'Required').max(80),
    email: z.string().trim().toLowerCase().email('Invalid email'),
    phone: z.string().trim().regex(/^\+?[0-9\s\-()]{6,20}$/u, 'Invalid phone'),
    password: z.string().min(8, 'At least 8 characters'),
    confirm_password: z.string(),
    accept_terms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Passwords must match',
    path: ['confirm_password'],
  });

export default function SignUpPage() {
  const toast = useToast();
  const [, navigate] = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values) {
    try {
      const { confirm_password, accept_terms, ...payload } = values;
      await authApi.register(payload);
      toast.success('Account created — check your email for the verification code.');
      navigate(`/verify-email?email=${encodeURIComponent(payload.email)}`);
    } catch (e) {
      toast.error(e.message || 'Registration failed');
    }
  }

  return (
    <section className="section">
      <div className="container-narrow">
        <div className="card-padded">
          <div className="text-center">
            <p className="brand"><span className="lazy">LAZY </span><span className="barbers">BARBERS</span></p>
            <h1 className="h-section mt-4">Create account</h1>
            <p className="text-gray-500 dark:text-white/60 mt-2 text-sm">Join 120+ satisfied clients in Granville</p>

            <div className="grid grid-cols-3 gap-2 mt-6 text-xs">
              <span className="card p-2">📅 Easy booking</span>
              <span className="card p-2">💬 SMS reminders</span>
              <span className="card p-2">📖 Booking history</span>
            </div>
          </div>

          <GoogleSignInButton dividerText="or create account with email" />

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">First name</label>
                <input className="form-input" placeholder="John" {...register('first_name')} />
                {errors.first_name && <p className="form-error">{errors.first_name.message}</p>}
              </div>
              <div>
                <label className="form-label">Last name</label>
                <input className="form-input" placeholder="Smith" {...register('last_name')} />
                {errors.last_name && <p className="form-error">{errors.last_name.message}</p>}
              </div>
            </div>
            <div>
              <label className="form-label">Email address</label>
              <input className="form-input" placeholder="you@email.com" {...register('email')} />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>
            <div>
              <label className="form-label">Phone number ★ (used for SMS booking confirmations)</label>
              <input className="form-input" placeholder="+61 4XX XXX XXX" {...register('phone')} />
              {errors.phone && <p className="form-error">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="form-label">Password</label>
              <input type="password" className="form-input" placeholder="Min. 8 characters" {...register('password')} />
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>
            <div>
              <label className="form-label">Confirm password</label>
              <input type="password" className="form-input" placeholder="Repeat your password" {...register('confirm_password')} />
              {errors.confirm_password && <p className="form-error">{errors.confirm_password.message}</p>}
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/70">
              <input type="checkbox" {...register('accept_terms')} className="accent-pink-500" />
              I agree to the Terms & Conditions and Privacy Policy
            </label>
            {errors.accept_terms && <p className="form-error">{errors.accept_terms.message}</p>}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Creating…' : 'Create account →'}
            </button>
          </form>

          <p className="text-xs text-gray-500 dark:text-white/60 mt-6 text-center">
            Already have an account? <Link href="/sign-in" className="text-pink-500 font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
