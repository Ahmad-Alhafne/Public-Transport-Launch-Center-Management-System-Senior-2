import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import LanguageSelector from '../../components/LanguageSelector';
import { getMyProfile, updateMyProfile } from '../../services/api';
import { useTranslation } from 'react-i18next';

export default function AuditorProfile() {
    const { t } = useTranslation();
    const { user, loginUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ fullName: '', phoneNumber: '' });
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const getErrorMessage = (error) => {
        const responseData = error?.response?.data;
        if (!responseData) return t('common.operationFailed');
        if (typeof responseData === 'string') return responseData;
        return responseData?.Detailed || responseData?.message || responseData?.title || JSON.stringify(responseData);
    };

    const fetchProfile = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await getMyProfile();
            setForm({ fullName: data.fullName || '', phoneNumber: data.phoneNumber || '' });
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProfile(); }, []);

    useEffect(() => {
        if (user) {
            setForm({ fullName: user.fullName || '', phoneNumber: user.phoneNumber || '' });
        }
    }, [user]);

    const handleSave = async () => {
        setError('');
        setSuccess('');
        try {
            const payload = { fullName: form.fullName, phoneNumber: form.phoneNumber };
            if (password) payload.password = password;
            const { data } = await updateMyProfile(payload);
            setSuccess(t('common.saved') || 'Saved');
            setEditing(false);
            setPassword('');
            const token = localStorage.getItem('token');
            if (token) loginUser({ ...user, ...data, token });
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const handleCancel = () => {
        setEditing(false);
        setPassword('');
        if (user) setForm({ fullName: user.fullName || '', phoneNumber: user.phoneNumber || '' });
    };

    if (loading) {
        return (
            <div className="content-wrapper py-6">
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--forest)]"></div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (<div className="text-center py-10 font-medium text-[var(--umber)]">{t('common.notAuthorized') || 'Not authorized'}</div>);
    }

    return (
        <div className="content-wrapper py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 style={{margin:'20px 0'}} className="text-3xl font-bold tracking-tight text-[var(--charcoal)]">{t('auditor.profile.title') || 'My Profile'}</h1>
                {!editing ? (
                    <button onClick={() => setEditing(true)} className="primary-button">{t('common.edit')}</button>
                ) : (
                    <div className="flex gap-3">
                        <button onClick={handleSave} className="primary-button">{t('common.saveChanges')}</button>
                        <button onClick={handleCancel} className="outline-button">{t('common.cancel')}</button>
                    </div>
                )}
            </div>

            <div className="mb-6 max-w-xs"><LanguageSelector /></div>

            {error && <div className="alert alert-error mb-4 text-sm font-medium shadow-sm">{error}</div>}
            {success && <div className="alert alert-success mb-4 text-sm font-medium shadow-sm">{success}</div>}

            <section className="card p-6 mb-6 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)]">
                <h2 className="text-lg font-bold mb-4 pb-1.5 border-b text-[var(--forest-dark)]">{t('auditor.profile.account') || 'Account'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{t('auditor.profile.fullName') || 'Full name'}</span>
                        <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} disabled={!editing} className="input-field" />
                    </label>
                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{t('auth.email') || 'Email'}</span>
                        <input type="email" value={user.email || ''} disabled className="input-field bg-[var(--background-subtle)] text-[var(--text-muted)]" />
                    </label>
                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{t('auditor.profile.phone') || 'Phone'}</span>
                        <input type="text" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} disabled={!editing} className="input-field" />
                    </label>
                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{t('auditor.profile.password') || 'Password'}</span>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={editing ? t('auditor.profile.passwordPlaceholder') || 'New password' : '••••••••'} disabled={!editing} className="input-field" />
                    </label>
                </div>
            </section>
        </div>
    );
}
