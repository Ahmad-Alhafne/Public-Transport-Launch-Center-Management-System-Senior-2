import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import LanguageSelector from '../../components/LanguageSelector';
import { getMyProfile, updateMyProfile } from '../../services/api';
import { useTranslation } from 'react-i18next';

export default function MyProfile() {
    const { t } = useTranslation();
    const { user, loginUser } = useAuth();
    const [profile, setProfile] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        disabilityStatus: '',
        currentAddress: ''
    });
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchProfile = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await getMyProfile();
            setProfile({
                fullName: data.fullName || '',
                email: data.email || '',
                phoneNumber: data.phoneNumber || '',
                disabilityStatus: data.disabilityStatus || '',
                currentAddress: data.currentAddress || ''
            });
            setPassword('');
        } catch (err) {
            setError(err.response?.data?.Detailed || err.response?.data || t('generated.pages_citizen_MyProfile_jsx_64_3cc4f343'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleSave = async () => {
        setError('');
        setSuccess('');

        try {
            const payload = {
                fullName: profile.fullName,
                phoneNumber: profile.phoneNumber,
                disabilityStatus: profile.disabilityStatus,
                currentAddress: profile.currentAddress
            };

            if (password) {
                payload.password = password;
            }

            const { data } = await updateMyProfile(payload);

            setSuccess(t('generated.pages_citizen_MyProfile_jsx_36_c1e9b2f8'));
            setEditing(false);
            setPassword('');

            // Keep auth context in sync (preserve token)
            const token = localStorage.getItem('token');
            if (token) {
                loginUser({ ...user, ...data, token });
            }
        } catch (err) {
            setError(err.response?.data?.Detailed || err.response?.data || t('generated.pages_citizen_MyProfile_jsx_74_87f3d2e0'));
        }
    };

    const handleCancel = () => {
        setEditing(false);
        fetchProfile();
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--forest)]"></div>
            </div>
        );
    }

    return (
        <div className="content-wrapper py-6">
            <div className="flex items-center justify-between gap-4 mb-6">
                <h1 className="heading-lg font-bold text-[var(--charcoal)]">
                    {t('generated.pages_citizen_MyProfile_jsx_93_9ba8d391')}
                </h1>
                {!editing ? (
                    <button
                        onClick={() => setEditing(true)}
                        className="secondary-button px-5 py-2.5 text-sm"
                    >
                        {t('profile.editProfile')}
                    </button>
                ) : (
                    <div className="flex gap-3">
                        <button
                            onClick={handleSave}
                            className="secondary-button px-5 py-2.5 text-sm"
                        >
                            {t('common.save')}
                        </button>
                        <button
                            onClick={handleCancel}
                            className="danger-button px-5 py-2.5 text-sm"
                        >
                            {t('common.cancel')}
                        </button>
                    </div>
                )}
            </div>

            <div className="mb-6 max-w-sm">  
                <LanguageSelector />
            </div>

            {/* Response Alerts mapping UI definitions */}
            {error && (
                <div className="alert alert-error mb-6">
                    {error}
                </div>
            )}
            {success && (
                <div className="alert alert-success mb-6">
                    {success}
                </div>
            )}

            {/* Main Profile Form Wrapper */}
            <div className="card p-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <label className="flex flex-col gap-1.5">
                        <span className="form-label text-sm font-medium text-[var(--charcoal-medium)]">
                            {t('generated.pages_citizen_MyProfile_jsx_137_64346b48')}
                        </span>
                        <input
                            value={profile.fullName}
                            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                            className="input-field"
                            disabled={!editing}
                        />
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="form-label text-sm font-medium text-[var(--charcoal-medium)]">
                            {t('generated.pages_citizen_MyProfile_jsx_146_84add5b2')}
                        </span>
                        <input
                            value={profile.email}
                            disabled
                            className="input-field bg-[var(--surface-muted)] text-muted cursor-not-allowed opacity-75"
                        />
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="form-label text-sm font-medium text-[var(--charcoal-medium)]">
                            {t('generated.pages_citizen_MyProfile_jsx_154_ab25d61b')}
                        </span>
                        <input
                            value={profile.phoneNumber}
                            onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                            className="input-field"
                            disabled={!editing}
                        />
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="form-label text-sm font-medium text-[var(--charcoal-medium)]">
                            {t('generated.pages_citizen_MyProfile_jsx_163_4894cb39')}
                        </span>
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t('generated.pages_citizen_MyProfile_jsx_167_efaed3a1')}
                            type="password"
                            className="input-field"
                            disabled={!editing}
                        />
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="form-label text-sm font-medium text-[var(--charcoal-medium)]">
                            {t('generated.pages_citizen_MyProfile_jsx_174_ab8b56ed')}
                        </span>
                        <select
                            value={profile.disabilityStatus}
                            onChange={(e) => setProfile({ ...profile, disabilityStatus: e.target.value })}
                            disabled={!editing}
                            className="input-field appearance-none"
                        >
                            <option value="">{t('generated.pages_citizen_MyProfile_jsx_181_bc7d8fb0')}</option>
                            <option value="None">{t('generated.pages_citizen_MyProfile_jsx_182_6eef6648')}</option>
                            <option value="Wheelchair">{t('generated.pages_citizen_MyProfile_jsx_183_6d2c3896')}</option>
                            <option value="Blind">{t('generated.pages_citizen_MyProfile_jsx_184_dff70db3')}</option>
                            <option value="Deaf">{t('generated.pages_citizen_MyProfile_jsx_185_185c6f18')}</option>
                        </select>
                    </label>

                    <label className="flex flex-col gap-1.5 md:col-span-2">
                        <span className="form-label text-sm font-medium text-[var(--charcoal-medium)]">
                            {t('generated.pages_citizen_MyProfile_jsx_189_04dbe0f3')}
                        </span>
                        <input
                            value={profile.currentAddress}
                            onChange={(e) => setProfile({ ...profile, currentAddress: e.target.value })}
                            className="input-field"
                            disabled={!editing}
                        />
                    </label>
                </div>
            </div>
        </div>
    );
}