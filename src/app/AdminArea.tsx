import { Outlet } from 'react-router-dom';
import { AuthProvider } from '../hooks/useAuth';

export function AdminArea() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
