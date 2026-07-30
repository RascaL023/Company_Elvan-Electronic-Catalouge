import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SearchBar } from '../ui/SearchBar';
import { storageConfig } from '../../config/storage';
import { useTheme } from '../../contexts/ThemeContext';

export function Header() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isDark, toggle } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const search = searchParams.get('search') || '';

  const contacts = [
    { name: 'Admin', number: import.meta.env.VITE_ADMIN_NUMBER },
    { name: 'CS 1', number: import.meta.env.VITE_CS1_NUMBER },
    { name: 'CS 2', number: import.meta.env.VITE_CS2_NUMBER },
  ].filter(c => c.number);

  const formatWaLink = (num: string) => {
    const clean = num.replace(/\D/g, '');
    return clean.startsWith('0') ? `https://wa.me/62${clean.substring(1)}` : `https://wa.me/${clean}`;
  };

  const handleSearch = (value: string) => {
    setSearchParams((prev) => {
      if (value) prev.set('search', value);
      else prev.delete('search');
      return prev;
    });
  };

  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-border">
      <div className="mx-auto px-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between h-20 gap-4 md:gap-6">
          <Link to="/" className="shrink-0" onClick={() => setIsMenuOpen(false)}>
            <div className="text-2xl font-bold text-primary tracking-tight">
              {storageConfig.storeName}
            </div>
            <div className="text-sm text-ink-secondary -mt-0.5">
              {storageConfig.companyName}
            </div>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-xl justify-center mx-auto">
            <SearchBar initialValue={search} onSearch={handleSearch} />
          </div>

          {/* Desktop Right Icons */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <div className="relative group">
              <button className="relative px-2 py-1 font-medium text-sm text-ink-secondary hover:text-primary transition-colors cursor-pointer">
                Contact
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </button>
              <div className="absolute top-full right-0 mt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 w-56 bg-surface border border-border rounded-xl shadow-lg p-2 z-50">
                {contacts.length > 0 ? (
                  contacts.map((contact, i) => (
                    <a
                      key={i}
                      href={formatWaLink(contact.number)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-3 py-2 text-sm text-ink-secondary hover:text-primary hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-green-500 shrink-0">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      <div className="flex flex-col">
                        <span className="font-semibold text-ink">{contact.name}</span>
                        <span className="text-xs opacity-80">{contact.number}</span>
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="p-3 text-sm text-ink-muted text-center">CS Tidak Tersedia</div>
                )}
              </div>
            </div>
            <div className="w-px h-6 bg-border mx-1"></div>
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

          {/* Mobile Menu Toggle (Hamburger) */}
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
            initialValue={search} 
            onSearch={(v) => { 
              handleSearch(v); 
              setIsMenuOpen(false); 
            }} 
          />
          
          <div className="flex flex-col gap-4 border-t border-border pt-4">
            <span className="text-sm font-semibold text-ink">Hubungi Kami</span>
            <div className="flex flex-col gap-2">
              {contacts.length > 0 ? (
                contacts.map((contact, i) => (
                  <a
                    key={i}
                    href={formatWaLink(contact.number)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2 text-sm text-ink-secondary hover:text-primary hover:bg-surface-hover rounded-lg transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-green-500 shrink-0">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    <span className="font-medium text-ink">{contact.name}</span>
                    <span className="text-ink-muted ml-auto">{contact.number}</span>
                  </a>
                ))
              ) : (
                <div className="text-sm text-ink-muted px-3 py-2">CS Tidak Tersedia</div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm font-semibold text-ink">Tema Tampilan</span>
            <button
              onClick={toggle}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-ink-secondary hover:text-primary transition-colors rounded-lg hover:bg-surface-hover"
            >
              {isDark ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Mode Terang
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  Mode Gelap
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}