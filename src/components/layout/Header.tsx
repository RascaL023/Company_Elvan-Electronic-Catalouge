import { useSearchParams, Link } from 'react-router-dom';
import { SearchBar } from '../ui/SearchBar';
import { storageConfig } from '../../config/storage';
import { useTheme } from '../../contexts/ThemeContext';

export function Header() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isDark, toggle } = useTheme();

  const search = searchParams.get('search') || '';

  const handleSearchChange = (value: string) => {
    setSearchParams((prev) => {
      if (value) prev.set('search', value);
      else prev.delete('search');
      return prev;
    });
  };

  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-border">
      <div className="mx-auto px-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between h-20 gap-6">
          <Link to="/" className="shrink-0">
            <div className="text-2xl font-bold text-primary tracking-tight">
              {storageConfig.storeName}
            </div>
            <div className="text-sm text-ink-secondary -mt-0.5">
              {storageConfig.companyName}
            </div>
          </Link>
          <div className="flex-1 max-w-xl flex justify-center mx-auto">
            <SearchBar value={search} onChange={handleSearchChange} />
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={toggle}
              className="p-2 text-ink-muted hover:text-ink-secondary transition-colors rounded-lg hover:bg-surface-hover"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
