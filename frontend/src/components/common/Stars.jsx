export default function Stars({ value = 0, max = 5 }) {
  const v = Number(value) || 0;
  return (
    <span className="inline-flex gap-0.5 text-gold-400" aria-label={`${v} of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < Math.round(v) ? 'opacity-100' : 'opacity-25'}>★</span>
      ))}
    </span>
  );
}
