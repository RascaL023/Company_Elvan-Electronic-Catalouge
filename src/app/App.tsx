import { ThemeProvider } from '../contexts/ThemeContext';
import { Providers } from './providers';
import { AuthProvider } from '../hooks/useAuth';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Providers>
          <RouterProvider router={router} />
        </Providers>
      </AuthProvider>
    </ThemeProvider>
  );
}