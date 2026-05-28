import { useEffect, useMemo, useState } from 'react';
import { availabilityApi } from '../../api';
import { useBooking } from '../../context/BookingContext';
import { initials, formatTime } from '../../lib/format';
import Spinner from '../common/Spinner';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toLocalDateStr(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function buildMonth(year, month /* 0-11 */) {
  const first = new Date(year, month, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  // pad start
  const prevDays = new Date(year, month, 0).getDate();
  for (let i = startDow; i > 0; i--) {
    cells.push({ date: new Date(year, month - 1, prevDays - i + 1), inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), inMonth: false });
  }
  return cells;
}

export default function StepTime({ onBack, onNext }) {
  const { state, set } = useBooking();

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const cells = useMemo(() => buildMonth(viewYear, viewMonth), [viewYear, viewMonth]);

  const [slotsResp, setSlotsResp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [slotError, setSlotError] = useState(null);

  // Re-fetch availability whenever date / barber changes
  useEffect(() => {
    if (!state.date || !state.service) return;
    setLoading(true);
    availabilityApi
      .get({
        service_id: state.service.id,
        barber_id: state.barber?.id,
        date: state.date,
      })
      .then((r) => setSlotsResp(r))
      .catch(() => setSlotsResp({ slots: [] }))
      .finally(() => setLoading(false));
  }, [state.date, state.barber, state.service]);

  function selectDate(d) {
    const ds = toLocalDateStr(d);
    set({ date: ds, time: null, startAt: null });
  }

  function selectSlot(slot) {
    setSlotError(null);
    set({ time: slot.time, startAt: slot.start_at });
  }

  // Re-check availability at the moment the user clicks "Continue" —
  // the data loaded when they picked the date may be minutes stale.
  async function handleNext() {
    if (!state.startAt || !state.date || !state.service) return;
    setSlotError(null);
    setLoading(true);
    try {
      const fresh = await availabilityApi.get({
        service_id: state.service.id,
        barber_id: state.barber?.id,
        date: state.date,
      });
      setSlotsResp(fresh);
      const chosen = fresh.slots?.find((s) => s.time === state.time);
      if (!chosen?.available) {
        set({ time: null, startAt: null });
        setSlotError('That time was just taken — please pick another slot.');
        return;
      }
      onNext();
    } catch {
      // If the re-fetch fails, proceed; the server enforces double-booking
      onNext();
    } finally {
      setLoading(false);
    }
  }

  function changeMonth(delta) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setViewYear(y);
    setViewMonth(m);
  }

  // Disable past + >30 days
  const todayMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const maxMs = todayMs + 30 * 86400000;

  return (
    <div className="card-padded mt-4">
      {/* Selection summary */}
      <div className="card p-4 grid sm:grid-cols-3 gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-white/50">Service</p>
          <p className="font-semibold text-gray-900 dark:text-white">{state.service?.name}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-white/50">Barber</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {state.barber ? `${state.barber.first_name}` : 'Any available'}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-white/50">Duration</p>
          <p className="font-semibold text-gray-900 dark:text-white">{state.service?.duration_minutes} mins</p>
        </div>
      </div>

      {state.barber && (
        <div className="mt-4 card p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-sm font-bold text-white keep-white">
            {initials(state.barber.first_name, state.barber.last_name)}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{state.barber.first_name} {state.barber.last_name}</p>
            <p className="text-gray-500 dark:text-white/50 text-xs">⭐ {Number(state.barber.rating).toFixed(1)}</p>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <p className="form-label mb-0">📅 Select date</p>
          <div className="flex items-center gap-2">
            <button onClick={() => changeMonth(-1)} className="btn-ghost btn-sm">←</button>
            <span className="font-display tracking-wider uppercase text-sm text-gray-700 dark:text-white">
              {new Date(viewYear, viewMonth).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => changeMonth(1)} className="btn-ghost btn-sm">→</button>
          </div>
        </div>
        <div className="card p-3 mt-3">
          <div className="grid grid-cols-7 gap-1 text-center text-xs uppercase text-gray-500 dark:text-white/50 mb-2">
            {DAYS.map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, idx) => {
              const ds = toLocalDateStr(cell.date);
              const dayMs = new Date(cell.date.getFullYear(), cell.date.getMonth(), cell.date.getDate()).getTime();
              const disabled = dayMs < todayMs || dayMs > maxMs || !cell.inMonth;
              const selected = state.date === ds;
              return (
                <button
                  key={idx}
                  disabled={disabled}
                  onClick={() => selectDate(cell.date)}
                  className={`aspect-square rounded text-sm font-medium transition-colors ${
                    selected
                      ? 'bg-pink-500 text-white'
                      : disabled
                      ? 'text-gray-300 dark:text-white/20 cursor-not-allowed'
                      : 'bg-gray-100 dark:bg-navy-900 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-navy-700'
                  }`}
                >
                  {cell.date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Time slots */}
      <div className="mt-6">
        <p className="form-label">🕒 Select time</p>
        {loading ? (
          <div className="py-12 text-center"><Spinner /></div>
        ) : !state.date ? (
          <div className="card p-8 text-center text-gray-400 dark:text-white/50">Pick a date first</div>
        ) : !slotsResp?.slots?.length ? (
          <div className="card p-8 text-center text-gray-400 dark:text-white/50">No slots available on this day</div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {slotsResp.slots.map((s) => {
              const active = state.time === s.time;
              return (
                <button
                  key={s.time}
                  onClick={() => {
                    if (!s.available) {
                      setSlotError('This time slot is already taken. Please select another time.');
                      return;
                    }
                    selectSlot(s);
                  }}
                  className={`py-2 rounded text-sm font-display tracking-wider transition-colors flex flex-col items-center justify-center gap-0.5 ${
                    active
                      ? 'bg-pink-500 text-white'
                      : s.available
                      ? 'bg-gray-100 dark:bg-navy-900 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-navy-700 cursor-pointer'
                      : 'bg-gray-100 dark:bg-navy-900/40 text-gray-300 dark:text-white/30 cursor-not-allowed'
                  }`}
                >
                  <span>{formatTime(s.start_at)}</span>
                  {!s.available && (
                    <span className="text-[10px] font-sans tracking-normal text-red-400/80 leading-none">
                      Booked
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {slotError && (
        <p className="mt-4 text-center text-red-400 text-sm">{slotError}</p>
      )}

      <div className="flex gap-3 mt-4">
        <button onClick={onBack} className="btn-secondary flex-1">← Back</button>
        <button
          onClick={handleNext}
          disabled={!state.startAt || loading}
          className="btn-primary flex-1 disabled:opacity-50"
        >
          {loading ? 'Checking…' : 'Continue to payment →'}
        </button>
      </div>
    </div>
  );
}
