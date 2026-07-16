import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUser } from '../../services/api';
import { useTranslation } from 'react-i18next';

export default function ManageUsersDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      try {
        const { data } = await getUser(id);
        setUser(data);
      } catch (err) {
        setError(err.response?.data?.Detailed || err.response?.data || t('pages_admin_ManageUsersDetails_load_failed'));
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

  const translateGender = (gender) => {
    if (!gender) return '-';
    return t(`profile.gender${gender}`, gender);
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
        <div className="alert alert-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper py-6">
      {/* Header View Area */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 style={{margin:'20px 0'}} className="text-2xl font-bold text-[var(--charcoal)]">
            {t('generated.pages_admin_ManageUsersDetails_jsx_61_5addd7d6')}
          </h1>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-[var(--surface-soft)] hover:bg-[var(--surface-muted)] text-[var(--charcoal-medium)] border border-[rgba(66,129,119,0.15)] rounded-lg text-sm font-medium transition-colors whitespace-nowrap shadow-sm"
        >
          {`← `}{t('common.back')}
        </button>
      </div>

      {/* Main Details Grid Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Card Block 1: Main Core Account Credentials */}
        <div className="card p-6 border border-[rgba(66,129,119,0.1)]">
          <h2 className="font-bold text-lg mb-4 text-[var(--charcoal)] pb-2 border-b border-[rgba(66,129,119,0.06)]">
            {t('generated.pages_admin_ManageUsersDetails_jsx_74_85dfa32c')}
          </h2>
          <div className="space-y-3 text-sm text-[var(--charcoal-medium)]">
            <div>
              <span className="text-muted font-medium mr-1">{t('generated.pages_admin_ManageUsersDetails_jsx_77_f963fee1')}</span> {user?.fullName || '-'}
            </div>
            <div>
              <span className="text-muted font-medium mr-1">{t('generated.pages_admin_ManageUsersDetails_jsx_80_4c4e6b2d')}</span> {user?.email || '-'}
            </div>
            <div>
              <span className="text-muted font-medium mr-1">{t('generated.pages_admin_ManageUsersDetails_jsx_83_daeea4d0')}</span> {user?.phoneNumber || '-'}
            </div>
            <div>
              <span className="text-muted font-medium mr-1">{t('generated.pages_admin_ManageUsersDetails_jsx_86_61e4c27b')}</span> <span className="font-medium text-[var(--forest-dark)] bg-[var(--forest-100)] px-2 py-0.5 rounded text-xs uppercase tracking-wide">{user?.role ? t(`roles.${normalizeRoleKey(user.role)}`, user.role) : '-'}</span>
            </div>
            <div>
              <span className="text-muted font-medium mr-1">{t('generated.pages_admin_ManageUsersDetails_jsx_89_11dc9e19')}</span> {user?.accountStatus ? t(`profile.status${user.accountStatus.charAt(0).toUpperCase()}${user.accountStatus.slice(1).toLowerCase()}`, user.accountStatus) : '-'}
            </div>
            <div>
              <span className="text-muted font-medium mr-1">{t('generated.pages_admin_ManageUsersDetails_jsx_92_0c78dab1')}</span> {formatDate(user?.createdAt)}
            </div>
          </div>
        </div>

        {/* Card Block 2: Personal Registry Information */}
        <div className="card p-6 border border-[rgba(66,129,119,0.1)]">
          <h2 className="font-bold text-lg mb-4 text-[var(--charcoal)] pb-2 border-b border-[rgba(66,129,119,0.06)]">
            {t('generated.pages_admin_ManageUsersDetails_jsx_98_ad12e422')}
          </h2>
          <div className="space-y-3 text-sm text-[var(--charcoal-medium)]">
            <div>
              <span className="text-muted font-medium mr-1">{t('generated.pages_admin_ManageUsersDetails_jsx_101_e9a1010c')}</span> {user?.firstName || '-'}
            </div>
            <div>
              <span className="text-muted font-medium mr-1">{t('generated.pages_admin_ManageUsersDetails_jsx_104_3d9fa635')}</span> {user?.lastName || '-'}
            </div>
            <div>
              <span className="text-muted font-medium mr-1">{t('generated.pages_admin_ManageUsersDetails_jsx_107_525fa8d8')}</span> {user?.gender ? translateGender(user.gender) : '-'}
            </div>
            <div>
              <span className="text-muted font-medium mr-1">{t('generated.pages_admin_ManageUsersDetails_jsx_110_fb1cadcf')}</span> {formatDate(user?.dateOfBirth)}
            </div>
            <div>
              <span className="text-muted font-medium mr-1">{t('generated.pages_admin_ManageUsersDetails_jsx_113_c8573ddb')}</span> {user?.city || '-'}
            </div>
            <div>
              <span className="text-muted font-medium mr-1">{t('generated.pages_admin_ManageUsersDetails_jsx_116_25cdc1ce')}</span> {user?.region || '-'}
            </div>
            <div>
              <span className="text-muted font-medium mr-1">{t('generated.pages_admin_ManageUsersDetails_jsx_119_29c608d8')}</span> {user?.disabilityStatus || '-'}
            </div>
          </div>
        </div>

        {/* Card Block 3: Verification & Civic Registration Parameters */}
        <div className="card p-6 border border-[rgba(66,129,119,0.1)] md:col-span-2">
          <h2 className="font-bold text-lg mb-4 text-[var(--charcoal)] pb-2 border-b border-[rgba(66,129,119,0.06)]">
            {t('generated.pages_admin_ManageUsersDetails_jsx_125_3aeecec9')}
          </h2>
          <div className="grid gap-6 md:grid-cols-2 text-sm text-[var(--charcoal-medium)]">
            <div className="space-y-3">
              <div>
                <span className="text-muted font-medium mr-1">{t('generated.pages_admin_ManageUsersDetails_jsx_129_e9757a1e')}</span> <span className="font-mono bg-[var(--surface-muted)] px-1.5 py-0.5 border border-[rgba(66,129,119,0.08)] rounded text-xs font-semibold">{user?.nationalIdNumber || '-'}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-muted font-medium mr-1">{t('generated.pages_admin_ManageUsersDetails_jsx_147_b144649c')}</span> {user?.fatherName || '-'}
              </div>
              <div>
                <span className="text-muted font-medium mr-1">{t('generated.pages_admin_ManageUsersDetails_jsx_150_3c81fa68')}</span> {user?.motherName || '-'}
              </div>
              <div>
                <span className="text-muted font-medium mr-1">{t('generated.pages_admin_ManageUsersDetails_jsx_153_24d4e7a6')}</span> {user?.birthPlace || '-'}
              </div>
              <div>
                <span className="text-muted font-medium mr-1">{t('generated.pages_admin_ManageUsersDetails_jsx_156_fcc79d13')}</span> {user?.currentAddress || '-'}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}