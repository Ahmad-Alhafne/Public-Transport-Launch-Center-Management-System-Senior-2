import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        const isValidToken = savedToken && savedToken !== 'undefined' && savedToken !== 'null';
        if (isValidToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        const handleAuthError = () => {
            logout();
        };

        window.addEventListener('auth-error', handleAuthError);
        return () => window.removeEventListener('auth-error', handleAuthError);
    }, []);

    const loginUser = (userData) => {
        // Normalize token property name (API may return "Token" or "token")
        const tokenValue = userData?.token ?? userData?.Token ?? null;
        const sanitizedToken = tokenValue && tokenValue !== 'undefined' ? tokenValue : null;

        const storedUser = {
            ...userData,
            token: sanitizedToken
        };

        setUser(storedUser);
        setToken(sanitizedToken);
        if (sanitizedToken) {
            localStorage.setItem('token', sanitizedToken);
        } else {
            localStorage.removeItem('token');
        }
        localStorage.setItem('user', JSON.stringify(storedUser));
        window.dispatchEvent(new Event('auth-token-changed'));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-token-changed'));
    };

    const isAdmin = () => user?.role === 'Admin' || user?.role === 0;
    const isDriver = () => user?.role === 'Driver' || user?.role === 1;
    const isCitizen = () => user?.role === 'Citizen' || user?.role === 2;

    return (
        <AuthContext.Provider value={{ user, token, loading, loginUser, logout, isAdmin, isDriver, isCitizen }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
