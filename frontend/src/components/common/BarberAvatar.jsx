import { useState } from 'react';
import { initials } from '../../lib/format';

/**
 * Circular barber avatar with photo + initials fallback.
 *
 * Photos have white backgrounds, so we keep a white fill behind the image and
 * layer a subtle dark ring + gold glow via box-shadow. The dark ring keeps the
 * white edge from looking harsh in dark mode; in light mode it's barely visible.
 *
 * Props:
 *  - barber: { first_name, last_name, avatar_url }
 *  - size: number (px) used when `sizeClass` is not provided; also drives fallback font size
 *  - sizeClass: Tailwind width/height classes for responsive sizing (overrides inline size)
 *  - borderWidth: gold border thickness in px
 *  - hover: enable hover scale + enhanced glow (used on the public Team page)
 */
export default function BarberAvatar({
  barber,
  size = 48,
  sizeClass = '',
  borderWidth = 2,
  hover = false,
}) {
  const [failed, setFailed] = useState(false);
  const url = barber?.avatar_url;
  const showImg = url && !failed;

  const dim = sizeClass ? {} : { width: size, height: size };
  const baseShadow = '0 0 0 3px rgba(0,0,0,0.18), 0 6px 16px rgba(212,168,67,0.30)';
  const hoverShadow = '0 0 0 3px rgba(0,0,0,0.22), 0 10px 26px rgba(212,168,67,0.55)';

  const wrapperProps = hover
    ? {
        onMouseEnter: (e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = hoverShadow;
        },
        onMouseLeave: (e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = baseShadow;
        },
      }
    : {};

  const wrapperStyle = {
    ...dim,
    borderRadius: '50%',
    border: `${borderWidth}px solid #D4A843`,
    boxShadow: baseShadow,
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    overflow: 'hidden',
    flexShrink: 0,
  };

  if (showImg) {
    return (
      <div className={`rounded-full ${sizeClass}`} style={{ ...wrapperStyle, background: '#fff' }} {...wrapperProps}>
        <img
          src={url}
          alt={`${barber.first_name || ''} ${barber.last_name || ''}`.trim()}
          loading="lazy"
          onError={() => setFailed(true)}
          className="w-full h-full object-cover"
          style={{ display: 'block' }}
        />
      </div>
    );
  }

  return (
    <div
      className={`rounded-full bg-pink-500 flex items-center justify-center keep-white font-display ${sizeClass}`}
      style={{ ...wrapperStyle }}
      {...wrapperProps}
    >
      <span style={{ fontSize: Math.round(size * 0.4) }}>{initials(barber?.first_name, barber?.last_name)}</span>
    </div>
  );
}
