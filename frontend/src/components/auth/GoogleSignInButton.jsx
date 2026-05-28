import { useEffect, useState } from 'react';
import { authApi } from '../../api/auth.api';

// Backend OAuth entry point (full-page redirect, not an XHR — cookies get set
// server-side and the user is bounced back to the frontend).
const GOOGLE_AUTH_URL = (import.meta.env.VITE_API_URL || '/api/v1') + '/auth/google';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

/**
 * "Continue with Google" button + divider. Renders nothing if the backend
 * reports Google OAuth is not configured, so the page never crashes without
 * credentials. White with dark text in light mode; dark surface with white
 * text in dark mode. The Google "G" keeps its original colors in both.
 */
export default function GoogleSignInButton({ dividerText = 'or sign in with email' }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let alive = true;
    authApi
      .providers()
      .then((d) => alive && setEnabled(!!d.google))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => {
          window.location.href = GOOGLE_AUTH_URL;
        }}
        className="w-full flex items-center justify-center gap-3 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors border bg-white text-gray-800 border-[#dadce0] hover:bg-gray-100 dark:bg-[#2A2A3E] dark:text-white dark:border-[#444] dark:hover:bg-[#353550]"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <div className="flex items-center gap-3 mt-6">
        <span className="h-px flex-1" style={{ background: 'var(--lb-border)' }} />
        <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--lb-text-muted)' }}>
          {dividerText}
        </span>
        <span className="h-px flex-1" style={{ background: 'var(--lb-border)' }} />
      </div>
    </div>
  );
}
