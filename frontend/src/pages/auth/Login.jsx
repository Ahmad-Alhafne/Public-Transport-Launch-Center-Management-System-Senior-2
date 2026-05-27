import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
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
            console.error('Login error:', err);
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
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                        🚌 Departure Center
                    </h1>
                    <p className="mt-2 text-slate-400">Public Transportation Management</p>
                </div>
                <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
                    <h2 className="text-2xl font-semibold mb-6 text-center">Sign In</h2>
                    {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors" />
                        </div>
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl font-medium transition-all duration-200 disabled:opacity-50">
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                    <p className="mt-4 text-center text-sm text-slate-400">
                        Don't have an account? <Link to="/register" className="text-blue-400 hover:text-blue-300">Register</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
