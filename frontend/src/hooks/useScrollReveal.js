import { useEffect, useRef } from 'react';

// Single element: ref → adds reveal-item + observes
export function useScrollReveal(delay = 0) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    el.classList.add('reveal-item');
    if (delay) el.style.transitionDelay = `${delay}ms`;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.classList.add('reveal-visible');
        observer.disconnect();
      }
    }, { threshold: 0.08 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);
  return ref;
}

// Group: applies stagger to direct children automatically
export function useScrollRevealGroup(stagger = 100) {
  const ref = useRef(null);
  useEffect(() => {
    const container = ref.current;
    if (!container || typeof IntersectionObserver === 'undefined') return;
    const items = [...container.children];
    items.forEach((el, i) => {
      el.classList.add('reveal-item');
      el.style.transitionDelay = `${i * stagger}ms`;
    });
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        items.forEach(el => el.classList.add('reveal-visible'));
        observer.disconnect();
      }
    }, { threshold: 0.05 });
    observer.observe(container);
    return () => observer.disconnect();
  }, [stagger]);
  return ref;
}
