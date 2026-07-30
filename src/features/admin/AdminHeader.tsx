import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchBar } from '../../components/ui/SearchBar';
import { storageConfig } from '../../config/storage';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';

export function AdminHeader() {
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (value: string) => {
    if (value) {
      navigate(`/admin?search=${encodeURIComponent(value)}`);
    } else {
      navigate('/admin');
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-border">
      <div className="mx-auto px-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between h-20 gap-4 md:gap-6">
          <Link to="/admin" className="shrink-0" onClick={() => setIsMenuOpen(false)}>
            <div className="text-2xl font-bold text-primary tracking-tight">
              {import.meta.env.VITE_STORE_NAME}
            </div>
            <div className="text-sm text-ink-secondary -mt-0.5">
              {user?.email || storageConfig.companyName}
            </div>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-xl justify-center mx-auto">
            <SearchBar initialValue="" onSearch={handleSearch} />
          </div>

          {/* Desktop Right Icons */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <Link
              to="/"
              className="px-3 py-1.5 text-sm font-medium text-ink-secondary hover:text-primary transition-colors"
            >
              View Site
            </Link>
            <div className="w-px h-6 bg-border"></div>
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
            <button
              onClick={logout}
              className="px-3 py-1.5 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 text-ink-muted hover:text-ink-secondary transition-colors rounded-lg hover:bg-surface-hover"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div 
        className={`md:hidden absolute top-20 left-0 w-full bg-surface border-b border-border shadow-xl z-40 px-6 overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-[500px] py-4 opacity-100 visible' : 'max-h-0 py-0 opacity-0 invisible'
        }`}
      >
        <div className="flex flex-col gap-5">
          <SearchBar 
            initialValue="" 
            onSearch={handleSearch}
          />
          
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-ink-secondary hover:text-primary hover:bg-surface-hover rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View Site
            </Link>
            <button
              onClick={() => { logout(); setIsMenuOpen(false); }}
              className="flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-surface-hover rounded-lg transition-colors w-full text-left"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
          
          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm font-semibold text-ink">Tema Tampilan</span>
            <button
              onClick={() => { toggle(); setIsMenuOpen(false); }}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-ink-secondary hover:text-primary transition-colors rounded-lg hover:bg-surface-hover"
            >
              {isDark ? 'Mode Terang' : 'Mode Gelap'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
