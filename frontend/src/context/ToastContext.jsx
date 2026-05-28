import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

let nextId = 1;

const VARIANT = {
  success: {
    bar: 'bg-emerald-500',
    cls: 'bg-white dark:bg-emerald-900/25 text-gray-800 dark:text-emerald-100',
    iconCls: 'text-emerald-500',
    icon: '✓',
  },
  error: {
    bar: 'bg-red-500',
    cls: 'bg-white dark:bg-red-900/25 text-gray-800 dark:text-red-100',
    iconCls: 'text-red-500',
    icon: '✕',
  },
  warn: {
    bar: 'bg-yellow-500',
    cls: 'bg-white dark:bg-yellow-900/25 text-gray-800 dark:text-yellow-100',
    iconCls: 'text-yellow-500',
    icon: '⚠',
  },
  info: {
    bar: 'bg-blue-500',
    cls: 'bg-white dark:bg-blue-900/25 text-gray-800 dark:text-white',
    iconCls: 'text-blue-500',
    icon: 'ℹ',
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = 'info', duration = 4000) => {
    const id = nextId++;
    setToasts((cur) => [...cur, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => setToasts((cur) => cur.filter((t) => t.id !== id)), duration);
    }
    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((cur) => cur.filter((t) => t.id !== id));
  }, []);

  // CRITICAL: memoize the API object so consumers get a stable reference
  // across re-renders. Without this, components using `toast` in a
  // useEffect dependency array re-run the effect every render → infinite
  // request loop.
  const api = useMemo(
    () => ({
      info: (m) => push(m, 'info'),
      success: (m) => push(m, 'success'),
      error: (m) => push(m, 'error'),
      warn: (m) => push(m, 'warn'),
      dismiss,
    }),
    [push, dismiss]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, onDismiss }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const v = VARIANT[t.type] ?? VARIANT.info;
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex rounded-lg shadow-lg overflow-hidden text-sm animate-[slidein_0.2s_ease-out]`}
          >
            <div className={`w-1 shrink-0 ${v.bar}`} />
            <div className={`flex flex-1 items-start gap-3 px-4 py-3 ${v.cls}`}>
              <span className={`mt-0.5 text-base shrink-0 font-bold ${v.iconCls}`}>{v.icon}</span>
              <p className="flex-1 leading-snug">{t.message}</p>
              <button
                onClick={() => onDismiss(t.id)}
                className="shrink-0 opacity-40 hover:opacity-80 transition-opacity text-current text-base ml-1 leading-none"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
