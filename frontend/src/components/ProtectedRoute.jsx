import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-[9999]">
                <div
                    className="animate-spin rounded-full h-12 w-12 border-4 border-transparent"
                    style={{
                        borderTopColor: 'var(--forest)',
                        borderRightColor: 'var(--forest)',
                    }}
                />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !roles.some(r => r === user.role || r === getRoleName(user.role))) {
        return <Navigate to="/" replace />;
    }

    return children;
}

function getRoleName(role) {
    const map = { 0: 'Admin', 1: 'Driver', 2: 'Citizen', 3: 'Auditor', 4: 'QueueOrganizer', 5: 'Dispatcher' };
    return map[role] || role;
}
