import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="card-padded w-full max-w-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors focus:outline-none"
          style={{ color: 'var(--lb-text-muted)' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--lb-border)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          aria-label="Close"
        >
          ✕
        </button>
        {title && <h3 className="h-section text-2xl mb-4 pr-8">{title}</h3>}
        <div>{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}
