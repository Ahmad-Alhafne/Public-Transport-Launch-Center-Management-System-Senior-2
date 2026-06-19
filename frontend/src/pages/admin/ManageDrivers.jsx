import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getDrivers, getDriverProfile, createDriver, updateDriver, deleteDriver } from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function ManageDrivers() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
        // Driver profile fields
        licenseNumber: '',
        licenseExpiryDate: '',
        licenseCategory: '',
        issuingAuthority: '',
        vehiclePlateNumber: '',
        vehicleModel: '',
        vehicleColor: '',
        registrationExpiryDate: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [confirmingUpdate, setConfirmingUpdate] = useState(false);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);

    const [filters, setFilters] = useState({
        fullName: '',
        email: '',
        vehiclePlateNumber: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const handleShowDetails = (id) => {
        navigate(`/admin/drivers/${id}`);
    };

    const fetchDrivers = async () => {
        try {
            const { data } = await getDrivers();
            setDrivers(data);
        } catch {
            setError(t('admin.drivers.loadFailed'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDrivers(); }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters, drivers]);

    const resetForm = () => {
        setEditId(null);
        setForm({
            fullName: '',
            email: '',
            phoneNumber: '',
            password: '',
            licenseNumber: '',
            licenseExpiryDate: '',
            licenseCategory: '',
            issuingAuthority: '',
            vehiclePlateNumber: '',
            vehicleModel: '',
            vehicleColor: '',
            registrationExpiryDate: '',
        });
    };

    const buildPayload = () => ({
        fullName: form.fullName,
        phoneNumber: form.phoneNumber || null,
        licenseNumber: form.licenseNumber || null,
        licenseExpiryDate: form.licenseExpiryDate || null,
        licenseCategory: form.licenseCategory || null,
        issuingAuthority: form.issuingAuthority || null,
        vehiclePlateNumber: form.vehiclePlateNumber || null,
        vehicleModel: form.vehicleModel || null,
        vehicleColor: form.vehicleColor || null,
        registrationExpiryDate: form.registrationExpiryDate || null,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (editId) {
            setConfirmingUpdate(true);
            return;
        }

        try {
            const payload = buildPayload();
            await createDriver({
                ...payload,
                email: form.email,
                password: form.password
            });
            setSuccess(t('admin.drivers.createSuccess'));
            setShowForm(false);
            resetForm();
            fetchDrivers();
        } catch (err) {
            setError(err.response?.data?.Detailed || err.response?.data || t('common.operationFailed'));
        }
    };

    const confirmUpdate = async () => {
        if (!editId) return;
        setConfirmingUpdate(false);
        setError('');
        setSuccess('');

        try {
            const payload = buildPayload();
            await updateDriver(editId, payload);
            setSuccess(t('admin.drivers.updateSuccess'));
            setShowForm(false);
            resetForm();
            fetchDrivers();
        } catch (err) {
            setError(err.response?.data?.Detailed || err.response?.data || t('common.operationFailed'));
        }
    };

    const handleEdit = async (driver) => {
        setError('');
        setSuccess('');
        setEditId(driver.id);

        let profile = {
            licenseNumber: '',
            licenseExpiryDate: '',
            licenseCategory: '',
            issuingAuthority: '',
            vehiclePlateNumber: '',
            vehicleModel: '',
            vehicleColor: '',
            registrationExpiryDate: ''
        };

        try {
            const { data } = await getDriverProfile(driver.id);
            profile = {
                licenseNumber: data.licenseNumber || '',
                licenseExpiryDate: data.licenseExpiryDate ? new Date(data.licenseExpiryDate).toISOString().slice(0, 10) : '',
                licenseCategory: data.licenseCategory || '',
                issuingAuthority: data.issuingAuthority || '',
                vehiclePlateNumber: data.vehiclePlateNumber || '',
                vehicleModel: data.vehicleModel || '',
                vehicleColor: data.vehicleColor || '',
                registrationExpiryDate: data.registrationExpiryDate ? new Date(data.registrationExpiryDate).toISOString().slice(0, 10) : ''
            };
        } catch (err) {
            // If profile doesn't exist yet, we still allow the admin to edit the user basic info.
            // The form will keep empty profile fields.
        }

        setForm({
            fullName: driver.fullName,
            email: driver.email,
            phoneNumber: driver.phoneNumber || '',
            password: '',
            ...profile
        });

        setShowForm(true);
    };

    const handleDelete = (id) => {
        setError('');
        setSuccess('');
        setConfirmingDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!confirmingDeleteId) return;
        const id = confirmingDeleteId;
        setConfirmingDeleteId(null);
        setError('');
        setSuccess('');

        try {
            await deleteDriver(id);
            setSuccess(t('admin.drivers.deleteSuccess'));
            fetchDrivers();
        } catch (err) {
            setError(err.response?.data?.Detailed || err.response?.data || t('common.deleteFailed'));
        }
    };

    const filteredDrivers = drivers.filter((driver) => {
        const matchesName = filters.fullName
            ? (driver.fullName || '').toLowerCase().includes(filters.fullName.toLowerCase())
            : true;
        const matchesEmail = filters.email
            ? (driver.email || '').toLowerCase().includes(filters.email.toLowerCase())
            : true;
        const matchesPlate = filters.vehiclePlateNumber
            ? (driver.vehiclePlateNumber || '').toLowerCase().includes(filters.vehiclePlateNumber.toLowerCase())
            : true;

        return matchesName && matchesEmail && matchesPlate;
    });

    const pageCount = Math.max(1, Math.ceil(filteredDrivers.length / itemsPerPage));
    const paginatedDrivers = filteredDrivers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        const newPageCount = Math.max(1, Math.ceil(filteredDrivers.length / itemsPerPage));
        if (currentPage > newPageCount) {
            setCurrentPage(newPageCount);
        }
    }, [currentPage, filteredDrivers.length, itemsPerPage]);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--forest)' }}></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            {/* Header Area Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--charcoal)' }}>
                        {t('admin.drivers.title')}
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        {t('generated.pages_admin_ManageDriversDetails_jsx_71_a98a97b10')}
                    </p>
                </div>
                <button
                    onClick={() => {
                        if (showForm) {
                            resetForm();
                        }
                        setShowForm(!showForm);
                    }}
                    className={showForm ? "danger-button px-5 py-2.5 font-medium text-sm shadow-sm transition-all duration-200" : "primary-button px-5 py-2.5 font-medium text-sm shadow-sm transition-all duration-200"}
                    style={{ borderRadius: 'var(--radius-sm)' }}
                >
                    {showForm ? t('common.cancel') : `+ ${t('admin.drivers.newDriver')}`}
                </button>
            </div>

            {/* Alert Logs Hub */}
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

            {/* Hub Filters Interactive Panel */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl border" style={{ backgroundColor: 'var(--surface-muted)', borderColor: 'rgba(66, 129, 119, 0.08)' }}>
                <input
                    placeholder={t('admin.drivers.searchName')}
                    value={filters.fullName}
                    onChange={(e) => setFilters({ ...filters, fullName: e.target.value })}
                    className="input-field !bg-white"
                />
                <input
                    placeholder={t('admin.drivers.searchEmail')}
                    value={filters.email}
                    onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                    className="input-field !bg-white"
                />
                <input
                    placeholder={t('admin.drivers.searchPlate')}
                    value={filters.vehiclePlateNumber}
                    onChange={(e) => setFilters({ ...filters, vehiclePlateNumber: e.target.value })}
                    className="input-field !bg-white"
                />
            </div>

            {/* Modals Gateway */}
            <ConfirmationModal
                open={confirmingUpdate}
                title={t('admin.drivers.confirmUpdateTitle')}
                message={t('admin.drivers.confirmUpdateMessage')}
                confirmText={t('common.update')}
                cancelText={t('common.cancel')}
                onConfirm={confirmUpdate}
                onCancel={() => setConfirmingUpdate(false)}
            />
            <ConfirmationModal
                open={!!confirmingDeleteId}
                title={t('admin.drivers.confirmDeleteTitle')}
                message={t('admin.drivers.confirmDeleteMessage')}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                danger
                onConfirm={confirmDelete}
                onCancel={() => setConfirmingDeleteId(null)}
            />

            {/* Form Section Dropdown Panel */}
            {showForm && (
                <div className="card mb-8 p-6 transition-all duration-300" style={{ backgroundColor: 'var(--surface)', borderColor: 'rgba(66, 129, 119, 0.12)' }}>
                    <h2 className="text-xl font-bold mb-6 pb-2 border-b" style={{ color: 'var(--forest-dark)', borderColor: 'rgba(66, 129, 119, 0.08)' }}>
                        {editId ? t('admin.drivers.updateDriver') : t('admin.drivers.createDriver')}
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <label className="flex flex-col gap-1.5">
                            <span className="form-label !mb-0">{t('admin.drivers.username')}</span>
                            <input
                                placeholder={t('admin.drivers.username')}
                                value={form.fullName}
                                onChange={e => setForm({ ...form, fullName: e.target.value })}
                                required
                                className="input-field"
                            />
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className="form-label !mb-0">{t('auth.email')}</span>
                            <input
                                placeholder={t('auth.email')}
                                type="email"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                required={!editId}
                                disabled={!!editId}
                                className="input-field disabled:opacity-60"
                            />
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className="form-label !mb-0">{t('admin.drivers.phoneNumber')}</span>
                            <input
                                placeholder={t('admin.drivers.phoneNumber')}
                                value={form.phoneNumber}
                                onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                                className="input-field"
                            />
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className="form-label !mb-0">{t('admin.drivers.licenseNumber')}</span>
                            <input
                                placeholder={t('admin.drivers.licenseNumber')}
                                value={form.licenseNumber}
                                onChange={e => setForm({ ...form, licenseNumber: e.target.value })}
                                className="input-field"
                            />
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className="form-label !mb-0">{t('admin.drivers.issuingAuthority')}</span>
                            <input
                                placeholder={t('admin.drivers.issuingAuthority')}
                                value={form.issuingAuthority}
                                onChange={e => setForm({ ...form, issuingAuthority: e.target.value })}
                                className="input-field"
                            />
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className="form-label !mb-0">{t('admin.drivers.vehiclePlateNumber')}</span>
                            <input
                                placeholder={t('admin.drivers.vehiclePlateNumber')}
                                value={form.vehiclePlateNumber}
                                onChange={e => setForm({ ...form, vehiclePlateNumber: e.target.value })}
                                className="input-field"
                            />
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className="form-label !mb-0">{t('admin.drivers.vehicleModel')}</span>
                            <input
                                placeholder={t('admin.drivers.vehicleModel')}
                                value={form.vehicleModel}
                                onChange={e => setForm({ ...form, vehicleModel: e.target.value })}
                                className="input-field"
                            />
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className="form-label !mb-0">{t('admin.drivers.vehicleColor')}</span>
                            <input
                                placeholder={t('admin.drivers.vehicleColor')}
                                value={form.vehicleColor}
                                onChange={e => setForm({ ...form, vehicleColor: e.target.value })}
                                className="input-field"
                            />
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className="form-label !mb-0" style={{ color: 'var(--wheat-dark)' }}>{t('admin.drivers.licenseExpiryDate')}</span>
                            <input
                                type="date"
                                value={form.licenseExpiryDate}
                                onChange={e => setForm({ ...form, licenseExpiryDate: e.target.value })}
                                className="input-field"
                            />
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className="form-label !mb-0" style={{ color: 'var(--wheat-dark)' }}>{t('admin.drivers.registrationExpiryDate')}</span>
                            <input
                                type="date"
                                value={form.registrationExpiryDate}
                                onChange={e => setForm({ ...form, registrationExpiryDate: e.target.value })}
                                className="input-field"
                            />
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className="form-label !mb-0">{t('admin.drivers.licenseCategory')}</span>
                            <select
                                value={form.licenseCategory}
                                onChange={e => setForm({ ...form, licenseCategory: e.target.value })}
                                className="input-field"
                            >
                                <option value="">{t('admin.drivers.licenseCategory')}</option>
                                <option value="Motorcycle">{t('admin.drivers.motorcycle')}</option>
                                <option value="Car">{t('admin.drivers.car')}</option>
                                <option value="Truck">{t('admin.drivers.truck')}</option>
                                <option value="Bus">{t('admin.drivers.bus')}</option>
                            </select>
                        </label>

                        {!editId && (
                            <label className="flex flex-col gap-1.5">
                                <span className="form-label !mb-0">{t('admin.drivers.initialPassword')}</span>
                                <input
                                    placeholder={t('admin.drivers.initialPassword')}
                                    type="password"
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    required
                                    className="input-field"
                                />
                            </label>
                        )}

                        <div className="md:col-span-2 pt-2">
                            <button
                                type="submit"
                                className="primary-button w-full py-3 text-sm font-semibold shadow-sm"
                                style={{ borderRadius: 'var(--radius-sm)' }}
                            >
                                {editId ? t('admin.drivers.updateDriver') : t('admin.drivers.createDriver')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Drivers Profile Dashboard List Container */}
            <div className="grid gap-4">
                {paginatedDrivers.map(driver => (
                    <div
                        key={driver.id}
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
                                <h3 className="font-bold text-lg" style={{ color: 'var(--charcoal)' }}>{driver.fullName}</h3>
                                <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{driver.email}</p>
                                {driver.phoneNumber && (
                                    <p className="text-sm" style={{ color: 'var(--charcoal-medium)' }}>📞 {driver.phoneNumber}</p>
                                )}
                                <p className="text-xs mt-2 font-medium" style={{ color: 'var(--wheat-dark)' }}>
                                    Joined {new Date(driver.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            
                            {/* Functional Operations Triggers */}
                            <div className="flex flex-wrap gap-2 sm:self-center">
                                <button
                                    onClick={() => handleShowDetails(driver.id)}
                                    className="outline-button px-3.5 py-1.5 text-sm font-medium"
                                    style={{ borderRadius: 'var(--radius-sm)' }}
                                >
                                    {t('common.showDetails')}
                                </button>
                                <button
                                    onClick={() => handleEdit(driver)}
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
                                    onClick={() => handleDelete(driver.id)}
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
                
                {filteredDrivers.length === 0 && (
                    <div className="text-center py-12 card" style={{ backgroundColor: 'var(--surface)' }}>
                        <p className="text-base font-medium" style={{ color: 'var(--charcoal-medium)' }}>
                            {t('generated.pages_admin_ManageDrivers_jsx_447_9ced879d')}
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination Controls Footer Deck */}
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
        </div>
    );
}