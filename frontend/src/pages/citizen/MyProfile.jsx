import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMyProfile, updateMyProfile } from '../../services/api';

export default function MyProfile() {
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
            setError(err.response?.data?.Detailed || err.response?.data || 'Failed to load profile');
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

            setSuccess('Profile updated successfully.');
            setEditing(false);
            setPassword('');

            // Keep auth context in sync (preserve token)
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
        fetchProfile();
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">My Profile</h1>
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
                            Save
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

            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex flex-col gap-1">
                        <span className="text-sm text-slate-300">Full Name</span>
                        <input
                            value={profile.fullName}
                            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                            className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                            disabled={!editing}
                        />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-sm text-slate-300">Email</span>
                        <input
                            value={profile.email}
                            disabled
                            className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 text-slate-400"
                        />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-sm text-slate-300">Phone Number</span>
                        <input
                            value={profile.phoneNumber}
                            onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                            className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                            disabled={!editing}
                        />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-sm text-slate-300">New Password</span>
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Leave blank to keep current password"
                            type="password"
                            className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                            disabled={!editing}
                        />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-sm text-slate-300">Disability Status</span>
                        <select
                            value={profile.disabilityStatus}
                            onChange={(e) => setProfile({ ...profile, disabilityStatus: e.target.value })}
                            disabled={!editing}
                            className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">-- Select status --</option>
                            <option value="None">None</option>
                            <option value="Wheelchair">Wheelchair</option>
                            <option value="Blind">Blind</option>
                            <option value="Deaf">Deaf</option>
                        </select>
                    </label>
                    <label className="flex flex-col gap-1 md:col-span-2">
                        <span className="text-sm text-slate-300">Current Address</span>
                        <input
                            value={profile.currentAddress}
                            onChange={(e) => setProfile({ ...profile, currentAddress: e.target.value })}
                            className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                            disabled={!editing}
                        />
                    </label>
                </div>
            </div>
        </div>
    );
}
