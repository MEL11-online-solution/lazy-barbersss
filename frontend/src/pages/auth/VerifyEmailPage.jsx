import { useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { authApi } from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function VerifyEmailPage() {
  const [, navigate] = useLocation();
  const { refresh } = useAuth();
  const toast = useToast();

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const inputs = useRef([]);

  const params = new URLSearchParams(window.location.search);
  const email = params.get('email') || '';

  function setDigit(i, val) {
    const v = val.replace(/\D/g, '').slice(-1);
    setDigits((d) => {
      const next = [...d];
      next[i] = v;
      return next;
    });
    if (v && i < 5) inputs.current[i + 1]?.focus();
  }

  function handleKey(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      e.preventDefault();
      setDigits(text.split(''));
      inputs.current[5]?.focus();
    }
  }

  async function submit() {
    const code = digits.join('');
    if (code.length !== 6) {
      toast.error('Please enter the full 6-digit code');
      return;
    }
    setSubmitting(true);
    try {
      await authApi.verifyEmail({ email, code });
      await refresh();
      toast.success('Email verified! Welcome to Lazy Barbers.');
      navigate('/home');
    } catch (e) {
      toast.error(e.message || 'Invalid or expired code');
    } finally {
      setSubmitting(false);
    }
  }

  async function resend() {
    setResending(true);
    try {
      await authApi.resendVerification(email);
      toast.success('A new code has been sent to your inbox.');
    } catch (e) {
      toast.error(e.message || 'Failed to resend');
    } finally {
      setResending(false);
    }
  }

  return (
    <section className="section">
      <div className="container-narrow">
        <div className="card-padded text-center">
          <p className="brand"><span className="lazy">LAZY </span><span className="barbers">BARBERS</span></p>
          <div className="h-px w-12 bg-pink-500 mx-auto mt-3" />
          <h1 className="h-section mt-4" style={{ color: 'var(--lb-text)' }}>Check your inbox</h1>

          {/* Destination address */}
          <div className="mt-6 p-4 rounded-lg text-left" style={{ backgroundColor: 'var(--lb-bg-input)', border: '1px solid var(--lb-border-input)' }}>
            <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-white/50">Verification code sent to</p>
            <p className="font-semibold mt-1 break-all text-gray-900 dark:text-white">{email || 'your email address'}</p>
          </div>

          <p className="text-xs text-gray-500 dark:text-white/50 mt-3">
            📥 Check your inbox and spam folder. Code expires in 24 hours.
          </p>

          {/* 6-digit input */}
          <div className="mt-6">
            <p className="form-label">6-digit code</p>
            <div className="flex justify-center gap-2 mt-2" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputs.current[i] = el)}
                  value={d}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => handleKey(i, e)}
                  className="w-12 h-14 text-center text-2xl font-display rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  style={{
                    backgroundColor: 'var(--lb-bg-input)',
                    border: '1px solid var(--lb-border-input)',
                    color: 'var(--lb-text)',
                  }}
                  inputMode="numeric"
                  maxLength={1}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-white/50 mt-3">
              Tip: you can paste the full 6-digit code directly
            </p>
          </div>

          <button onClick={submit} disabled={submitting} className="btn-primary w-full mt-6">
            {submitting ? 'Verifying…' : 'Verify email →'}
          </button>

          <div className="mt-6 text-xs text-gray-500 dark:text-white/60 space-y-2">
            <p>
              Didn't receive a code?{' '}
              <button
                disabled={resending}
                onClick={resend}
                className="text-pink-500 font-semibold disabled:opacity-50"
              >
                {resending ? 'Sending…' : 'Resend code'}
              </button>
            </p>
            <p>
              Wrong email?{' '}
              <Link href="/sign-up" className="text-pink-500 font-semibold">Go back to sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
