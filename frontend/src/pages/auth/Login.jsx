import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../imgs/Syrian_logo_icon_gold.svg';
import { login } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await login({ email, password });
      loginUser(data);
      navigate('/');
    } catch (err) {
      const response = err.response?.data;
      const message =
        typeof response === 'string'
          ? response
          : response?.Detailed ?? response?.Message ?? response?.message ?? err.message ?? 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 page-shell">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <img src={logo} alt="Departure Center Logo" className="h-20 w-20 rounded-full shadow-card" />
          <p className="mt-4 text-muted">{t('auth.publicTransport')}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-card">
          <h2 className="text-2xl font-semibold mb-6 text-center">{t('auth.login')}</h2>
          {error && <div className="mb-4 alert alert-error text-sm">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="form-label">{t('auth.email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="form-label">{t('auth.password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field w-full"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="primary-button w-full mt-6 py-3 font-medium transition-all duration-200 disabled:opacity-50"
            style={{marginTop:'10px'}}
          >
            {loading ? t('auth.signingIn') : t('auth.login')}
          </button>
          <p className="mt-4 text-center text-sm text-muted">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-forest hover:text-forest-dark">
              {t('auth.register')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
