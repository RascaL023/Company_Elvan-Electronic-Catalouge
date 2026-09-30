import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <h1 className="text-6xl font-bold text-ink-muted mb-4 animate-float">
        404
      </h1>
      <h2 className="text-xl font-semibold text-ink mb-2 animate-fade-up">
        Page Not Found
      </h2>
      <p
        className="text-ink-muted mb-8 animate-fade-up"
        style={{ animationDelay: '120ms' }}
      >
        The page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="px-6 py-2.5 bg-primary text-primary-text rounded-lg hover:bg-primary-dark hover:scale-[1.03] active:scale-[0.98] transition-all font-medium animate-fade-up"
        style={{ animationDelay: '200ms' }}
      >
        Back to Home
      </Link>
    </div>
  );
}
