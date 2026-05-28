export default function Spinner({ size = 'md' }) {
  const dim = size === 'sm' ? 'w-4 h-4 border-2' : size === 'lg' ? 'w-10 h-10 border-[3px]' : 'w-6 h-6 border-2';
  return (
    <div
      className={`${dim} rounded-full border-pink-500/30 border-t-pink-500 animate-spin inline-block`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageLoader() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
