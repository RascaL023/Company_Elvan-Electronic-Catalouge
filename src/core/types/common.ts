export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'rating-desc';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
