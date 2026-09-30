import { useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidthClass?: string;
}

export function Modal({ open, onClose, children, maxWidthClass = 'max-w-2xl' }: ModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  // Rendered via a portal on <body> (z-[80], above the sticky header at
  // z-40 and below toasts at z-[100]). This avoids the modal being
  // clipped by the page's animated wrapper, which creates a stacking
  // context while `animate-fade-in` runs (the cause of the cut-off
  // quick view).
  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`bg-surface rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in ${maxWidthClass}`}>
        {children}
      </div>
    </div>,
    document.body
  );
}
