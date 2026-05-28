import { createContext, useCallback, useContext, useState } from 'react';

const BookingContext = createContext(null);

const initial = {
  step: 1, // 1=details, 2=service, 3=time, 4=payment
  service: null,
  barber: null, // null means "any available"
  date: null,   // 'YYYY-MM-DD'
  time: null,   // 'HH:MM'
  startAt: null, // ISO datetime
  paymentMethod: 'counter',
  notes: '',
  customer: null, // populated from auth user
};

export function BookingProvider({ children }) {
  const [state, setState] = useState(initial);

  const set = useCallback((patch) => setState((s) => ({ ...s, ...patch })), []);
  const reset = useCallback(() => setState(initial), []);

  const goToStep = useCallback((step) => setState((s) => ({ ...s, step })), []);

  const value = { state, set, reset, goToStep };
  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within BookingProvider');
  return ctx;
}
