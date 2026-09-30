import { useEffect, useRef, useState, ReactNode, ElementType } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  variant?: 'fade-up' | 'fade-in' | 'scale-in';
  delay?: number;
  as?: ElementType;
  threshold?: number;
}

export function Reveal({
  children,
  className = '',
  variant = 'fade-up',
  delay = 0,
  as: Tag = 'div',
  threshold = 0.15,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  const animationClass =
    variant === 'fade-in'
      ? 'animate-fade-in'
      : variant === 'scale-in'
        ? 'animate-scale-in'
        : 'animate-fade-up';

  return (
    <Tag
      ref={ref}
      className={`${className} ${visible ? animationClass : 'opacity-0'}`}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
