import { storageConfig } from '../../config/storage';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-ink-secondary">
            &copy; {year} {storageConfig.storeName}.{' '}
            <span className="text-ink-muted">
              {storageConfig.companyName}
            </span>
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-ink-muted hover:text-ink-secondary transition-colors"
            >
              About
            </a>
            <a
              href="#"
              className="text-ink-muted hover:text-ink-secondary transition-colors"
            >
              Contact
            </a>
            <a
              href="#"
              className="text-ink-muted hover:text-ink-secondary transition-colors"
            >
              Privacy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
