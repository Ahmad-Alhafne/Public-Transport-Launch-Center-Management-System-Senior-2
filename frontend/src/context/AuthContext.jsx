import { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n';

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

        const languagePreference = storedUser.languagePreference || storedUser.preferredLanguage || localStorage.getItem('preferredLanguage') || 'ar';
        if (languagePreference) {
            i18n.changeLanguage(languagePreference);
            localStorage.setItem('preferredLanguage', languagePreference);
            localStorage.setItem('i18nextLng', languagePreference);
            document.documentElement.lang = languagePreference;
            document.documentElement.dir = i18n.dir(languagePreference);
        }

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

    const setLanguagePreference = (language) => {
        if (!language) return;

        const updatedUser = user ? { ...user, languagePreference: language } : null;
        if (updatedUser) {
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        localStorage.setItem('preferredLanguage', language);
        localStorage.setItem('i18nextLng', language);
        i18n.changeLanguage(language);
        document.documentElement.lang = language;
        document.documentElement.dir = i18n.dir(language);
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
    const isAuditor = () => user?.role === 'Auditor' || user?.role === 3;
    const isOrganizer = () => user?.role === 'QueueOrganizer' || user?.role === 'Organizer' || user?.role === 4;

    return (
        <AuthContext.Provider value={{ user, token, loading, loginUser, logout, setLanguagePreference, isAdmin, isDriver, isCitizen, isAuditor, isOrganizer }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
