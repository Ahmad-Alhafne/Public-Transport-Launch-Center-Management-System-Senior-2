import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getMyProfile, updateMyProfile } from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';
import LanguageSelector from '../../components/LanguageSelector';

export default function AdminProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        firstName: '',
        lastName: '',
        gender: '',
        dateOfBirth: '',
        nationalIdNumber: '',
        city: '',
        region: '',
        accountStatus: '',
        adminLevel: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [confirmingUpdate, setConfirmingUpdate] = useState(false);
    const { t } = useTranslation();

    const formatDateForInput = (value) => {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        return date.toISOString().slice(0, 10);
    };

    const formatDateForDisplay = (value) => {
        if (!value) return '-';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '-';
        return date.toLocaleString();
    };

    const fetchProfile = async () => {
        try {
            const { data } = await getMyProfile();
            setProfile(data);
            setForm({
                fullName: data.fullName || '',
                email: data.email || '',
                phoneNumber: data.phoneNumber || '',
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                gender: data.gender || '',
                dateOfBirth: formatDateForInput(data.dateOfBirth),
                nationalIdNumber: data.nationalIdNumber || '',
                city: data.city || '',
                region: data.region || '',
                accountStatus: data.accountStatus || '',
                adminLevel: data.adminLevel || '',
            });
        } catch {
            setError(t('admin.profile.loadFailed'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setConfirmingUpdate(true);
    };

    const confirmProfileUpdate = async () => {
        setConfirmingUpdate(false);
        setError('');
        setSuccess('');

        try {
            const { data } = await updateMyProfile({ ...form });
            setProfile(data);
            setEditing(false);
            setSuccess(t('admin.profile.successUpdate'));
        } catch (err) {
            setError(err.response?.data?.Detailed || t('admin.profile.updateFailed'));
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--forest)]"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="text-center py-10 font-medium text-[var(--umber)]">
                {t('admin.profile.profileNotFound')}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold tracking-tight mb-6 text-[var(--charcoal)]">
                {t('admin.profile.title')}
            </h1>

            <div className="mb-6 max-w-sm">
                <LanguageSelector />
            </div>

            {/* Notification Stack */}
            {error && <div className="alert alert-error mb-4 text-sm font-medium shadow-sm">{error}</div>}
            {success && <div className="alert alert-success mb-4 text-sm font-medium shadow-sm">{success}</div>}

            {/* Read-Only Profile View Panel */}
            <div className="card p-6 mb-6 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border-subtle)] transition-all duration-200">
                <div className="grid gap-5 md:grid-cols-2">
                    {[
                        { label: t('admin.profile.fullName'), val: profile.fullName },
                        { label: t('admin.profile.email'), val: profile.email },
                        { label: t('admin.profile.role'), val: profile.role },
                        { label: t('admin.profile.phone'), val: profile.phoneNumber },
                        { label: t('admin.profile.firstName'), val: profile.firstName },
                        { label: t('admin.profile.lastName'), val: profile.lastName },
                        { label: t('admin.profile.gender'), val: profile.gender },
                        { label: t('admin.profile.dateOfBirth'), val: formatDateForDisplay(profile.dateOfBirth) },
                        { label: t('admin.profile.nationalId'), val: profile.nationalIdNumber, isMono: true },
                        { label: t('admin.profile.city'), val: profile.city },
                        { label: t('admin.profile.region'), val: profile.region },
                        { label: t('admin.profile.accountStatus'), val: profile.accountStatus },
                        { label: t('admin.profile.adminLevel'), val: profile.adminLevel },
                        { label: t('admin.profile.created'), val: formatDateForDisplay(profile.accountCreationDate) }
                    ].map((item, idx) => (
                        <div key={idx}>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[var(--text-muted)]">
                                {item.label}
                            </label>
                            <p className={`text-base font-medium text-[var(--charcoal)] ${item.isMono ? 'font-mono text-sm' : ''}`}>
                                {item.val || '-'}
                            </p>
                        </div>
                    ))}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-[var(--text-muted)]">
                            {t('admin.profile.lastUpdated')}
                        </label>
                        <p className="text-base font-medium text-[var(--charcoal)]">
                            {formatDateForDisplay(profile.lastProfileUpdate)}
                        </p>
                    </div>
                </div>
            </div>

            {!editing ? (
                <button
                    onClick={() => setEditing(true)}
                    className="primary-button px-6 py-3 text-sm font-semibold shadow-sm rounded-[var(--radius-sm)] transition-all duration-200"
                >
                    {t('admin.profile.editProfile')}
                </button>
            ) : (
                /* Interactive Form Panel */
                <form onSubmit={handleSubmit} className="card p-6 grid gap-6 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border-subtle)] transition-all duration-300">
                    
                    {/* Basic Section */}
                    <div>
                        <h2 className="text-lg font-bold mb-4 pb-1.5 border-b border-[var(--border-light)] text-[var(--forest-dark)]">
                            {t('admin.profile.basicInformation')}
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="flex flex-col gap-1.5">
                                <span className="form-label !mb-0">{t('admin.profile.fullName')}</span>
                                <input
                                    type="text"
                                    value={form.fullName}
                                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                    className="input-field w-full focus:ring-2"
                                    required
                                />
                            </label>
                            <label className="flex flex-col gap-1.5">
                                <span className="form-label !mb-0">{t('admin.profile.email')}</span>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="input-field w-full focus:ring-2"
                                    required
                                />
                            </label>
                            <label className="flex flex-col gap-1.5 md:col-span-2">
                                <span className="form-label !mb-0">{t('admin.profile.phone')}</span>
                                <input
                                    type="text"
                                    value={form.phoneNumber}
                                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                                    className="input-field w-full focus:ring-2"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Personal Section */}
                    <div>
                        <h2 className="text-lg font-bold mb-4 pb-1.5 border-b border-[var(--border-light)] text-[var(--forest-dark)]">
                            {t('admin.profile.personalInformation')}
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="flex flex-col gap-1.5">
                                <span className="form-label !mb-0">{t('admin.profile.firstName')}</span>
                                <input
                                    type="text"
                                    value={form.firstName}
                                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                    className="input-field w-full focus:ring-2"
                                />
                            </label>
                            <label className="flex flex-col gap-1.5">
                                <span className="form-label !mb-0">{t('admin.profile.lastName')}</span>
                                <input
                                    type="text"
                                    value={form.lastName}
                                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                    className="input-field w-full focus:ring-2"
                                />
                            </label>
                            <label className="flex flex-col gap-1.5">
                                <span className="form-label !mb-0">{t('admin.profile.gender')}</span>
                                <select
                                    value={form.gender}
                                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                    className="input-field w-full focus:ring-2"
                                >
                                    <option value="">{t('admin.profile.selectGender')}</option>
                                    <option value="Male">{t('admin.profile.genderMale')}</option>
                                    <option value="Female">{t('admin.profile.genderFemale')}</option>
                                </select>
                            </label>
                            <label className="flex flex-col gap-1.5">
                                <span className="form-label !mb-0">{t('admin.profile.dateOfBirth')}</span>
                                <input
                                    type="date"
                                    value={form.dateOfBirth}
                                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                                    className="input-field w-full focus:ring-2"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Location Section */}
                    <div>
                        <h2 className="text-lg font-bold mb-4 pb-1.5 border-b border-[var(--border-light)] text-[var(--forest-dark)]">
                            {t('admin.profile.location')}
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="flex flex-col gap-1.5">
                                <span className="form-label !mb-0">{t('admin.profile.city')}</span>
                                <input
                                    type="text"
                                    value={form.city}
                                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                                    className="input-field w-full focus:ring-2"
                                />
                            </label>
                            <label className="flex flex-col gap-1.5">
                                <span className="form-label !mb-0">{t('admin.profile.region')}</span>
                                <input
                                    type="text"
                                    value={form.region}
                                    onChange={(e) => setForm({ ...form, region: e.target.value })}
                                    className="input-field w-full focus:ring-2"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Settings Section */}
                    <div>
                        <h2 className="text-lg font-bold mb-4 pb-1.5 border-b border-[var(--border-light)] text-[var(--forest-dark)]">
                            {t('admin.profile.adminSettings')}
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="flex flex-col gap-1.5">
                                <span className="form-label !mb-0">{t('admin.profile.accountStatus')}</span>
                                <select
                                    value={form.accountStatus}
                                    onChange={(e) => setForm({ ...form, accountStatus: e.target.value })}
                                    className="input-field w-full focus:ring-2"
                                >
                                    <option value="">{t('admin.profile.selectStatus')}</option>
                                    <option value="Active">{t('admin.profile.statusActive')}</option>
                                    <option value="Pending">{t('admin.profile.statusPending')}</option>
                                    <option value="Suspended">{t('admin.profile.statusSuspended')}</option>
                                </select>
                            </label>
                            <label className="flex flex-col gap-1.5">
                                <span className="form-label !mb-0">{t('admin.profile.adminLevel')}</span>
                                <select
                                    value={form.adminLevel}
                                    onChange={(e) => setForm({ ...form, adminLevel: e.target.value })}
                                    className="input-field w-full focus:ring-2"
                                >
                                    <option value="">{t('admin.profile.selectAdminLevel')}</option>
                                    <option value="SuperAdmin">{t('admin.profile.superAdmin')}</option>
                                    <option value="Admin">{t('admin.profile.admin')}</option>
                                </select>
                            </label>
                        </div>
                        <div className="mt-4">
                            <label className="form-label block text-sm font-semibold mb-1.5">{t('admin.profile.nationalIdNumber')}</label>
                            <input
                                type="text"
                                value={form.nationalIdNumber}
                                onChange={(e) => setForm({ ...form, nationalIdNumber: e.target.value })}
                                className="input-field w-full focus:ring-2"
                            />
                        </div>
                    </div>

                    {/* Form Controls */}
                    <div className="flex gap-3 pt-2">
                        <button type="submit" className="primary-button px-6 py-2.5 text-sm font-semibold shadow-sm rounded-[var(--radius-sm)]">
                            {t('admin.profile.save')}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setEditing(false);
                                setForm({
                                    fullName: profile.fullName || '',
                                    email: profile.email || '',
                                    phoneNumber: profile.phoneNumber || '',
                                    firstName: profile.firstName || '',
                                    lastName: profile.lastName || '',
                                    gender: profile.gender || '',
                                    dateOfBirth: formatDateForInput(profile.dateOfBirth),
                                    nationalIdNumber: profile.nationalIdNumber || '',
                                    city: profile.city || '',
                                    region: profile.region || '',
                                    accountStatus: profile.accountStatus || '',
                                    adminLevel: profile.adminLevel || '',
                                });
                            }}
                            className="danger-button px-6 py-2.5 text-sm font-medium shadow-sm rounded-[var(--radius-sm)]"
                        >
                            {t('common.cancel')}
                        </button>
                    </div>
                </form>
            )}

            <ConfirmationModal
                open={confirmingUpdate}
                title={t('admin.profile.confirmUpdateTitle')}
                message={t('admin.profile.confirmUpdateMessage')}
                confirmText={t('admin.profile.confirmUpdateAction')}
                cancelText={t('common.cancel')}
                onConfirm={confirmProfileUpdate}
                onCancel={() => setConfirmingUpdate(false)}
            />
        </div>
    );
}