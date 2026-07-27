import { useSearchParams, Link } from 'react-router-dom';
import { SearchBar } from '../ui/SearchBar';
import { useCart } from '../../hooks/useCart';
import { useUiContext } from '../../services/UiProvider';

export function Header() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { cartCount } = useCart();
  const { openCartDrawer } = useUiContext();

  const search = searchParams.get('search') || '';

  const handleSearchChange = (value: string) => {
    setSearchParams((prev) => {
      if (value) prev.set('search', value);
      else prev.delete('search');
      return prev;
    });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link
            to="/"
            className="text-xl font-bold text-indigo-600 shrink-0"
          >
            ElectroShop
          </Link>
          <div className="flex-1 hidden sm:flex justify-center">
            <SearchBar value={search} onChange={handleSearchChange} />
          </div>
          <button
            onClick={openCartDrawer}
            className="relative p-2 text-gray-700 hover:text-indigo-600 transition-colors"
            aria-label="Shopping cart"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
              />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>
        </div>
        <div className="sm:hidden pb-3">
          <SearchBar value={search} onChange={handleSearchChange} />
        </div>
      </div>
    </header>
  );
}
