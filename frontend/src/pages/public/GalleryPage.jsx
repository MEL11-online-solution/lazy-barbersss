import { useState, useEffect, useCallback } from 'react';
import { useScrollRevealGroup } from '../../hooks/useScrollReveal';

const PHOTOS = [
  { src: '/gallery/award/award1.jpg', alt: 'Award recognition' },
  { src: '/gallery/award/award2.jpg', alt: 'Award recognition' },
  { src: '/gallery/award/award3.jpg', alt: 'Award recognition' },
  { src: '/gallery/cut/cover.jpg', alt: 'Haircut' },
  { src: '/gallery/cut/1.jpg', alt: 'Haircut' },
  { src: '/gallery/cut/cut.jpg', alt: 'Haircut' },
  { src: '/gallery/cut/cut1.jpg', alt: 'Haircut' },
  { src: '/gallery/cut/cut2.jpg', alt: 'Haircut' },
  { src: '/gallery/cut/cut3.jpg', alt: 'Haircut' },
  { src: '/gallery/cut/cut4.jpg', alt: 'Haircut' },
  { src: '/gallery/cut/cut5.jpg', alt: 'Haircut' },
  { src: '/gallery/cut/cut6.jpg', alt: 'Haircut' },
];

export default function GalleryPage() {
  const tilesRef = useScrollRevealGroup(60);
  const [openIndex, setOpenIndex] = useState(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i - 1 + PHOTOS.length) % PHOTOS.length)),
    []
  );
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i + 1) % PHOTOS.length)),
    []
  );

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [openIndex, close, prev, next]);

  return (
    <>
      <section className="section text-center">
        <div className="container-page">
          <div className="flex items-center justify-center gap-3 mb-1">
            <span className="h-px w-8 bg-gold-400 inline-block" />
            <span className="text-gold-400 text-xs tracking-widest uppercase font-display">Our Work</span>
            <span className="h-px w-8 bg-gold-400 inline-block" />
          </div>
          <h1 className="h-display">Gallery</h1>
          <p className="mt-3" style={{ color: 'var(--lb-text-muted)' }}>Check out our premium work and transformations</p>
        </div>
      </section>

      <section className="container-page pb-16">
        <div ref={tilesRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {PHOTOS.map((photo, i) => (
            <button
              key={photo.src}
              type="button"
              onClick={() => setOpenIndex(i)}
              className="group block overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              style={{
                borderRadius: '12px',
                border: '2px solid transparent',
                transition: 'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.borderColor = '#D4A843';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                className="aspect-square w-full object-cover"
                style={{ borderRadius: '10px', display: 'block' }}
              />
            </button>
          ))}
        </div>
      </section>

      {openIndex !== null && (
        <div
          onClick={close}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute top-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full text-2xl transition-colors"
            style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#D4A843'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          >
            ✕
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Previous"
            className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full text-3xl transition-colors"
            style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#D4A843'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          >
            ‹
          </button>

          <img
            src={PHOTOS[openIndex].src}
            alt={PHOTOS[openIndex].alt}
            loading="lazy"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[90vw] object-contain"
            style={{ borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
          />

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Next"
            className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full text-3xl transition-colors"
            style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#D4A843'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}
