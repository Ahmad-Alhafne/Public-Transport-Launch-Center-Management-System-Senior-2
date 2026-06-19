import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDriverProfile, getUser } from '../../services/api';
import { useTranslation } from 'react-i18next';

export default function ManageDriversDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDriver = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const [{ data: userData }, { data: profileData }] = await Promise.all([
          getUser(id),
          getDriverProfile(id),
        ]);
        setDriver(userData);
        setProfile(profileData);
      } catch (err) {
        setError(err.response?.data?.Detailed || err.response?.data || 'Failed to load driver details');
      } finally {
        setLoading(false);
      }
    };
    fetchDriver();
  }, [id]);

  const formatDate = (raw) => {
    if (!raw) return '-';
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? raw : date.toLocaleDateString();
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
          <h1 className="text-2xl font-bold text-[var(--charcoal)]">
            {t('generated.pages_admin_ManageDriversDetails_jsx_70_461341b1')}
          </h1>
          <p className="text-muted text-sm mt-0.5">
            {t('generated.pages_admin_ManageDriversDetails_jsx_71_a98a97b1')}
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-[var(--surface-soft)] hover:bg-[var(--surface-muted)] text-[var(--charcoal-medium)] border border-[rgba(66,129,119,0.15)] rounded-lg text-sm font-medium transition-colors whitespace-nowrap shadow-sm"
        >
          {`← `}{t('common.back')}
        </button>
      </div>

      {/* Main Details Grid Container */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Card Block 1: User Account Credentials */}
        <div className="card p-6 border border-[rgba(66,129,119,0.1)]">
          <h2 className="font-bold text-lg mb-4 text-[var(--charcoal)] pb-2 border-b border-[rgba(66,129,119,0.06)]">
            {t('generated.pages_admin_ManageDriversDetails_jsx_83_85dfa32c')}
          </h2>
          <div className="space-y-3 text-sm text-[var(--charcoal-medium)]">
            <div>
              <span className="text-muted font-medium mr-1">{t('generated.pages_admin_ManageDriversDetails_jsx_86_f963fee1')}</span> {driver?.fullName || '-'}
            </div>
            <div>
              <span className="text-muted font-medium mr-1">{t('generated.pages_admin_ManageDriversDetails_jsx_89_4c4e6b2d')}</span> {driver?.email || '-'}
            </div>
            <div>
              <span className="text-muted font-medium mr-1">{t('generated.pages_admin_ManageDriversDetails_jsx_92_daeea4d0')}</span> {driver?.phoneNumber || '-'}
            </div>
            <div>
              <span className="text-muted font-medium mr-1">{t('generated.pages_admin_ManageDriversDetails_jsx_95_61e4c27b')}</span> <span className="font-medium text-[var(--forest-dark)] bg-[var(--forest-100)] px-2 py-0.5 rounded text-xs uppercase tracking-wide">{driver?.role || '-'}</span>
            </div>
            <div>
              <span className="text-muted font-medium mr-1">{t('generated.pages_admin_ManageDriversDetails_jsx_98_11dc9e19')}</span> {driver?.accountStatus || '-'}
            </div>
            <div>
              <span className="text-muted font-medium mr-1">{t('generated.pages_admin_ManageDriversDetails_jsx_101_0c78dab1')}</span> {formatDate(driver?.createdAt)}
            </div>
          </div>
        </div>

        {/* Card Block 2: Professional Licensing & Transit Unit */}
        <div className="card p-6 border border-[rgba(66,129,119,0.1)]">
          <h2 className="font-bold text-lg mb-4 text-[var(--charcoal)] pb-2 border-b border-[rgba(66,129,119,0.06)]">
            {t('generated.pages_admin_ManageDriversDetails_jsx_107_b20c07e0')}
          </h2>
          <div className="space-y-3 text-sm text-[var(--charcoal-medium)]">
            <div>
              <span className="text-muted font-medium mr-1">{t('generated.pages_admin_ManageDriversDetails_jsx_110_3d80e506')}</span> {profile?.licenseNumber || '-'}
            </div>
            <div>
              <span className="text-muted font-medium mr-1">{t('generated.pages_admin_ManageDriversDetails_jsx_113_d19da61b')}</span> {profile?.licenseCategory || '-'}
            </div>
            <div>
              <span className="text-muted font-medium mr-1">{t('generated.pages_admin_ManageDriversDetails_jsx_116_3c45c925')}</span> {profile?.issuingAuthority || '-'}
            </div>
            <div>
              <span className="text-muted font-medium mr-1">{t('generated.pages_admin_ManageDriversDetails_jsx_119_c89115df')}</span> {formatDate(profile?.licenseExpiryDate)}
            </div>
            <div>
              <span className="text-muted font-medium mr-1">{t('generated.pages_admin_ManageDriversDetails_jsx_122_9677d7ed')}</span> <span className="font-mono bg-[var(--surface-muted)] px-1.5 py-0.5 border border-[rgba(66,129,119,0.08)] rounded text-xs font-semibold">{profile?.vehiclePlateNumber || '-'}</span>
            </div>
            <div>
              <span className="text-muted font-medium mr-1">{t('generated.pages_admin_ManageDriversDetails_jsx_125_7e93a374')}</span> {profile?.vehicleModel || '-'}
            </div>
            <div>
              <span className="text-muted font-medium mr-1">{t('generated.pages_admin_ManageDriversDetails_jsx_128_6b73dc9d')}</span> {profile?.vehicleColor || '-'}
            </div>
            <div>
              <span className="text-muted font-medium mr-1">{t('generated.pages_admin_ManageDriversDetails_jsx_131_ef775fbb')}</span> {formatDate(profile?.registrationExpiryDate)}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}