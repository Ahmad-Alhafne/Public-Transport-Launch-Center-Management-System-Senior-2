import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import LanguageSelector from '../../components/LanguageSelector';
import { getMyDriverProfile, updateMyProfile } from '../../services/api';
import { useTranslation } from 'react-i18next';

export default function DriverProfile() {
    const { t } = useTranslation();
    const { user, loginUser } = useAuth();
    const [driverProfile, setDriverProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ fullName: '', phoneNumber: '' });
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const getErrorMessage = (error) => {
        const responseData = error?.response?.data;
        if (!responseData) return t('generated.pages_driver_DriverProfile_jsx_24_813849fe');
        if (typeof responseData === 'string') return responseData;
        return responseData?.Detailed || responseData?.message || responseData?.title || JSON.stringify(responseData);
    };

    const fetchProfile = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await getMyDriverProfile();
            setDriverProfile(data);
            if (!editing) {
                setForm({
                    fullName: data.fullName || user?.fullName || '',
                    phoneNumber: data.phoneNumber || user?.phoneNumber || ''
                });
            }
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        if (user) {
            setForm((prev) => ({
                fullName: prev.fullName || user.fullName || '',
                phoneNumber: prev.phoneNumber || user.phoneNumber || ''
            }));
        }
    }, [user]);

    const handleSave = async () => {
        setError('');
        setSuccess('');

        try {
            const payload = {
                fullName: form.fullName,
                phoneNumber: form.phoneNumber
            };

            if (password) {
                payload.password = password;
            }

            const { data } = await updateMyProfile(payload);

            setSuccess(t('driver.profile.successUpdate'));
            setEditing(false);
            setPassword('');

            const token = localStorage.getItem('token');
            if (token) {
                loginUser({ ...user, ...data, token });
            }
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const handleCancel = () => {
        setEditing(false);
        setPassword('');
        if (user) {
            setForm({
                fullName: user.fullName || '',
                phoneNumber: user.phoneNumber || ''
            });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--forest)]"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-10 font-medium text-[var(--umber)]">
                {t('generated.pages_driver_DriverProfile_jsx_84_7d1faade')}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-[var(--charcoal)]"  style={{margin:'20px 0'}}>
                    {t('generated.pages_driver_DriverProfile_jsx_89_5db8f62a')}
                </h1>
                {!editing ? (
                    <button
                        onClick={() => setEditing(true)}
                        className="px-5 py-2.5 bg-[var(--forest)] hover:bg-[var(--forest-dark)] text-white rounded-[var(--radius-sm)] text-sm font-semibold shadow-sm transition-all duration-200"
                    >
                        {t('generated.pages_driver_DriverProfile_jsx_96_79180a70')}
                    </button>
                ) : (
                    <div className="flex gap-3">
                        <button
                            onClick={handleSave}
                            className="px-5 py-2.5 bg-[var(--forest)] hover:bg-[var(--forest-dark)] text-white rounded-[var(--radius-sm)] text-sm font-semibold shadow-sm transition-all duration-200"
                        >
                            {t('common.saveChanges')}
                        </button>
                        <button
                            onClick={handleCancel}
                            className="px-5 py-2.5 bg-[var(--surface)] hover:bg-[var(--background-subtle)] border border-[var(--border-subtle)] text-[var(--charcoal)] rounded-[var(--radius-sm)] text-sm font-medium shadow-sm transition-all duration-200"
                        >
                            {t('common.cancel')}
                        </button>
                    </div>
                )}
            </div>

            {/* Language Selection Bar */}
            <div className="mb-6 max-w-xs"> 
                <LanguageSelector />
            </div>

            {/* Notification Center */}
            {error && <div className="alert alert-error mb-4 text-sm font-medium shadow-sm">{error}</div>}
            {success && <div className="alert alert-success mb-4 text-sm font-medium shadow-sm">{success}</div>}

            {/* Section 1: Account Profile Metadata */}
            <section className="card p-6 mb-6 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border-subtle)] transition-all duration-200">
                <h2 className="text-lg font-bold mb-4 pb-1.5 border-b border-[var(--border-light)] text-[var(--forest-dark)]">
                    {t('generated.pages_driver_DriverProfile_jsx_132_f29bae9a')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                            {t('generated.pages_driver_DriverProfile_jsx_135_64346b48')}
                        </span>
                        <input
                            type="text"
                            value={form.fullName}
                            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                            disabled={!editing}
                            className="input-field w-full focus:ring-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        />
                    </label>
                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                            {t('generated.pages_driver_DriverProfile_jsx_144_84add5b2')}
                        </span>
                        <input
                            type="email"
                            value={user.email || ''}
                            disabled
                            className="input-field w-full bg-[var(--background-subtle)] text-[var(--text-muted)] border-[var(--border-light)] cursor-not-allowed"
                        />
                    </label>
                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                            {t('generated.pages_driver_DriverProfile_jsx_152_ab25d61b')}
                        </span>
                        <input
                            type="text"
                            value={form.phoneNumber}
                            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                            disabled={!editing}
                            className="input-field w-full focus:ring-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        />
                    </label>
                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                            {t('generated.pages_driver_DriverProfile_jsx_161_4894cb39')}
                        </span>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={editing ? t('generated.pages_driver_DriverProfile_jsx_165_efaed3a1') : '••••••••'}
                            disabled={!editing}
                            className="input-field w-full focus:ring-2 disabled:opacity-70 disabled:cursor-not-allowed placeholder-[var(--text-muted)]"
                        />
                    </label>
                </div>
            </section>

            {/* Section 2: Administrative License Data */}
            <section className="card p-6 mb-6 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border-subtle)] transition-all duration-200">
                <h2 className="text-lg font-bold mb-4 pb-1.5 border-b border-[var(--border-light)] text-[var(--forest-dark)]">
                    {t('generated.pages_driver_DriverProfile_jsx_176_57b0387e')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[
                        { label: t('generated.pages_driver_DriverProfile_jsx_179_1d5971eb'), val: driverProfile?.licenseNumber, isMono: true },
                        { label: t('generated.pages_driver_DriverProfile_jsx_183_d6917986'), val: driverProfile?.licenseCategory },
                        { label: t('generated.pages_driver_DriverProfile_jsx_187_fa01e893'), val: driverProfile?.issuingAuthority },
                        { 
                            label: t('generated.pages_driver_DriverProfile_jsx_191_a3135958'), 
                            val: driverProfile?.licenseExpiryDate ? new Date(driverProfile.licenseExpiryDate).toLocaleDateString() : null 
                        }
                    ].map((item, idx) => (
                        <div key={idx}>
                            <span className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[var(--text-muted)]">
                                {item.label}
                            </span>
                            <p className={`text-base font-medium text-[var(--charcoal)] ${item.isMono ? 'font-mono text-sm tracking-wide' : ''}`}>
                                {item.val || '—'}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Section 3: Operational Vehicle Assignment */}
            <section className="card p-6 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border-subtle)] transition-all duration-200">
                <h2 className="text-lg font-bold mb-4 pb-1.5 border-b border-[var(--border-light)] text-[var(--forest-dark)]">
                    {t('generated.pages_driver_DriverProfile_jsx_199_3350f51f')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[
                        { label: t('generated.pages_driver_DriverProfile_jsx_202_ef6eab67'), val: driverProfile?.vehiclePlateNumber, isMono: true },
                        { label: t('generated.pages_driver_DriverProfile_jsx_206_699ff44e'), val: driverProfile?.vehicleModel },
                        { label: t('generated.pages_driver_DriverProfile_jsx_210_a6081371'), val: driverProfile?.vehicleColor },
                        { 
                            label: t('generated.pages_driver_DriverProfile_jsx_214_803ef608'), 
                            val: driverProfile?.registrationExpiryDate ? new Date(driverProfile.registrationExpiryDate).toLocaleDateString() : null 
                        }
                    ].map((item, idx) => (
                        <div key={idx}>
                            <span className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[var(--text-muted)]">
                                {item.label}
                            </span>
                            <p className={`text-base font-medium text-[var(--charcoal)] ${item.isMono ? 'font-mono text-sm tracking-wide' : ''}`}>
                                {item.val || '—'}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}