import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';

export default function Dashboard() {
    const { t } = useTranslation();
    const { user, isAdmin, isDriver, isCitizen } = useAuth();

    if (isAdmin()) return <Navigate to="/admin/routes" replace />;
    if (isDriver()) return <Navigate to="/driver/trips" replace />;
    if (isCitizen()) return <Navigate to="/citizen/trips" replace />;

    return (
        <div className="text-center py-20" >
            <h1 style={{margin:'20px 0'}} className="text-3xl font-bold">{t('dashboard.welcome', { name: user?.fullName })}</h1>
            <p className="text-muted mt-2">{t('dashboard.selectOption')}</p>
        </div>
    );
}
