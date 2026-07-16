import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUser, deleteUser } from '../../services/api';
import { useTranslation } from 'react-i18next';

export default function ManageOrganizersDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data } = await getUser(id);
        setUser(data);
      } catch (err) {
        setError(err.response?.data || 'Failed to load organizer details');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const formatDate = (raw) => {
    if (!raw) return '-';
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? raw : date.toLocaleDateString();
  };

  const normalizeRoleKey = (role) => {
    if (!role) return '';
    return String(role).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  };

  const translateAccountStatus = (status) => {
    if (!status) return '-';
    const s = String(status).trim();
    const key = `profile.status${s.charAt(0).toUpperCase()}${s.slice(1).toLowerCase()}`;
    return t(key, status);
  };

  const handleDelete = async () => {
    try {
      await deleteUser(id);
      navigate('/admin/organizers');
    } catch (err) {
      setError(err.response?.data || 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--forest)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-wrapper py-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 bg-[var(--surface-soft)] hover:bg-[var(--surface-muted)] text-[var(--charcoal-medium)] border border-[rgba(66,129,119,0.15)] rounded-lg text-sm font-medium transition-colors"
        >
          {`← `}{t('common.back')}
        </button>
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="content-wrapper py-6">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 style={{margin:'20px 0'}} className="text-2xl font-bold text-[var(--charcoal)]">{t('organizer.details.title', 'Organizer Details')}</h1>
          <p className="text-muted text-sm mt-0.5">{t('organizer.details.subtitle', 'Account and profile information for the organizer')}</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-[var(--surface-soft)] hover:bg-[var(--surface-muted)] text-[var(--charcoal-medium)] border border-[rgba(66,129,119,0.15)] rounded-lg text-sm font-medium transition-colors whitespace-nowrap shadow-sm"
        >
          {`← `}{t('common.back')}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-6 border border-[rgba(66,129,119,0.1)]">
          <h2 className="font-bold text-lg mb-4 text-[var(--charcoal)] pb-2 border-b border-[rgba(66,129,119,0.06)]">{t('generated.accountInfo', 'Account Info')}</h2>
          <div className="space-y-3 text-sm text-[var(--charcoal-medium)]">
            <div><span className="text-muted font-medium mr-1">{t('auditor.profile.fullName', 'Full name')}:</span> {user?.fullName || '-'}</div>
            <div><span className="text-muted font-medium mr-1">{t('auditor.profile.email', 'Email')}:</span> {user?.email || '-'}</div>
            <div><span className="text-muted font-medium mr-1">{t('auditor.profile.phone', 'Phone')}:</span> {user?.phoneNumber || '-'}</div>
            <div><span className="text-muted font-medium mr-1">{t('profile.role', 'Role')}:</span> <span className="font-medium text-[var(--forest-dark)] bg-[var(--forest-100)] px-2 py-0.5 rounded text-xs uppercase tracking-wide">{user?.role ? t(`roles.${normalizeRoleKey(user.role)}`, user.role) : '-'}</span></div>
            <div><span className="text-muted font-medium mr-1">{t('auditor.profile.status', 'Account Status')}:</span> {translateAccountStatus(user?.accountStatus)}</div>
            <div><span className="text-muted font-medium mr-1">{t('auditor.profile.createdAt', 'Created')}:</span> {formatDate(user?.createdAt)}</div>
          </div>
        </div>

        <div className="card p-6 border border-[rgba(66,129,119,0.1)]">
          <h2 className="font-bold text-lg mb-4 text-[var(--charcoal)] pb-2 border-b border-[rgba(66,129,119,0.06)]">{t('generated.profileInfo', 'Profile')}</h2>
          <div className="space-y-3 text-sm text-[var(--charcoal-medium)]">
            <div><span className="text-muted font-medium mr-1">{t('auditor.profile.nationalId', 'National ID')}:</span> {user?.nationalIdNumber || '-'}</div>
            <div><span className="text-muted font-medium mr-1">{t('auditor.profile.city', 'City')}:</span> {user?.city || '-'}</div>
            <div><span className="text-muted font-medium mr-1">{t('auditor.profile.region', 'Region')}:</span> {user?.region || '-'}</div>
            <div><span className="text-muted font-medium mr-1">{t('auditor.profile.dob', 'Date of Birth')}:</span> {formatDate(user?.dateOfBirth)}</div>
            <div><span className="text-muted font-medium mr-1">{t('auditor.profile.phone', 'Phone')}:</span> {user?.phoneNumber || '-'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
