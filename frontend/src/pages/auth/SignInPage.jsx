import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';

const schema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

export default function SignInPage() {
  const { login, user, loading } = useAuth();
  const toast = useToast();
  const [, navigate] = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  // Redirect already-logged-in users away from /sign-in
  useEffect(() => {
    if (loading || !user) return;
    if (user.role === 'admin') navigate('/admin');
    else if (user.role === 'barber') navigate('/barber');
    else navigate('/home');
  }, [user, loading, navigate]);

  async function onSubmit(values) {
    try {
      const user = await login(values);
      toast.success(`Welcome back, ${user.first_name}!`);
      const params = new URLSearchParams(window.location.search);
      const next = params.get('next');
      if (next) return navigate(next);
      if (user.role === 'admin') return navigate('/admin');
      if (user.role === 'barber') return navigate('/barber');
      navigate('/home');
    } catch (e) {
      toast.error(e.message || 'Sign-in failed');
    }
  }

  return (
    <section className="section">
      <div className="container-narrow">
        <div className="card-padded text-center">
          <p className="brand"><span className="lazy">LAZY </span><span className="barbers">BARBERS</span></p>
          <div className="h-px w-12 bg-pink-500 mx-auto mt-3" />
          <h1 className="h-section mt-4">Welcome back</h1>
          <p className="text-white/60 mt-2 text-sm">Sign in to your account to manage bookings</p>

          <div className="mt-6 p-4 rounded-md border border-gold-500/30 bg-gold-500/10 text-gold-400 text-xs text-left">
            Admins are automatically redirected to the Admin Portal after signing in.
          </div>

          <GoogleSignInButton dividerText="or sign in with email" />

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4 text-left">
            <div>
              <label className="form-label">Email address</label>
              <input className="form-input" placeholder="your@email.com" {...register('email')} />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>
            <div>
              <label className="form-label">Password</label>
              <input type="password" className="form-input" placeholder="Enter your password" {...register('password')} />
              {errors.password && <p className="form-error">{errors.password.message}</p>}
              <div className="mt-2 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border accent-pink-500"
                    {...register('rememberMe')}
                  />
                  <span className="text-xs" style={{ color: 'var(--lb-text-muted)' }}>Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-pink-500 text-xs">Forgot password?</Link>
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-xs text-white/60 mt-6">
            Don't have an account? <Link href="/sign-up" className="text-pink-500 font-semibold">Sign up free</Link>
          </p>
          <p className="text-xs mt-3" style={{ color: 'var(--lb-text-muted)' }}>
            Just looking?{' '}
            <Link href="/home" className="text-pink-500 font-semibold">Browse without signing in →</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
