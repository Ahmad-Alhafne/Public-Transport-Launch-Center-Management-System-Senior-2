import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import ConfirmationModal from './ConfirmationModal';

export default function Navbar() {
    const { user, logout, isAdmin, isDriver, isCitizen } = useAuth();
    const navigate = useNavigate();
    const [confirmLogout, setConfirmLogout] = useState(false);

    const handleLogout = () => {
        setConfirmLogout(true);
    };

    const confirmLogoutAction = () => {
        setConfirmLogout(false);
        logout();
        navigate('/login');
    };

    const getRoleLabel = () => {
        if (isAdmin()) return 'Admin';
        if (isDriver()) return 'Driver';
        if (isCitizen()) return 'Citizen';
        return '';
    };

    if (!user) return null;

    return (
        <>
            <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-8">
                            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                                🚌 Departure Center
                            </Link>

                            <div className="hidden md:flex items-center gap-4">
                                {isAdmin() && (
                                    <>
                                        <Link to="/admin/users" className="text-slate-300 hover:text-white transition-colors text-sm">Manage Users</Link>
                                        <Link to="/admin/drivers" className="text-slate-300 hover:text-white transition-colors text-sm">Manage Drivers</Link>
                                        <Link to="/admin/vehicles" className="text-slate-300 hover:text-white transition-colors text-sm">Vehicles</Link>
                                        <Link to="/admin/routes" className="text-slate-300 hover:text-white transition-colors text-sm">Routes</Link>
                                        <Link to="/admin/trips" className="text-slate-300 hover:text-white transition-colors text-sm">Trips</Link>
                                        <Link to="/admin/complaints" className="text-slate-300 hover:text-white transition-colors text-sm">Complaints</Link>
                                        <Link to="/admin/profile" className="text-slate-300 hover:text-white transition-colors text-sm">My Profile</Link>
                                    </>
                                )}

                                {isDriver() && (
                                    <>
                                        <Link to="/driver/profile" className="text-slate-300 hover:text-white transition-colors text-sm">My Profile</Link>
                                        <Link to="/driver/trips" className="text-slate-300 hover:text-white transition-colors text-sm">My Trips</Link>
                                        <Link to="/driver/complaints" className="text-slate-300 hover:text-white transition-colors text-sm">Complaints</Link>
                                    </>
                                )}

                                {isCitizen() && (
                                    <>
                                        <Link to="/citizen/profile" className="text-slate-300 hover:text-white transition-colors text-sm">My Profile</Link>
                                        <Link to="/citizen/trips" className="text-slate-300 hover:text-white transition-colors text-sm">Trips</Link>
                                        <Link to="/citizen/favorites" className="text-slate-300 hover:text-white transition-colors text-sm">My Favorites</Link>
                                        <Link to="/citizen/bookings" className="text-slate-300 hover:text-white transition-colors text-sm">My Bookings</Link>
                                        <Link to="/citizen/complaints" className="text-slate-300 hover:text-white transition-colors text-sm">Complaints</Link>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <NotificationBell />

                            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                {getRoleLabel()}
                            </span>

                            <span className="text-sm text-slate-400">
                                {user.fullName}
                            </span>

                            <button
                                onClick={handleLogout}
                                className="text-sm text-slate-400 hover:text-red-400 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <ConfirmationModal
                open={confirmLogout}
                title="Confirm Logout"
                message="Are you sure you want to log out?"
                confirmText="Logout"
                cancelText="Cancel"
                onConfirm={confirmLogoutAction}
                onCancel={() => setConfirmLogout(false)}
                danger
            />
        </>
    );
}