/**
 * Frontend formatters & helpers. The backend stores everything in UTC ISO,
 * but the user expects to see local-time presentation. The booking flow
 * sends LOCAL time → ISO via these helpers.
 */

/**
 * Format an ISO datetime as local "Thu, 9 Apr 2026" (date only).
 */
export function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
     timeZone: 'Australia/Sydney',
  });
}

/**
 * Format an ISO datetime as local "10:30 AM".
 */
export function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
     timeZone: 'Australia/Sydney',
    hour12: true,
  });
}

/**
 * "Thu, 9 Apr 2026 · 10:30 AM"
 */
export function formatDateTime(iso) {
  if (!iso) return '';
  return `${formatDate(iso)} · ${formatTime(iso)}`;
}

/**
 * Money: cents → "$30.00".
 */
export function formatMoney(cents) {
  if (cents == null) return '$0.00';
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Initial letters from first/last name → "JM"
 */
export function initials(first, last) {
  return `${(first || '').charAt(0)}${(last || '').charAt(0)}`.toUpperCase();
}

/**
 * Convert a 'YYYY-MM-DD' date string + 'HH:MM' time string (in the user's
 * LOCAL timezone) to an ISO UTC string that the API expects.
 *
 * The backend's availability endpoint returns ISO UTC strings directly in
 * each slot's `start_at` field, so for slot picking we use that value
 * directly. This helper exists for any place that builds a datetime from
 * loose date+time pieces (e.g. reschedule).
 */
export function combineLocalDateTimeToIso(dateStr, timeStr) {
  const local = new Date(`${dateStr}T${timeStr}:00`);
  return local.toISOString();
}

/**
 * The reverse — split a UTC ISO into a local 'YYYY-MM-DD' / 'HH:MM' pair
 * for use in form defaults.
 */
export function splitIsoToLocal(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

/**
 * A render-friendly status label (proper-cased).
 */
export function statusLabel(status) {
  if (!status) return '';
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
