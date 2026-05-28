const STEPS = [
  { n: 1, label: 'Your Details' },
  { n: 2, label: 'Select Service' },
  { n: 3, label: 'Pick a Time' },
  { n: 4, label: 'Payment' },
];

export default function BookingStepper({ current }) {
  return (
    <div className="card p-3 md:p-4">
      <ol className="flex items-center justify-between gap-2 text-xs md:text-sm">
        {STEPS.map((s, i) => {
          const done = current > s.n;
          const active = current === s.n;
          return (
            <li key={s.n} className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              <span
                className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold ${
                  done
                    ? 'bg-emerald-500 text-white'
                    : active
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 dark:bg-navy-900 text-gray-400 dark:text-white/50 border border-gray-300 dark:border-navy-500'
                }`}
              >
                {done ? '✓' : s.n}
              </span>
              <span
                className={`truncate font-display tracking-wider uppercase ${
                  done
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : active
                    ? 'text-pink-500'
                    : 'text-gray-400 dark:text-white/40'
                }`}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <span className={`flex-1 h-px ${done ? 'bg-emerald-500/40' : 'bg-gray-200 dark:bg-navy-500/40'}`} />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
