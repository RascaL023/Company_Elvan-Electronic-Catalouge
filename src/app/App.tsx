import { ThemeProvider } from '../contexts/ThemeContext';
import { ToastProvider } from '../contexts/ToastContext';
import { Providers } from './providers';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Providers>
          <RouterProvider router={router} />
        </Providers>
      </ToastProvider>
    </ThemeProvider>
  );
}