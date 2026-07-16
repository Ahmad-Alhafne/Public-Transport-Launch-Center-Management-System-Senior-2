import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, getUser, register, updateUser, deleteUser } from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useTranslation } from 'react-i18next';

export default function ManageUsers() {
    const { t } = useTranslation();
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

    const normalizeRoleKey = (role) => {
        if (!role) return '';
        return String(role).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    };

    const translateAccountStatus = (status) => {
        if (!status) return 'Unknown';
        return t(`profile.status${status.charAt(0).toUpperCase()}${status.slice(1).toLowerCase()}`, status);
    };
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchUsers = async () => {
        try {
            const { data } = await getUsers('Citizen');
            // Ensure we only display citizens (safety in case backend returns extra roles)
            setUsers((data || []).filter((u) => (u.role || '').toLowerCase() === 'citizen'));
        } catch {
            setError(t('generated.pages_admin_ManageUsers_jsx_20_75f4b98b'));
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
            setError(err.response?.data?.Detailed || err.response?.data || t('generated.pages_admin_ManageUsers_load_failed'));
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
                dateOfBirth: form.dateOfBirth || null,
                city: form.city,
                region: form.region,
                disabilityStatus: form.disabilityStatus,
                fatherName: form.fatherName,
                motherName: form.motherName,
                birthPlace: form.birthPlace,
                currentAddress: form.currentAddress,
                cardNumber: form.cardNumber,
                cardIssueDate: form.cardIssueDate || null,
                faceColor: form.faceColor,
                eyeColor: form.eyeColor,
            });
            setSuccess(t('generated.pages_admin_ManageUsers_jsx_68_d8f3a109'));

            setShowForm(false);
            resetForm();
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.Detailed || err.response?.data || t('generated.pages_admin_ManageUsers_jsx_111_a271bdfb'));
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
                dateOfBirth: form.dateOfBirth || null,
                city: form.city,
                region: form.region,
                disabilityStatus: form.disabilityStatus,
                fatherName: form.fatherName,
                motherName: form.motherName,
                birthPlace: form.birthPlace,
                currentAddress: form.currentAddress,
                cardNumber: form.cardNumber,
                cardIssueDate: form.cardIssueDate || null,
                faceColor: form.faceColor,
                eyeColor: form.eyeColor,
            };

            if (form.password) {
                payload.password = form.password;
            }

            await updateUser(editId, payload);
            setSuccess(t('generated.pages_admin_ManageUsers_jsx_99_87ad1f4b'));
            setShowForm(false);
            resetForm();
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.Detailed || err.response?.data || t('generated.pages_admin_ManageUsers_jsx_111_a271bdfb'));
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
            setSuccess(t('generated.pages_admin_ManageUsers_jsx_127_8d9d0c21'));
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.Detailed || err.response?.data || t('generated.pages_admin_ManageUsers_jsx_184_f2be12b1'));
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--forest)' }}></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1  className="text-3xl font-bold tracking-tight" style={{ color: 'var(--charcoal)',margin:'20px 0' }}>
                        {t('generated.pages_admin_ManageUsers_jsx_307_751f7d62')}
                    </h1>
                </div>
                <button
                    onClick={openNewUserForm}
                    className="primary-button px-5 py-2.5 font-medium text-sm shadow-sm transition-all duration-200"
                    style={{ borderRadius: 'var(--radius-sm)' }}
                >
                    {`${t('generated.pages_admin_ManageUsers_jsx_148_41034fb5')}`}
                </button>
            </div>

            {/* Form Section */}
            {showForm && (
                <div className="card mb-8 p-6 transition-all duration-300" style={{ backgroundColor: 'var(--surface)', borderColor: 'rgba(66, 129, 119, 0.12)' }}>
                    <h2 className="text-xl font-bold mb-6 pb-2 border-b" style={{ color: 'var(--forest-dark)', borderColor: 'rgba(66, 129, 119, 0.08)' }}>
                        {editId ? t('generated.pages_admin_ManageUsers_jsx_152_9b0d4e3e') : t('generated.pages_admin_ManageUsers_jsx_153_6a1b7c2f')}
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Account Credentials Group */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--wheat-dark)' }}>
                                {t('generated.pages_admin_ManageUsers_jsx_316_7e1f3c9b')}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="flex flex-col gap-1.5">
                                    <span className="form-label !mb-0">{t('generated.pages_admin_ManageUsers_jsx_322_84c29015')}</span>
                                    <input
                                        value={form.fullName}
                                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </label>
                                <label className="flex flex-col gap-1.5">
                                    <span className="form-label !mb-0">{t('generated.pages_admin_ManageUsers_jsx_331_84add5b2')}</span>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="flex flex-col gap-1.5">
                                    <span className="form-label !mb-0">{t('generated.pages_admin_ManageUsers_jsx_344_77064d52')}</span>
                                    <input
                                        value={form.phoneNumber}
                                        onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                                        className="input-field"
                                    />
                                </label>
                                <label className="flex flex-col gap-1.5">
                                    <span className="form-label !mb-0">{editId ? t('generated.pages_admin_ManageUsers_jsx_168_a47f33c5') : t('generated.pages_admin_ManageUsers_jsx_169_8fc5b72d')}</span>
                                    <input
                                        type="password"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        className="input-field"
                                        placeholder={editId ? t('generated.pages_admin_ManageUsers_jsx_174_c93a3e57') : ''}
                                        required={!editId}
                                    />
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="flex flex-col gap-1.5">
                                    <span className="form-label !mb-0">{t('generated.pages_admin_ManageUsers_jsx_366_8dd86c6d')}</span>
                                    <select
                                        value={form.accountStatus}
                                        onChange={(e) => setForm({ ...form, accountStatus: e.target.value })}
                                        className="input-field"
                                    >
                                        <option value="">{t('generated.pages_admin_ManageUsers_jsx_372_a34f61eb')}</option>
                                        <option value="Active">{t('generated.pages_admin_ManageUsers_jsx_373_a733b809')}</option>
                                        <option value="Pending">{t('generated.pages_admin_ManageUsers_jsx_374_96f608c1')}</option>
                                        <option value="Suspended">{t('generated.pages_admin_ManageUsers_jsx_375_794696a7')}</option>
                                    </select>
                                </label>
                            </div>
                        </div>

                        {/* Personal Identification Group */}
                        <div className="pt-4 border-t" style={{ borderColor: 'rgba(66, 129, 119, 0.08)' }}>
                            <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--wheat-dark)' }}>
                                {t('generated.pages_admin_ManageUsers_jsx_381_58a927b3')}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="flex flex-col gap-1.5">
                                    <span className="form-label !mb-0">{t('generated.pages_admin_ManageUsers_jsx_384_7e568a90')}</span>
                                    <input
                                        value={form.firstName}
                                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                        className="input-field"
                                    />
                                </label>
                                <label className="flex flex-col gap-1.5">
                                    <span className="form-label !mb-0">{t('generated.pages_admin_ManageUsers_jsx_392_adec36a8')}</span>
                                    <input
                                        value={form.lastName}
                                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                        className="input-field"
                                    />
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <label className="flex flex-col gap-1.5">
                                    <span className="form-label !mb-0">{t('generated.pages_admin_ManageUsers_jsx_403_ceb78132')}</span>
                                    <input
                                        value={form.nationalIdNumber}
                                        onChange={(e) => setForm({ ...form, nationalIdNumber: e.target.value })}
                                        className="input-field"
                                    />
                                </label>
                                <label className="flex flex-col gap-1.5">
                                    <span className="form-label !mb-0">{t('generated.pages_admin_ManageUsers_jsx_411_6981b77f')}</span>
                                    <select
                                        value={form.disabilityStatus}
                                        onChange={(e) => setForm({ ...form, disabilityStatus: e.target.value })}
                                        className="input-field"
                                    >
                                        <option value="">{t('generated.pages_admin_ManageUsers_jsx_417_e428a2e1')}</option>
                                        <option value="None">{t('generated.pages_admin_ManageUsers_jsx_418_6eef6648')}</option>
                                        <option value="Wheelchair">{t('generated.pages_admin_ManageUsers_jsx_419_6d2c3896')}</option>
                                        <option value="Blind">{t('generated.pages_admin_ManageUsers_jsx_420_dff70db3')}</option>
                                        <option value="Deaf">{t('generated.pages_admin_ManageUsers_jsx_421_185c6f18')}</option>
                                    </select>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <label className="flex flex-col gap-1.5">
                                    <span className="form-label !mb-0">{t('generated.pages_admin_ManageUsers_jsx_428_8a754c61')}</span>
                                    <select
                                        value={form.gender}
                                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                        className="input-field"
                                    >
                                        <option value="">{t('generated.pages_admin_ManageUsers_jsx_434_17b1e3cb')}</option>
                                        <option value="Male">{t('generated.pages_admin_ManageUsers_jsx_435_3f3a489c')}</option>
                                        <option value="Female">{t('generated.pages_admin_ManageUsers_jsx_436_b7c17e97')}</option>
                                    </select>
                                </label>
                                <label className="flex flex-col gap-1.5">
                                    <span className="form-label !mb-0">{t('generated.pages_admin_ManageUsers_jsx_440_9518425f')}</span>
                                    <input
                                        type="date"
                                        value={form.dateOfBirth}
                                        onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                                        className="input-field"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Location Details Group */}
                        <div className="pt-4 border-t" style={{ borderColor: 'rgba(66, 129, 119, 0.08)' }}>
                            <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--wheat-dark)' }}>
                                {t('generated.pages_admin_ManageUsers_jsx_452_155a5399')}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="flex flex-col gap-1.5">
                                    <span className="form-label !mb-0">{t('generated.pages_admin_ManageUsers_jsx_455_4271627f')}</span>
                                    <input
                                        value={form.city}
                                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                                        className="input-field"
                                    />
                                </label>
                                <label className="flex flex-col gap-1.5">
                                    <span className="form-label !mb-0">{t('generated.pages_admin_ManageUsers_jsx_463_0f217179')}</span>
                                    <input
                                        value={form.region}
                                        onChange={(e) => setForm({ ...form, region: e.target.value })}
                                        className="input-field"
                                    />
                                </label>
                            </div>
                            <label className="flex flex-col gap-1.5 mt-4">
                                <span className="form-label !mb-0">{t('generated.pages_admin_ManageUsers_jsx_472_1ac15fb7')}</span>
                                <input
                                    value={form.currentAddress}
                                    onChange={(e) => setForm({ ...form, currentAddress: e.target.value })}
                                    className="input-field"
                                />
                            </label>
                        </div>

                        {/* Extended Profile Group */}
                        <div className="pt-4 border-t" style={{ borderColor: 'rgba(66, 129, 119, 0.08)' }}>
                            <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--wheat-dark)' }}>
                                {t('generated.pages_admin_ManageUsers_jsx_482_9180f574')}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="flex flex-col gap-1.5">
                                    <span className="form-label !mb-0">{t('generated.pages_admin_ManageUsers_jsx_485_de100eb7')}</span>
                                    <input
                                        value={form.fatherName}
                                        onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
                                        className="input-field"
                                    />
                                </label>
                                <label className="flex flex-col gap-1.5">
                                    <span className="form-label !mb-0">{t('generated.pages_admin_ManageUsers_jsx_493_ef5f3fd0')}</span>
                                    <input
                                        value={form.motherName}
                                        onChange={(e) => setForm({ ...form, motherName: e.target.value })}
                                        className="input-field"
                                    />
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <label className="flex flex-col gap-1.5">
                                    <span className="form-label !mb-0">{t('generated.pages_admin_ManageUsers_jsx_504_f1756ba6')}</span>
                                    <input
                                        value={form.birthPlace}
                                        onChange={(e) => setForm({ ...form, birthPlace: e.target.value })}
                                        className="input-field"
                                    />
                                </label>
                                <label className="flex flex-col gap-1.5">
                                    <span className="form-label !mb-0">{t('generated.pages_admin_ManageUsers_jsx_512_6747e707')}</span>
                                    <input
                                        value={form.cardNumber}
                                        onChange={(e) => setForm({ ...form, cardNumber: e.target.value })}
                                        className="input-field"
                                    />
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <label className="flex flex-col gap-1.5">
                                    <span className="form-label !mb-0">{t('generated.pages_admin_ManageUsers_jsx_523_522e64f9')}</span>
                                    <input
                                        type="date"
                                        value={form.cardIssueDate}
                                        onChange={(e) => setForm({ ...form, cardIssueDate: e.target.value })}
                                        className="input-field"
                                    />
                                </label>
                                <label className="flex flex-col gap-1.5">
                                    <span className="form-label !mb-0">{t('generated.pages_admin_ManageUsers_jsx_532_58f37476')}</span>
                                    <input
                                        value={form.faceColor}
                                        onChange={(e) => setForm({ ...form, faceColor: e.target.value })}
                                        className="input-field"
                                    />
                                </label>
                            </div>

                            <label className="flex flex-col gap-1.5 mt-4">
                                <span className="form-label !mb-0">{t('generated.pages_admin_ManageUsers_jsx_542_5e62989f')}</span>
                                <input
                                    value={form.eyeColor}
                                    onChange={(e) => setForm({ ...form, eyeColor: e.target.value })}
                                    className="input-field"
                                />
                            </label>
                        </div>

                        {/* Action Triggers */}
                        <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: 'rgba(66, 129, 119, 0.08)' }}>
                            <button
                                type="submit"
                                className="primary-button px-5 py-2 text-sm font-semibold shadow-sm"
                                style={{ borderRadius: 'var(--radius-sm)' }}
                            >
                                {editId ? t('common.saveChanges') : t('common.saveChanges')}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    resetForm();
                                }}
                                className="danger-button px-5 py-2 text-sm font-semibold"
                                style={{ borderRadius: 'var(--radius-sm)' }}
                            >
                                {t('common.cancel')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Notifications System */}
            {error && (
                <div className="alert alert-error mb-4 text-sm font-medium shadow-sm">
                    {error}
                </div>
            )}
            {success && (
                <div className="alert alert-success mb-4 text-sm font-medium shadow-sm">
                    {success}
                </div>
            )}

            {/* Filter Hub Dashboard */}
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-2xl border" style={{ backgroundColor: 'var(--surface-muted)', borderColor: 'rgba(66, 129, 119, 0.08)' }}>
                <input
                    placeholder={t('generated.pages_admin_ManageUsers_jsx_586_28abc031')}
                    value={filters.fullName}
                    onChange={(e) => setFilters({ ...filters, fullName: e.target.value })}
                    className="input-field !bg-white"
                />
                <input
                    placeholder={t('generated.pages_admin_ManageUsers_jsx_592_22a02aca')}
                    value={filters.email}
                    onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                    className="input-field !bg-white"
                />
                <input
                    placeholder={t('generated.pages_admin_ManageUsers_jsx_598_04bffbff')}
                    value={filters.gender}
                    onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                    className="input-field !bg-white"
                />
                <input
                    placeholder={t('generated.pages_admin_ManageUsers_jsx_604_a1c1aac7')}
                    value={filters.nationalIdNumber}
                    onChange={(e) => setFilters({ ...filters, nationalIdNumber: e.target.value })}
                    className="input-field !bg-white"
                />
            </div>

            {/* User Cards Responsive Stack Grid */}
            <div className="grid gap-4">
                {paginatedUsers.map((user) => (
                    <div
                        key={user.id}
                        className="card p-5 transition-all duration-200"
                        style={{ 
                            backgroundColor: 'var(--surface)', 
                            borderColor: 'rgba(66, 129, 119, 0.08)',
                            borderRadius: 'var(--radius)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(66, 129, 119, 0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(66, 129, 119, 0.08)'}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="space-y-1">
                                <h3 className="font-bold text-lg" style={{ color: 'var(--charcoal)' }}>{user.fullName}</h3>
                                <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                                {user.phoneNumber && (
                                    <p className="text-sm" style={{ color: 'var(--charcoal-medium)' }}>{user.phoneNumber}</p>
                                )}
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--wheat-light)', color: 'var(--charcoal-medium)' }}>
                                        {t('profile.role')}: {user.role ? t(`roles.${normalizeRoleKey(user.role)}`, user.role) : '-'}
                                    </span>
                                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" 
                                        style={{ 
                                            backgroundColor: user.accountStatus === 'Active' ? 'rgba(66, 129, 119, 0.12)' : 'rgba(107, 31, 42, 0.08)', 
                                            color: user.accountStatus === 'Active' ? 'var(--forest-dark)' : 'var(--umber)' 
                                        }}
                                    >
                                        {translateAccountStatus(user.accountStatus)}
                                    </span>
                                </div>
                                {user.createdAt && (
                                    <p className="text-xs mt-2" style={{ color: 'var(--wheat-dark)' }}>{t('profile.createdAt')}: {new Date(user.createdAt).toLocaleString()}</p>
                                )}
                            </div>
                            
                            {/* Actions Group Buttons */}
                            <div className="flex flex-wrap gap-2 sm:self-center">
                                <button
                                    onClick={() => handleShowDetails(user.id)}
                                    className="outline-button px-3.5 py-1.5 text-sm font-medium"
                                    style={{ borderRadius: 'var(--radius-sm)' }}
                                >
                                    {t('common.showDetails')}
                                </button>
                                <button
                                    onClick={() => startEditUser(user.id)}
                                    className="px-3.5 py-1.5 text-sm font-medium transition-colors"
                                    style={{ 
                                        backgroundColor: 'rgba(66, 129, 119, 0.12)', 
                                        color: 'var(--forest-dark)',
                                        borderRadius: 'var(--radius-sm)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(66, 129, 119, 0.2)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(66, 129, 119, 0.12)'}
                                >
                                    {t('common.edit')}
                                </button>
                                <button
                                    onClick={() => handleDelete(user.id)}
                                    className="px-3.5 py-1.5 text-sm font-medium transition-colors"
                                    style={{ 
                                        backgroundColor: 'rgba(107, 31, 42, 0.08)', 
                                        color: 'var(--umber)',
                                        borderRadius: 'var(--radius-sm)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(107, 31, 42, 0.14)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(107, 31, 42, 0.08)'}
                                >
                                    {t('common.delete')}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                
                {filteredUsers.length === 0 && (
                    <div className="text-center py-12 card" style={{ backgroundColor: 'var(--surface)' }}>
                        <p className="text-base font-medium" style={{ color: 'var(--charcoal-medium)' }}>
                            {t('generated.pages_admin_ManageUsers_jsx_655_e611ef57')}
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination Panel Controller */}
            {pageCount > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-8">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3.5 py-1.5 font-medium rounded-lg text-sm transition-all duration-200 disabled:opacity-40"
                        style={{ backgroundColor: 'var(--surface-muted)', color: 'var(--charcoal-medium)' }}
                    >
                        {t('common.previous')}
                    </button>
                    {[...Array(pageCount)].map((_, index) => {
                        const page = index + 1;
                        return (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                                style={currentPage === page ? {
                                    backgroundColor: 'var(--forest)',
                                    color: 'var(--surface)',
                                    boxShadow: '0 4px 12px rgba(66, 129, 119, 0.15)'
                                } : {
                                    backgroundColor: 'var(--surface-muted)',
                                    color: 'var(--charcoal-medium)'
                                }}
                            >
                                {page}
                            </button>
                        );
                    })}
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
                        disabled={currentPage === pageCount}
                        className="px-3.5 py-1.5 font-medium rounded-lg text-sm transition-all duration-200 disabled:opacity-40"
                        style={{ backgroundColor: 'var(--surface-muted)', color: 'var(--charcoal-medium)' }}
                    >
                        {t('common.next')}
                    </button>
                </div>
            )}

            <ConfirmationModal
                open={confirmingUpdate}
                title={t('generated.pages_admin_ManageUsers_jsx_692_2a8cbde5')}
                message={t('generated.pages_admin_ManageUsers_confirmUpdateMessage')}
                confirmText={t('common.update')}
                cancelText={t('common.cancel')}
                onConfirm={confirmUpdate}
                onCancel={() => setConfirmingUpdate(false)}
            />

            <ConfirmationModal
                open={Boolean(confirmingDeleteId)}
                title={t('generated.pages_admin_ManageUsers_jsx_702_59e5bdd4')}
                message={t('generated.pages_admin_ManageUsers_confirmDeleteMessage')}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                danger
                onConfirm={confirmDelete}
                onCancel={() => setConfirmingDeleteId(null)}
            />
        </div>
    );
}