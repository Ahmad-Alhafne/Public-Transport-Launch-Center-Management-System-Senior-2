import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import logo from '../imgs/Syrian_logo_icon_gold.svg';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import NotificationBell from './NotificationBell';
import ConfirmationModal from './ConfirmationModal';
import { getEmergencies } from '../services/api';

export default function Navbar() {
  const { user, logout, isAdmin, isDriver, isCitizen, isAuditor, isOrganizer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [hasPendingEmergencies, setHasPendingEmergencies] = useState(false);
  const [lastSeenEmergencyAt, setLastSeenEmergencyAt] = useState(null);

  const lastSeenKey = user?.id ? `adminEmergencyLastSeenAt:${user.id}` : 'adminEmergencyLastSeenAt';
  const emergencyPagePath = '/admin/emergencies';

  useEffect(() => {
    if (!user) {
      setLastSeenEmergencyAt(null);
      setHasPendingEmergencies(false);
      return;
    }

    const stored = localStorage.getItem(lastSeenKey);
    setLastSeenEmergencyAt(stored ? new Date(stored) : null);
  }, [user, lastSeenKey]);

  const saveLastSeenEmergencyAt = useCallback((date) => {
    const timestamp = date.toISOString();
    localStorage.setItem(lastSeenKey, timestamp);
    setLastSeenEmergencyAt(new Date(timestamp));
  }, [lastSeenKey]);

  const fetchPendingEmergencies = useCallback(async () => {
    if (!isAdmin()) {
      setHasPendingEmergencies(false);
      return;
    }

    try {
      const { data } = await getEmergencies();
      const hasNew = Array.isArray(data) && data.some((emergency) => {
        if (emergency?.status !== 'Reported') return false;
        const createdAt = new Date(emergency.createdAt);
        if (Number.isNaN(createdAt.getTime())) return false;
        return !lastSeenEmergencyAt || createdAt > lastSeenEmergencyAt;
      });
      setHasPendingEmergencies(!!hasNew);
    } catch (err) {
      console.error('Failed to load emergency status for navbar alert:', err);
      setHasPendingEmergencies(false);
    }
  }, [isAdmin, lastSeenEmergencyAt]);

  useEffect(() => {
    fetchPendingEmergencies();
    const interval = setInterval(fetchPendingEmergencies, 30000);
    return () => clearInterval(interval);
  }, [fetchPendingEmergencies]);

  useEffect(() => {
    if (isAdmin() && location.pathname.startsWith(emergencyPagePath)) {
      saveLastSeenEmergencyAt(new Date());
      setHasPendingEmergencies(false);
    }
  }, [isAdmin, location.pathname, saveLastSeenEmergencyAt]);

  const handleLogout = () => {
    setConfirmLogout(true);
  };

  const confirmLogoutAction = () => {
    setConfirmLogout(false);
    logout();
    setHasPendingEmergencies(false);
    navigate('/login');
  };

  if (!user) return null;

  // Determines the display string for the user role badge
  const getUserRoleLabel = () => {
    if (isAdmin()) return t('roles.admin') || 'Admin';
    if (isDriver()) return t('roles.driver') || 'Driver';
    if (isCitizen()) return t('roles.citizen') || 'Citizen';
    if (isAuditor()) return t('roles.auditor') || 'Auditor';
    if (isOrganizer()) return t('roles.organizer') || 'Organizer';
    return '';
  };

  const renderLinks = () => {
    if (isAdmin()) {
      return (
        <>
          <NavLink to="/admin/organizers" className="nav-link text-sm font-medium">{t('nav.organizers') || 'Organizers'}</NavLink>
          <NavLink to="/admin/users" className="nav-link text-sm font-medium">{t('nav.users')}</NavLink>
          <NavLink to="/admin/drivers" className="nav-link text-sm font-medium">{t('nav.drivers')}</NavLink>
          <NavLink to="/admin/vehicles" className="nav-link text-sm font-medium">{t('nav.vehicles')}</NavLink>
          <NavLink to="/admin/routes" className="nav-link text-sm font-medium">{t('nav.routes')}</NavLink>
          <NavLink to="/admin/trips" className="nav-link text-sm font-medium">{t('nav.trips')}</NavLink>
          <NavLink
            to="/admin/emergencies"
            onClick={() => {
              saveLastSeenEmergencyAt(new Date());
              setHasPendingEmergencies(false);
            }}
            style={hasPendingEmergencies ? { backgroundColor: '#dc2626', color: '#ffffff' } : undefined}
            className={({ isActive }) => `nav-link text-sm font-medium ${isActive ? 'active' : ''}`}
          >
            {t('nav.emergencies','Emergencies')}
          </NavLink>
          <NavLink to="/admin/complaints" className="nav-link text-sm font-medium">{t('nav.complaints')}</NavLink>
          <NavLink to="/admin/profile" className="nav-link text-sm font-medium">{t('nav.profile')}</NavLink>
        </>
      );
    }

    if (isOrganizer()) {
      return (
        <>
          <NavLink to="/organizer/profile" className="nav-link text-sm font-medium">{t('nav.profile') || 'Profile'}</NavLink>
          <NavLink to="/organizer/dashboard" className="nav-link text-sm font-medium">{t('nav.dashboard') || 'Dashboard'}</NavLink>
          <NavLink to="/organizer/queues" className="nav-link text-sm font-medium">{t('nav.queues') || 'Queues'}</NavLink>
          <NavLink to="/organizer/complaints" className="nav-link text-sm font-medium">{t('nav.complaints') || 'Complaints'}</NavLink>
          <NavLink to="/organizer/violations" className="nav-link text-sm font-medium">{t('nav.violations') || 'Violations'}</NavLink>
        </>
      );
    }

    if (isDriver()) {
      return (
        <>
          <NavLink to="/driver/profile" className="nav-link text-sm font-medium">{t('nav.profile')}</NavLink>
          <NavLink to="/driver/trips" className="nav-link text-sm font-medium">{t('nav.trips')}</NavLink>
          <NavLink to="/driver/complaints" className="nav-link text-sm font-medium">{t('nav.complaints')}</NavLink>
        </>
      );
    }

    if (isAuditor()) {
      return (
        <>
          <NavLink to="/auditor/profile" className="nav-link text-sm font-medium">{t('nav.profile')}</NavLink>
          <NavLink to="/auditor/available" className="nav-link text-sm font-medium">{t('nav.trips')}</NavLink>
          <NavLink to="/auditor/active" className="nav-link text-sm font-medium">{t('nav.activeAudit') || 'Active Audit'}</NavLink>
          <NavLink to="/auditor/history" className="nav-link text-sm font-medium">{t('nav.history') || 'Audit History'}</NavLink>
          <NavLink to="/auditor/dashboard" className="nav-link text-sm font-medium">{t('nav.dashboard')}</NavLink>
        </>
      );
    }

    if (isCitizen()) {
      return (
        <>
          <NavLink to="/citizen/profile" className="nav-link text-sm font-medium">{t('nav.profile')}</NavLink>
          <NavLink to="/citizen/trips" className="nav-link text-sm font-medium">{t('nav.trips')}</NavLink>
          <NavLink to="/citizen/favorites" className="nav-link text-sm font-medium">{t('nav.favorites')}</NavLink>
          <NavLink to="/citizen/bookings" className="nav-link text-sm font-medium">{t('nav.bookings')}</NavLink>
          <NavLink to="/citizen/complaints" className="nav-link text-sm font-medium">{t('nav.complaints')}</NavLink>
        </>
      );
    }

    return null;
  };

  return (
    <>
      <nav style={{borderRadius:'15px',padding:"8px"}} className="navbar-shell sticky top-0 z-50 transition-all duration-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{padding:"8px"}}>
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Left side: Brand Logo and Navigation links */}
            <div className="flex items-center gap-6">
                <Link to="/" className="flex items-center gap-3 active:scale-98 transition-transform">
                <img src={logo} alt={t('app.logoAlt', 'Departure Center Logo')} className="h-10 w-10 rounded-full shadow-card object-contain" />
              </Link>
              
              <div className="hidden lg:flex items-center gap-1.5">
                    {renderLinks()}
                    {/* Auditors link for admin area */}
                    {isAdmin() && (
                      <NavLink to="/admin/auditors" className="nav-link text-sm font-medium">{t('nav.auditors1')}</NavLink>
                    )}
              </div>
            </div>

            {/* Right side: Utilities, User Profile, and Actions */}
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <NotificationBell />
              </div>

              {/* Live Tracking quick button (always visible for eligible roles) */}
              {(isAdmin() || isOrganizer() || isDriver() || isCitizen() || isAuditor()) && (
                <Link to="/live-tracking" className="button-icon mr-2" title={t('nav.liveTracking') || 'Live Tracking'}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>
                </Link>
              )}

              <div className="hidden sm:flex flex-col items-end gap-0.5 max-w-[150px]">
                <span className="text-sm font-semibold truncate w-full text-right text-[var(--charcoal)] leading-tight">
                  {user.fullName}
                </span>
                <span className="nav-role scale-90 origin-right whitespace-nowrap select-none">
                  {getUserRoleLabel()}
                </span>
              </div>

              {/* Decorative separator line */}
              <div className="h-5 w-[1px] bg-gray-200 dark:bg-zinc-800 hidden sm:block"></div>

              <button
                style={{fontWeight:"bold"}}
                onClick={handleLogout}
                className="text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg text-[var(--umber)] hover:text-[var(--umber-dark)] hover:bg-[var(--umber)]/5 transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[var(--umber)]/20"
              >
                {t('nav.logout')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <ConfirmationModal
        open={confirmLogout}
        title={t('confirmation.logoutTitle') || 'Confirm Logout'}
        message={t('confirmation.logoutMessage') || 'Are you sure you want to log out?'}
        confirmText={t('confirmation.logout') || 'Logout'}
        cancelText={t('common.cancel') || 'Cancel'}
        onConfirm={confirmLogoutAction}
        onCancel={() => setConfirmLogout(false)}
        danger
      />
    </>
  );
}