export type ToastType = 'success' | 'error' | 'info';

export interface ToastData {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastViewportProps {
  toasts: ToastData[];
  onDismiss: (id: number) => void;
}

const styleByType: Record<ToastType, { bar: string; icon: string }> = {
  success: {
    bar: 'text-green-500',
    icon: 'text-green-500',
  },
  error: {
    bar: 'text-red-500',
    icon: 'text-red-500',
  },
  info: {
    bar: 'text-primary',
    icon: 'text-primary',
  },
};

function ToastIcon({ type }: { type: ToastType }) {
  if (type === 'success') {
    return (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (type === 'error') {
    return (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-[100] flex flex-col items-end gap-2 w-[calc(100vw-2rem)] max-w-sm pointer-events-none"
    >
      {toasts.map((toast) => {
        const colors = styleByType[toast.type];
        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto relative w-full bg-surface border border-border rounded-xl shadow-lg overflow-hidden animate-toast-in"
          >
            <span className={`absolute inset-y-0 left-0 w-1 ${colors.bar}`} />
            <div className="flex items-center gap-3 pl-4 pr-3 py-3">
              <span className={colors.icon}>
                <ToastIcon type={toast.type} />
              </span>
              <p className="flex-1 text-sm text-ink leading-snug">{toast.message}</p>
              <button
                onClick={() => onDismiss(toast.id)}
                className="p-1 text-ink-muted hover:text-ink-secondary transition-colors shrink-0"
                aria-label="Dismiss notification"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
