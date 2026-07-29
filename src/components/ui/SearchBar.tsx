interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full max-w-md group">
      <div className="flex items-center w-full border border-border rounded-full bg-surface focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all shadow-sm group-hover:shadow-md p-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search products..."
          className="flex-1 bg-transparent px-4 py-2 text-sm text-ink placeholder-ink-muted focus:outline-none"
        />
        {value && (
          <button
            onClick={() => onChange('')}
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
          className="w-10 h-10 flex items-center justify-center shrink-0 bg-primary text-primary-text rounded-full hover:bg-primary-dark transition-colors shadow-sm mr-1.5"
          aria-label="Search"
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
