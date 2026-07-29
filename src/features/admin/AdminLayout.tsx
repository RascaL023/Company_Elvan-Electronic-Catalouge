import { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/admin/login', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    { to: '/admin', label: 'Products', exact: true },
    { to: '/admin/products/new', label: 'Add Product', exact: false },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-surface-alt">
      <header className="sticky top-0 z-40 bg-primary shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <Link
                to="/admin"
                className="text-lg font-bold text-primary-text tracking-tight"
              >
                Admin Panel
              </Link>
              <nav className="flex items-center gap-1">
                {navItems.map((item) => {
                  const active = item.exact
                    ? pathname === item.to
                    : pathname.startsWith(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                        active
                          ? 'bg-white/10 text-primary-text'
                          : 'text-primary-muted hover:text-primary-text hover:bg-white/5'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-primary-muted">
                {user.email}
              </span>
              <button
                onClick={logout}
                className="text-sm text-primary-muted hover:text-primary-text transition-colors"
              >
                Logout
              </button>
              <Link
                to="/"
                className="text-sm text-primary-muted hover:text-primary-text transition-colors"
              >
                View Site
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
