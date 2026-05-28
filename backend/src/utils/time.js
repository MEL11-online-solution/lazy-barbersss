/**
 * Time helpers for booking logic.
 *
 * INTERNAL FORMAT: 'YYYY-MM-DD HH:MM:SS' (UTC, no timezone).
 *   - Matches what MySQL TIMESTAMP columns store and emit (because the
 *     mysql2 pool is configured with dateStrings: true, timezone: 'Z').
 *   - Strings of this shape are inserted verbatim into TIMESTAMP and
 *     read back unchanged. No silent timezone math anywhere.
 *
 * WIRE FORMAT: ISO-8601 UTC (`2026-04-24T10:30:00.000Z`)
 *   - Frontend always sends/receives ISO. Convert at the API boundary.
 */

// ---------------------------------------------------------------
// Conversions between ISO and the internal MySQL DATETIME string.
// ---------------------------------------------------------------

/** ISO string → 'YYYY-MM-DD HH:MM:SS' (UTC). */
function isoToMysql(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid datetime: ${iso}`);
  }
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

/** 'YYYY-MM-DD HH:MM:SS' (UTC) → ISO string. */
function mysqlToIso(s) {
  if (!s) return null;
  if (typeof s !== 'string') {
    return new Date(s).toISOString();
  }
  if (s.includes('T')) return new Date(s).toISOString();
  return new Date(`${s.replace(' ', 'T')}Z`).toISOString();
}

// ---------------------------------------------------------------
// Slot/time math
// ---------------------------------------------------------------

function timeToMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function addMinutesIso(iso, minutes) {
  const d = new Date(iso);
  d.setUTCMinutes(d.getUTCMinutes() + minutes);
  return d.toISOString();
}

function dayOfWeekUtc(iso) {
  return new Date(iso).getUTCDay();
}

function combineDateTimeUtc(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr}:00.000Z`).toISOString();
}

function isoToDateStr(iso) {
  return iso.slice(0, 10);
}

function isoToTimeStr(iso) {
  return iso.slice(11, 16);
}

// ---------------------------------------------------------------
// Validators
// ---------------------------------------------------------------

function isValidDateStr(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

function isValidIso(s) {
  if (typeof s !== 'string') return false;
  const d = new Date(s);
  return !Number.isNaN(d.getTime()) && d.toISOString() === s;
}

function nowIso() {
  return new Date().toISOString();
}

function nowMysql() {
  return isoToMysql(nowIso());
}

function diffMinutes(a, b) {
  return (new Date(b).getTime() - new Date(a).getTime()) / 60000;
}

module.exports = {
  isoToMysql,
  mysqlToIso,
  timeToMinutes,
  minutesToTime,
  addMinutesIso,
  dayOfWeekUtc,
  combineDateTimeUtc,
  isoToDateStr,
  isoToTimeStr,
  isValidDateStr,
  isValidIso,
  nowIso,
  nowMysql,
  diffMinutes,
};
