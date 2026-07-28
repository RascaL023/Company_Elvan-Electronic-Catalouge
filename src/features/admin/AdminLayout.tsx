import { Outlet, Link, useLocation } from 'react-router-dom';

export function AdminLayout() {
  const { pathname } = useLocation();

  const navItems = [
    { to: '/admin', label: 'Products', exact: true },
    { to: '/admin/products/new', label: 'Add Product', exact: false },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <Link to="/admin" className="text-lg font-bold tracking-tight">
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
                          ? 'bg-white/10 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <Link
              to="/"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              View Site
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
