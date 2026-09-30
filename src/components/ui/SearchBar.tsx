import { useState, useEffect, useCallback } from 'react';

interface SearchBarProps {
  initialValue?: string;
  onSearch: (value: string) => void;
  loading?: boolean;
}

export function SearchBar({ initialValue = '', onSearch, loading }: SearchBarProps) {
  const [inputValue, setInputValue] = useState(initialValue);

  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  const handleSubmit = useCallback(() => {
    onSearch(inputValue);
  }, [inputValue, onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleClear = () => {
    setInputValue('');
    onSearch('');
  };

  return (
    <div className="relative w-full max-w-md group">
      <div className="flex items-center w-full border border-border rounded-full bg-surface focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all shadow-sm group-hover:shadow-md p-1">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search products..."
          className="flex-1 bg-transparent px-4 py-2 text-sm text-ink placeholder-ink-muted focus:outline-none"
        />
        {inputValue && (
          <button
            onClick={handleClear}
            className="p-1 mr-1 text-ink-muted hover:text-ink-secondary transition-colors"
            aria-label="Clear search"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-10 h-10 flex items-center justify-center shrink-0 bg-primary text-primary-text rounded-full hover:bg-primary-dark hover:scale-105 active:scale-95 transition-all shadow-sm mr-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
          aria-label="Search"
        >
          {loading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
