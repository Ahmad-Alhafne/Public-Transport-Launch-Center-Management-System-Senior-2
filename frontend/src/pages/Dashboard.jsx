import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function Dashboard() {
    const { user, isAdmin, isDriver, isCitizen } = useAuth();

    if (isAdmin()) return <Navigate to="/admin/routes" replace />;
    if (isDriver()) return <Navigate to="/driver/trips" replace />;
    if (isCitizen()) return <Navigate to="/citizen/trips" replace />;

    return (
        <div className="text-center py-20">
            <h1 className="text-3xl font-bold">Welcome, {user?.fullName}</h1>
            <p className="text-slate-400 mt-2">Select an option from the navigation bar.</p>
        </div>
    );
}
