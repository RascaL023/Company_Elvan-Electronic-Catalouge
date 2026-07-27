import { SearchBar } from './SearchBar';
import { CartBadge } from './CartBadge';

interface HeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function Header({ search, onSearchChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <a href="/" className="text-xl font-bold text-indigo-600 shrink-0">
            ElectroShop
          </a>
          <div className="flex-1 hidden sm:flex justify-center">
            <SearchBar value={search} onChange={onSearchChange} />
          </div>
          <CartBadge />
        </div>
        <div className="sm:hidden pb-3">
          <SearchBar value={search} onChange={onSearchChange} />
        </div>
      </div>
    </header>
  );
}
