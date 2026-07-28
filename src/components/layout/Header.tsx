import { useSearchParams, Link } from 'react-router-dom';
import { SearchBar } from '../ui/SearchBar';
import { storageConfig } from '../../config/storage';

export function Header() {
  const [searchParams, setSearchParams] = useSearchParams();

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
            {storageConfig.storeName}
          </Link>
          <div className="flex-1 flex justify-center">
            <SearchBar value={search} onChange={handleSearchChange} />
          </div>
          <Link
            to="/admin"
            className="text-sm text-gray-400 hover:text-indigo-600 transition-colors shrink-0"
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
