import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Login berhasil, selamat datang!');
      navigate('/admin');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      let friendly = message;
      if (message.includes('auth/invalid-credential')) {
        friendly = 'Email atau password salah';
      } else if (message.includes('auth/user-not-found')) {
        friendly = 'Akun tidak ditemukan';
      } else if (message.includes('auth/wrong-password')) {
        friendly = 'Password salah';
      }
      setError(friendly);
      toast.error(friendly);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-surface rounded-xl shadow-2xl p-8 border border-border">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-ink">Admin Login</h1>
            <p className="text-sm text-ink-muted mt-1">
              Masuk untuk mengelola produk
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-ink-secondary mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-ink-secondary mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-sm font-medium text-primary-text bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm text-ink-muted hover:text-ink-secondary transition-colors"
            >
              ← Back to catalog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
