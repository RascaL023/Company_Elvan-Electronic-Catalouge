interface EmptyStateProps {
  query: string;
}

export function EmptyState({ query }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 bg-surface-hover rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-ink-muted"
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
      </div>
      <h3 className="text-lg font-semibold text-ink mb-2">
        No products found
      </h3>
      <p className="text-ink-muted max-w-md">
        {query
          ? `No results for "${query}". Try a different search term.`
          : 'No products are available at the moment.'}
      </p>
    </div>
  );
}
