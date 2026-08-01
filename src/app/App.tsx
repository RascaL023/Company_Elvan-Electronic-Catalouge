import { ThemeProvider } from '../contexts/ThemeContext';
import { ToastProvider } from '../contexts/ToastContext';
import { Providers } from './providers';
import { AuthProvider } from '../hooks/useAuth';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Providers>
            <RouterProvider router={router} />
          </Providers>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}