interface RatingProps {
  rate: number;
  count?: number;
}

export function Rating({ rate, count }: RatingProps) {
  const starCount = Math.round(rate);

  return (
    <div className="flex items-center gap-1 text-sm">
      <span className="text-yellow-400">
        {'★'.repeat(starCount)}
        {'☆'.repeat(5 - starCount)}
      </span>
      <span className="text-ink-muted ml-1">{rate}</span>
      {count !== undefined && (
        <span className="text-ink-muted text-xs">({count})</span>
      )}
    </div>
  );
}
