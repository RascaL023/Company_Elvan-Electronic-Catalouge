import { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'default' | 'category' | 'count';
  children: ReactNode;
}

const variantStyles: Record<string, string> = {
  default: 'bg-indigo-100 text-indigo-800',
  category: 'bg-gray-100 text-gray-600',
  count: 'bg-red-500 text-white',
};

export function Badge({ variant = 'default', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
}
