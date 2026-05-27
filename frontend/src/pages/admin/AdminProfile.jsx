import { useEffect, useState } from 'react';
import { getMyProfile, updateMyProfile } from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';

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
            setError('Failed to load profile');
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
            const { data } = await updateMyProfile({
                fullName: form.fullName,
                email: form.email,
                phoneNumber: form.phoneNumber,
                firstName: form.firstName,
                lastName: form.lastName,
                gender: form.gender,
                dateOfBirth: form.dateOfBirth,
                nationalIdNumber: form.nationalIdNumber,
                city: form.city,
                region: form.region,
                accountStatus: form.accountStatus,
                adminLevel: form.adminLevel,
            });
            setProfile(data);
            setEditing(false);
            setSuccess('Profile updated successfully.');
        } catch (err) {
            setError(err.response?.data?.Detailed || 'Update failed');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!profile) {
        return <div className="text-center py-10 text-red-400">Profile not found. Please contact support.</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">My Profile</h1>

            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
            {success && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">{success}</div>}

            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 mb-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Full Name</label>
                        <p className="text-white">{profile.fullName || '-'}</p>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Email</label>
                        <p className="text-white">{profile.email || '-'}</p>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Role</label>
                        <p className="text-white">{profile.role || '-'}</p>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Phone</label>
                        <p className="text-white">{profile.phoneNumber || '-'}</p>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">First name</label>
                        <p className="text-white">{profile.firstName || '-'}</p>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Last name</label>
                        <p className="text-white">{profile.lastName || '-'}</p>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Gender</label>
                        <p className="text-white">{profile.gender || '-'}</p>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Date of birth</label>
                        <p className="text-white">{formatDateForDisplay(profile.dateOfBirth)}</p>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">National ID</label>
                        <p className="text-white">{profile.nationalIdNumber || '-'}</p>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">City</label>
                        <p className="text-white">{profile.city || '-'}</p>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Region</label>
                        <p className="text-white">{profile.region || '-'}</p>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Account status</label>
                        <p className="text-white">{profile.accountStatus || '-'}</p>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Admin level</label>
                        <p className="text-white">{profile.adminLevel || '-'}</p>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Created</label>
                        <p className="text-white">{formatDateForDisplay(profile.accountCreationDate)}</p>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Last updated</label>
                        <p className="text-white">{formatDateForDisplay(profile.lastProfileUpdate)}</p>
                    </div>
                </div>
            </div>

            {!editing ? (
                <button
                    onClick={() => setEditing(true)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium transition-colors"
                >
                    Edit Profile
                </button>
            ) : (
                <form onSubmit={handleSubmit} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 grid gap-6">
                    <div>
                        <h2 className="text-lg font-semibold mb-3">Basic Information</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="flex flex-col gap-1">
                                <span className="text-sm text-slate-300">Full Name</span>
                                <input
                                    type="text"
                                    value={form.fullName || ''}
                                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </label>

                            <label className="flex flex-col gap-1">
                                <span className="text-sm text-slate-300">Email</span>
                                <input
                                    type="email"
                                    value={form.email || ''}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </label>

                            <label className="flex flex-col gap-1">
                                <span className="text-sm text-slate-300">Phone Number</span>
                                <input
                                    type="text"
                                    value={form.phoneNumber || ''}
                                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </label>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-3">Personal Information</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="flex flex-col gap-1">
                                <span className="text-sm text-slate-300">First Name</span>
                                <input
                                    type="text"
                                    value={form.firstName || ''}
                                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-sm text-slate-300">Last Name</span>
                                <input
                                    type="text"
                                    value={form.lastName || ''}
                                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </label>

                            <label className="flex flex-col gap-1">
                                <span className="text-sm text-slate-300">Gender</span>
                                <select
                                    value={form.gender || ''}
                                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">-- Pick gender --</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-sm text-slate-300">Date of Birth</span>
                                <input
                                    type="date"
                                    value={form.dateOfBirth || ''}
                                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </label>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-3">Location</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="flex flex-col gap-1">
                                <span className="text-sm text-slate-300">City</span>
                                <input
                                    type="text"
                                    value={form.city || ''}
                                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-sm text-slate-300">Region</span>
                                <input
                                    type="text"
                                    value={form.region || ''}
                                    onChange={(e) => setForm({ ...form, region: e.target.value })}
                                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </label>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-3">Admin Settings</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="flex flex-col gap-1">
                                <span className="text-sm text-slate-300">Account Status</span>
                                <select
                                    value={form.accountStatus || ''}
                                    onChange={(e) => setForm({ ...form, accountStatus: e.target.value })}
                                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">-- Pick status --</option>
                                    <option value="Active">Active</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Suspended">Suspended</option>
                                </select>
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-sm text-slate-300">Admin Level</span>
                                <select
                                    value={form.adminLevel || ''}
                                    onChange={(e) => setForm({ ...form, adminLevel: e.target.value })}
                                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">-- Pick level --</option>
                                    <option value="SuperAdmin">SuperAdmin</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </label>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm text-slate-400 mb-2">National ID Number</label>
                            <input
                                type="text"
                                value={form.nationalIdNumber || ''}
                                onChange={(e) => setForm({ ...form, nationalIdNumber: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-900/40 border border-slate-700/70 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                        <button type="submit" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium transition-colors">Save</button>
                        <button
                            type="button"
                            onClick={() => {
                                setEditing(false);
                                setForm({
                                    fullName: profile.fullName,
                                    email: profile.email,
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
                            className="px-6 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <ConfirmationModal
                open={confirmingUpdate}
                title="Confirm Update"
                message="Are you sure you want to update your profile information?"
                confirmText="Update Profile"
                cancelText="Cancel"
                onConfirm={confirmProfileUpdate}
                onCancel={() => setConfirmingUpdate(false)}
            />
        </div>
    );
}
