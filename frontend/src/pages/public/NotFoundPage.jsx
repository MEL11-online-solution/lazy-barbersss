import { Link } from 'wouter';

export default function NotFoundPage() {
  return (
    <section className="section text-center">
      <div className="container-page">
        <p className="text-pink-500 font-display text-7xl">404</p>
        <h1 className="h-section mt-3">Page not found</h1>
        <p className="text-white/60 mt-3">The page you're looking for doesn't exist.</p>
        <Link href="/" className="btn-primary mt-8">Back to home</Link>
      </div>
    </section>
  );
}
