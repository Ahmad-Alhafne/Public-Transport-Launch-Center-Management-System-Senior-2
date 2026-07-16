import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUser } from '../../services/api';
import { useTranslation } from 'react-i18next';

export default function ManageAuditorsDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [auditor, setAuditor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data } = await getUser(id);
        setAuditor(data);
      } catch (err) {
        setError(err.response?.data?.Detailed || err.response?.data || 'Failed to load auditor details');
      } finally {
        setLoading(false);
      }
    };
    fetch();
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
        <button onClick={() => navigate(-1)} className="mb-6 px-4 py-2 bg-[var(--surface-soft)] hover:bg-[var(--surface-muted)] text-[var(--charcoal-medium)] border rounded-lg text-sm font-medium">{`← `}{t('common.back')}</button>
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="content-wrapper py-6">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 style={{margin:'20px 0'}} className="text-2xl font-bold text-[var(--charcoal)]">{t('admin.auditors.detailsTitle', 'Auditor Details')}</h1>
          <p className="text-muted text-sm mt-0.5">{t('admin.auditors.detailsSubtitle', 'Review the full auditor profile and account information.')}</p>
        </div>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-[var(--surface-soft)] hover:bg-[var(--surface-muted)] text-[var(--charcoal-medium)] border rounded-lg text-sm font-medium">{`← `}{t('common.back')}</button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-6 border border-[rgba(66,129,119,0.1)]">
          <h2 className="font-bold text-lg mb-4 text-[var(--charcoal)] pb-2 border-b">{t('admin.auditors.account', 'Account')}</h2>
          <div className="space-y-3 text-sm text-[var(--charcoal-medium)]">
            <div><span className="text-muted font-medium mr-1">{t('admin.auditors.fullName', 'Full Name:')}</span> {auditor?.fullName || '-'}</div>
            <div><span className="text-muted font-medium mr-1">{t('auth.email', 'Email:')}</span> {auditor?.email || '-'}</div>
            <div><span className="text-muted font-medium mr-1">{t('admin.auditors.phoneNumber', 'Phone:')}</span> {auditor?.phoneNumber || '-'}</div>
            <div><span className="text-muted font-medium mr-1">{t('admin.auditors.role', 'Role:')}</span> <span className="font-medium text-[var(--forest-dark)] bg-[var(--forest-100)] px-2 py-0.5 rounded text-xs uppercase tracking-wide">{auditor?.role ? t(`roles.${normalizeRoleKey(auditor.role)}`, auditor.role) : '-'}</span></div>
            <div><span className="text-muted font-medium mr-1">{t('admin.auditors.status', 'Status:')}</span> {auditor?.accountStatus ? t(`profile.status${auditor.accountStatus.charAt(0).toUpperCase()}${auditor.accountStatus.slice(1).toLowerCase()}`, auditor.accountStatus) : '-'}</div>
            <div><span className="text-muted font-medium mr-1">{t('admin.auditors.created', 'Created:')}</span> {formatDate(auditor?.createdAt)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
