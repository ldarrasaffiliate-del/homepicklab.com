import Link from 'next/link';
import { SITE } from '@/lib/site';

export default function NotFoundPage() {
  return (
    <div className="container stack">
      <section className="card prose">
        <h1>Page not found</h1>
        <p className="muted">The page you are looking for doesn’t exist (or has moved).</p>
        <Link className="btn btn--primary" href="/">
          Back to {SITE.brandName}
        </Link>
      </section>
    </div>
  );
}
