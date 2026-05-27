import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMyDriverProfile, updateMyProfile } from '../../services/api';

export default function DriverProfile() {
    const { user, loginUser } = useAuth();
    const [driverProfile, setDriverProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ fullName: '', phoneNumber: '' });
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchProfile = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await getMyDriverProfile();
            setDriverProfile(data);
        } catch (err) {
            setError(err.response?.data?.Detailed || err.response?.data || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        if (user) {
            setForm({
                fullName: user.fullName || '',
                phoneNumber: user.phoneNumber || ''
            });
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

            setSuccess('Profile updated successfully.');
            setEditing(false);
            setPassword('');

            const token = localStorage.getItem('token');
            if (token) {
                loginUser({ ...user, ...data, token });
            }
        } catch (err) {
            setError(err.response?.data?.Detailed || err.response?.data || 'Failed to update profile');
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

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    if (!user) return <div className="text-center py-10 text-red-400">Unable to load user data.</div>;

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold">My Driver Profile</h1>
                {!editing ? (
                    <button
                        onClick={() => setEditing(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm transition-colors"
                    >
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm transition-colors"
                        >
                            Save Changes
                        </button>
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}
            {success && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">
                    {success}
                </div>
            )}

            {/* Profile Info */}
            <section className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 mb-6">
                <h2 className="text-lg font-semibold mb-4">Profile Info</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex flex-col gap-1">
                        <span className="text-sm text-slate-300">Full Name</span>
                        <input
                            value={form.fullName}
                            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                            disabled={!editing}
                            className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-sm text-slate-300">Email</span>
                        <input
                            value={user.email || ''}
                            disabled
                            className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 text-slate-400"
                        />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-sm text-slate-300">Phone Number</span>
                        <input
                            value={form.phoneNumber}
                            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                            disabled={!editing}
                            className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-sm text-slate-300">New Password</span>
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Leave blank to keep current password"
                            type="password"
                            disabled={!editing}
                            className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        />
                    </label>
                </div>
            </section>

            {/* License Info */}
            <section className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 mb-6">
                <h2 className="text-lg font-semibold mb-4">License Info</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <span className="text-sm text-slate-300">License Number</span>
                        <p className="mt-1 text-white font-mono">{driverProfile?.licenseNumber || '—'}</p>
                    </div>
                    <div>
                        <span className="text-sm text-slate-300">License Category</span>
                        <p className="mt-1 text-white">{driverProfile?.licenseCategory || '—'}</p>
                    </div>
                    <div>
                        <span className="text-sm text-slate-300">Issuing Authority</span>
                        <p className="mt-1 text-white">{driverProfile?.issuingAuthority || '—'}</p>
                    </div>
                    <div>
                        <span className="text-sm text-slate-300">License Expiry</span>
                        <p className="mt-1 text-white">{driverProfile?.licenseExpiryDate ? new Date(driverProfile.licenseExpiryDate).toLocaleDateString() : '—'}</p>
                    </div>
                </div>
            </section>

            {/* Vehicle Info */}
            <section className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                <h2 className="text-lg font-semibold mb-4">Vehicle Info</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <span className="text-sm text-slate-300">Vehicle Plate</span>
                        <p className="mt-1 text-white font-mono">{driverProfile?.vehiclePlateNumber || '—'}</p>
                    </div>
                    <div>
                        <span className="text-sm text-slate-300">Vehicle Model</span>
                        <p className="mt-1 text-white">{driverProfile?.vehicleModel || '—'}</p>
                    </div>
                    <div>
                        <span className="text-sm text-slate-300">Vehicle Color</span>
                        <p className="mt-1 text-white">{driverProfile?.vehicleColor || '—'}</p>
                    </div>
                    <div>
                        <span className="text-sm text-slate-300">Registration Expiry</span>
                        <p className="mt-1 text-white">{driverProfile?.registrationExpiryDate ? new Date(driverProfile.registrationExpiryDate).toLocaleDateString() : '—'}</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
