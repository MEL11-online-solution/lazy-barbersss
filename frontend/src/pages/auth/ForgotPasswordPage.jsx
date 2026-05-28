import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '../../api/auth.api';
import { useToast } from '../../context/ToastContext';

const emailSchema = z.object({ email: z.string().trim().toLowerCase().email('Invalid email') });
const codeSchema = z.object({ code: z.string().regex(/^\d{6}$/u, 'Code must be 6 digits') });
const newPwSchema = z
  .object({
    password: z.string().min(8, 'At least 8 characters'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: 'Passwords must match', path: ['confirm'] });

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [, navigate] = useLocation();

  const [step, setStep] = useState(1); // 1=email, 2=verify, 3=new password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState(null);

  return (
    <section className="section">
      <div className="container-narrow">
        <div className="card-padded text-center">
          <p className="brand"><span className="lazy">LAZY </span><span className="barbers">BARBERS</span></p>
          <h1 className="h-section mt-4">Reset password</h1>
          <p className="text-white/60 text-sm mt-2">We'll help you regain access to your account</p>

          {/* Steps */}
          <div className="flex items-center justify-center gap-2 mt-6 text-xs">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-2">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold ${
                  step >= n ? 'bg-pink-500 text-white' : 'bg-navy-900 text-white/50 border border-navy-500'
                }`}>{n}</span>
                <span className={step === n ? 'text-white' : 'text-white/40'}>
                  {n === 1 ? 'Email' : n === 2 ? 'Verify' : 'New password'}
                </span>
                {n < 3 && <span className="text-white/20 mx-1">—</span>}
              </div>
            ))}
          </div>

          <div className="mt-6">
            {step === 1 && (
              <StepEmail
                onNext={(e, dev) => { setEmail(e); setDevCode(dev); setStep(2); }}
              />
            )}
            {step === 2 && (
              <StepCode
                email={email}
                devCode={devCode}
                onNext={(c) => { setCode(c); setStep(3); }}
                onBack={() => setStep(1)}
              />
            )}
            {step === 3 && (
              <StepNewPassword
                email={email}
                code={code}
                onDone={() => {
                  toast.success('Password updated. Please sign in.');
                  navigate('/sign-in');
                }}
              />
            )}
          </div>

          <p className="text-xs text-white/60 mt-6">
            Remember your password? <Link href="/sign-in" className="text-pink-500 font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

function StepEmail({ onNext }) {
  const toast = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm({ resolver: zodResolver(emailSchema) });

  async function submit(values) {
    try {
      const res = await authApi.forgotPassword(values.email);
      toast.info('If that email is registered, a code has been sent.');
      onNext(values.email, res.dev_code);
    } catch (e) {
      toast.error(e.message || 'Failed to send code');
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4 text-left">
      <div className="p-3 rounded-md border border-gold-500/30 bg-gold-500/10 text-gold-400 text-xs">
        🔒 Security: We'll send a verification code to your email. No one else can access your account.
      </div>
      <div>
        <label className="form-label">Email address</label>
        <input className="form-input" placeholder="your@email.com" {...register('email')} />
        {errors.email && <p className="form-error">{errors.email.message}</p>}
      </div>
      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? 'Sending…' : 'Send code →'}
      </button>
    </form>
  );
}

function StepCode({ email, devCode, onNext, onBack }) {
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } =
    useForm({ resolver: zodResolver(codeSchema), defaultValues: { code: devCode || '' } });

  function submit(values) {
    onNext(values.code);
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4 text-left">
      <div className="p-3 rounded-md bg-navy-900 text-sm">
        Code sent to <span className="font-semibold">{email}</span>
      </div>
      {devCode && (
        <div className="p-3 rounded-md border border-gold-500/30 bg-gold-500/10 text-gold-400 text-xs">
          ⚙ Dev mode: code auto-filled (<code>{devCode}</code>)
        </div>
      )}
      <div>
        <label className="form-label">6-digit code</label>
        <input
          className="form-input text-center text-xl tracking-[0.6em] font-display"
          maxLength={6}
          placeholder="000000"
          {...register('code')}
          onChange={(e) => setValue('code', e.target.value.replace(/\D/g, '').slice(0, 6))}
        />
        {errors.code && <p className="form-error">{errors.code.message}</p>}
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="btn-secondary flex-1">← Back</button>
        <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">Continue →</button>
      </div>
    </form>
  );
}

function StepNewPassword({ email, code, onDone }) {
  const toast = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm({ resolver: zodResolver(newPwSchema) });

  async function submit(values) {
    try {
      await authApi.resetPassword({ email, code, new_password: values.password });
      onDone();
    } catch (e) {
      toast.error(e.message || 'Reset failed');
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4 text-left">
      <div>
        <label className="form-label">New password</label>
        <input type="password" className="form-input" placeholder="Min. 8 characters" {...register('password')} />
        {errors.password && <p className="form-error">{errors.password.message}</p>}
      </div>
      <div>
        <label className="form-label">Confirm password</label>
        <input type="password" className="form-input" placeholder="Repeat" {...register('confirm')} />
        {errors.confirm && <p className="form-error">{errors.confirm.message}</p>}
      </div>
      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? 'Updating…' : 'Update password'}
      </button>
    </form>
  );
}
