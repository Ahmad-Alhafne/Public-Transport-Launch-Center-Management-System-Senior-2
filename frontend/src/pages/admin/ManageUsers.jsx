import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, getUser, register, updateUser, deleteUser } from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
        accountStatus: '',
        firstName: '',
        lastName: '',
        nationalIdNumber: '',
        gender: '',
        dateOfBirth: '',
        city: '',
        region: '',
        currentAddress: '',
        fatherName: '',
        motherName: '',
        birthPlace: '',
        cardNumber: '',
        cardIssueDate: '',
        faceColor: '',
        eyeColor: '',
        disabilityStatus: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [confirmingUpdate, setConfirmingUpdate] = useState(false);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);

    const [filters, setFilters] = useState({
        fullName: '',
        email: '',
        gender: '',
        nationalIdNumber: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchUsers = async () => {
        try {
            const { data } = await getUsers('Citizen');
            // Ensure we only display citizens (safety in case backend returns extra roles)
            setUsers((data || []).filter((u) => (u.role || '').toLowerCase() === 'citizen'));
        } catch {
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters, users]);


    const resetForm = () => {
        setForm({
            fullName: '',
            email: '',
            phoneNumber: '',
            password: '',
            accountStatus: '',
            firstName: '',
            lastName: '',
            nationalIdNumber: '',
            gender: '',
            dateOfBirth: '',
            city: '',
            region: '',
            currentAddress: '',
            fatherName: '',
            motherName: '',
            birthPlace: '',
            cardNumber: '',
            cardIssueDate: '',
            faceColor: '',
            eyeColor: '',
            disabilityStatus: '',
        });
        setEditId(null);
        setError('');
        setSuccess('');
    };

    const openNewUserForm = () => {
        resetForm();
        setShowForm(true);
    };

    const startEditUser = async (id) => {
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const { data } = await getUser(id);
            const formatDateForInput = (value) => {
                if (!value) return '';
                const date = new Date(value);
                if (Number.isNaN(date.getTime())) return '';
                return date.toISOString().slice(0, 10);
            };
            const normalizeOption = (value) => {
                if (!value) return '';
                const s = value.toString().trim();
                return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
            };

            setForm({
                fullName: data.fullName ?? '',
                email: data.email ?? '',
                phoneNumber: data.phoneNumber ?? '',
                password: '',
                accountStatus: normalizeOption(data.accountStatus),
                firstName: data.firstName ?? '',
                lastName: data.lastName ?? '',
                nationalIdNumber: data.nationalIdNumber ?? '',
                gender: normalizeOption(data.gender),
                dateOfBirth: formatDateForInput(data.dateOfBirth),
                city: data.city ?? '',
                region: data.region ?? '',
                currentAddress: data.currentAddress ?? '',
                fatherName: data.fatherName ?? '',
                motherName: data.motherName ?? '',
                birthPlace: data.birthPlace ?? '',
                cardNumber: data.cardNumber ?? '',
                cardIssueDate: formatDateForInput(data.cardIssueDate),
                faceColor: data.faceColor ?? '',
                eyeColor: data.eyeColor ?? '',
                disabilityStatus: normalizeOption(data.disabilityStatus),
            });
            setEditId(id);
            setShowForm(true);
        } catch (err) {
            setError(err.response?.data?.Detailed || err.response?.data || 'Failed to load user');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        // Only confirm when updating an existing user
        if (editId) {
            setConfirmingUpdate(true);
            return;
        }

        try {
            await register({
                fullName: form.fullName,
                email: form.email,
                phoneNumber: form.phoneNumber,
                password: form.password,
                role: 'Citizen',
                firstName: form.firstName,
                lastName: form.lastName,
                nationalIdNumber: form.nationalIdNumber,
                gender: form.gender,
                dateOfBirth: form.dateOfBirth,
                city: form.city,
                region: form.region,
                disabilityStatus: form.disabilityStatus,
                fatherName: form.fatherName,
                motherName: form.motherName,
                birthPlace: form.birthPlace,
                currentAddress: form.currentAddress,
                cardNumber: form.cardNumber,
                cardIssueDate: form.cardIssueDate,
                faceColor: form.faceColor,
                eyeColor: form.eyeColor,
            });
            setSuccess('User created successfully.');

            setShowForm(false);
            resetForm();
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.Detailed || err.response?.data || 'Save failed');
        }
    };

    const confirmUpdate = async () => {
        if (!editId) return;
        setConfirmingUpdate(false);
        setError('');
        setSuccess('');

        try {
            const payload = {
                fullName: form.fullName,
                email: form.email,
                phoneNumber: form.phoneNumber,
                accountStatus: form.accountStatus,
                firstName: form.firstName,
                lastName: form.lastName,
                nationalIdNumber: form.nationalIdNumber,
                gender: form.gender,
                dateOfBirth: form.dateOfBirth,
                city: form.city,
                region: form.region,
                disabilityStatus: form.disabilityStatus,
                fatherName: form.fatherName,
                motherName: form.motherName,
                birthPlace: form.birthPlace,
                currentAddress: form.currentAddress,
                cardNumber: form.cardNumber,
                cardIssueDate: form.cardIssueDate,
                faceColor: form.faceColor,
                eyeColor: form.eyeColor,
            };

            if (form.password) {
                payload.password = form.password;
            }

            await updateUser(editId, payload);
            setSuccess('User updated successfully.');
            setShowForm(false);
            resetForm();
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.Detailed || err.response?.data || 'Save failed');
        }
    };

    const navigate = useNavigate();

    const handleDelete = (id) => {
        setError('');
        setSuccess('');
        setConfirmingDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!confirmingDeleteId) return;

        try {
            await deleteUser(confirmingDeleteId);
            setSuccess('User deleted successfully.');
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.Detailed || err.response?.data || 'Delete failed');
        } finally {
            setConfirmingDeleteId(null);
        }
    };

    const filteredUsers = users.filter((user) => {
        const matchesFullName = filters.fullName
            ? (user.fullName || '').toLowerCase().includes(filters.fullName.toLowerCase())
            : true;
        const matchesEmail = filters.email
            ? (user.email || '').toLowerCase().includes(filters.email.toLowerCase())
            : true;
        const matchesGender = filters.gender
            ? (user.gender || '').toLowerCase().includes(filters.gender.toLowerCase())
            : true;
        const matchesNationalId = filters.nationalIdNumber
            ? (user.nationalIdNumber || '').toLowerCase().includes(filters.nationalIdNumber.toLowerCase())
            : true;

        return matchesFullName && matchesEmail && matchesGender && matchesNationalId;
    });

    const pageCount = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        const newPageCount = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
        if (currentPage > newPageCount) {
            setCurrentPage(newPageCount);
        }
    }, [currentPage, filteredUsers.length, itemsPerPage]);

    const handleShowDetails = (id) => {
        navigate(`/admin/users/${id}`);
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
                <h1 className="text-2xl font-bold">Manage Users</h1>
                <button
                    onClick={openNewUserForm}
                    className="px-4 py-2 bg-blue-600/80 hover:bg-blue-600 rounded-lg text-white text-sm"
                >
                    + New Citizen
                </button>
            </div>

            {showForm && (
                <div className="mb-6 p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                    <h2 className="text-lg font-semibold mb-4">{editId ? 'Edit Citizen' : 'Create Citizen'}</h2>
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="flex flex-col gap-1">
                                <span className="text-sm text-slate-300">Username</span>
                                <input
                                    value={form.fullName}
                                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-sm text-slate-300">Email</span>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="flex flex-col gap-1">
                                <span className="text-sm text-slate-300">Phone</span>
                                <input
                                    value={form.phoneNumber}
                                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-sm text-slate-300">Password {editId ? '(leave blank to keep)' : ''}</span>
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    placeholder={editId ? 'Leave empty to keep existing' : ''}
                                    required={!editId}
                                />
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="flex flex-col gap-1">
                                <span className="text-sm text-slate-300">Account status</span>
                                <select
                                    value={form.accountStatus}
                                    onChange={(e) => setForm({ ...form, accountStatus: e.target.value })}
                                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">-- Pick status --</option>
                                    <option value="Active">Active</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Suspended">Suspended</option>
                                </select>
                            </label>
                        </div>

                        <div className="border-t border-slate-700/50 pt-4">
                            <h3 className="text-sm font-semibold text-slate-200 mb-3">Personal details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="flex flex-col gap-1">
                                    <span className="text-sm text-slate-300">First name</span>
                                    <input
                                        value={form.firstName}
                                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                        className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    />
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="text-sm text-slate-300">Last name</span>
                                    <input
                                        value={form.lastName}
                                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                        className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    />
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <label className="flex flex-col gap-1">
                                    <span className="text-sm text-slate-300">National ID</span>
                                    <input
                                        value={form.nationalIdNumber}
                                        onChange={(e) => setForm({ ...form, nationalIdNumber: e.target.value })}
                                        className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    />
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="text-sm text-slate-300">Disability status</span>
                                    <select
                                        value={form.disabilityStatus}
                                        onChange={(e) => setForm({ ...form, disabilityStatus: e.target.value })}
                                        className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">-- Select disability status --</option>
                                        <option value="None">None</option>
                                        <option value="Wheelchair">Wheelchair</option>
                                        <option value="Blind">Blind</option>
                                        <option value="Deaf">Deaf</option>
                                    </select>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <label className="flex flex-col gap-1">
                                    <span className="text-sm text-slate-300">Gender</span>
                                    <select
                                        value={form.gender}
                                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                        className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">-- Pick gender --</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="text-sm text-slate-300">Date of birth</span>
                                    <input
                                        type="date"
                                        value={form.dateOfBirth}
                                        onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                                        className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="border-t border-slate-700/50 pt-4">
                            <h3 className="text-sm font-semibold text-slate-200 mb-3">Address information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="flex flex-col gap-1">
                                    <span className="text-sm text-slate-300">City</span>
                                    <input
                                        value={form.city}
                                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                                        className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    />
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="text-sm text-slate-300">Region</span>
                                    <input
                                        value={form.region}
                                        onChange={(e) => setForm({ ...form, region: e.target.value })}
                                        className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    />
                                </label>
                            </div>
                            <label className="flex flex-col gap-1 mt-4">
                                <span className="text-sm text-slate-300">Current address</span>
                                <input
                                    value={form.currentAddress}
                                    onChange={(e) => setForm({ ...form, currentAddress: e.target.value })}
                                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </label>
                        </div>

                        <div className="border-t border-slate-700/50 pt-4">
                            <h3 className="text-sm font-semibold text-slate-200 mb-3">Identity card details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="flex flex-col gap-1">
                                    <span className="text-sm text-slate-300">Father name</span>
                                    <input
                                        value={form.fatherName}
                                        onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
                                        className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    />
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="text-sm text-slate-300">Mother name</span>
                                    <input
                                        value={form.motherName}
                                        onChange={(e) => setForm({ ...form, motherName: e.target.value })}
                                        className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    />
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <label className="flex flex-col gap-1">
                                    <span className="text-sm text-slate-300">Birth place</span>
                                    <input
                                        value={form.birthPlace}
                                        onChange={(e) => setForm({ ...form, birthPlace: e.target.value })}
                                        className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    />
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="text-sm text-slate-300">Card number</span>
                                    <input
                                        value={form.cardNumber}
                                        onChange={(e) => setForm({ ...form, cardNumber: e.target.value })}
                                        className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    />
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <label className="flex flex-col gap-1">
                                    <span className="text-sm text-slate-300">Card issue date</span>
                                    <input
                                        type="date"
                                        value={form.cardIssueDate}
                                        onChange={(e) => setForm({ ...form, cardIssueDate: e.target.value })}
                                        className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    />
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="text-sm text-slate-300">Face color</span>
                                    <input
                                        value={form.faceColor}
                                        onChange={(e) => setForm({ ...form, faceColor: e.target.value })}
                                        className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    />
                                </label>
                            </div>

                            <label className="flex flex-col gap-1 mt-4">
                                <span className="text-sm text-slate-300">Eye color</span>
                                <input
                                    value={form.eyeColor}
                                    onChange={(e) => setForm({ ...form, eyeColor: e.target.value })}
                                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </label>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-emerald-600/80 hover:bg-emerald-600 rounded-lg text-white text-sm"
                            >
                                {editId ? 'Save Changes' : 'Create Citizen'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    resetForm();
                                }}
                                className="px-4 py-2 bg-slate-700/60 hover:bg-slate-700 rounded-lg text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

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

            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                    placeholder="Search by name"
                    value={filters.fullName}
                    onChange={(e) => setFilters({ ...filters, fullName: e.target.value })}
                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
                <input
                    placeholder="Search by email"
                    value={filters.email}
                    onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
                <input
                    placeholder="Search by gender"
                    value={filters.gender}
                    onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
                <input
                    placeholder="Search by national ID"
                    value={filters.nationalIdNumber}
                    onChange={(e) => setFilters({ ...filters, nationalIdNumber: e.target.value })}
                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="grid gap-4">
                {paginatedUsers.map((user) => (
                    <div
                        key={user.id}
                        className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h3 className="font-semibold text-lg">{user.fullName}</h3>
                                <p className="text-slate-400 text-sm">{user.email}</p>
                                {user.phoneNumber && (
                                    <p className="text-slate-400 text-sm">{user.phoneNumber}</p>
                                )}
                                <p className="text-slate-500 text-xs mt-1">
                                    Role: {user.role} • Status: {user.accountStatus || 'Unknown'}
                                </p>
                                {user.createdAt && (
                                    <p className="text-slate-500 text-xs mt-1">Created: {new Date(user.createdAt).toLocaleString()}</p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleShowDetails(user.id)}
                                    className="px-3 py-1.5 bg-slate-600/20 text-slate-200 rounded-lg text-sm hover:bg-slate-600/30 transition-colors"
                                >
                                    Show Details
                                </button>
                                <button
                                    onClick={() => startEditUser(user.id)}
                                    className="px-3 py-1.5 bg-blue-600/20 text-blue-300 rounded-lg text-sm hover:bg-blue-600/30 transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(user.id)}
                                    className="px-3 py-1.5 bg-red-600/20 text-red-400 rounded-lg text-sm hover:bg-red-600/30 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {filteredUsers.length === 0 && (
                    <p className="text-center text-slate-500 py-10">No users found.</p>
                )}
            </div>

            {pageCount > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 bg-slate-700/50 text-slate-200 rounded-lg text-sm hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                        Previous
                    </button>
                    {[...Array(pageCount)].map((_, index) => {
                        const page = index + 1;
                        return (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1.5 rounded-lg text-sm ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-200 hover:bg-slate-700'}`}
                            >
                                {page}
                            </button>
                        );
                    })}
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
                        disabled={currentPage === pageCount}
                        className="px-3 py-1.5 bg-slate-700/50 text-slate-200 rounded-lg text-sm hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}

            <ConfirmationModal
                open={confirmingUpdate}
                title="Confirm Update"
                message="Are you sure you want to update this user's information?"
                confirmText="Confirm Update"
                cancelText="Cancel"
                onConfirm={confirmUpdate}
                onCancel={() => setConfirmingUpdate(false)}
            />

            <ConfirmationModal
                open={Boolean(confirmingDeleteId)}
                title="Confirm Delete"
                message="Are you sure you want to delete this citizen? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                danger
                onConfirm={confirmDelete}
                onCancel={() => setConfirmingDeleteId(null)}
            />
        </div>
    );
}
