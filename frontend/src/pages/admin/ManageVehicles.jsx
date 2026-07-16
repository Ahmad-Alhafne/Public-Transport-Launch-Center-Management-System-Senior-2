import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function ManageVehicles() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', type: '', capacity: '', plateNumber: '', status: 'Active' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [confirmingUpdate, setConfirmingUpdate] = useState(false);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);

    const [filters, setFilters] = useState({ name: '', type: '', plateNumber: '', status: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchVehicles = async () => {
        try {
            const { data } = await getVehicles();
            setVehicles(data);
        } catch {
            setError(t('generated.pages_admin_ManageVehicles_jsx_22_84f38f1f'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchVehicles(); }, []);

    useEffect(() => { setCurrentPage(1); }, [filters, vehicles]);

    const buildPayload = () => ({
        name: form.name,
        type: form.type,
        capacity: parseInt(form.capacity, 10) || 0,
        plateNumber: form.plateNumber,
        status: form.status
    });

    const resetForm = () => {
        setEditId(null);
        setForm({ name: '', type: '', capacity: '', plateNumber: '', status: 'Active' });
    };

    const getErrorMessage = (err) => err?.response?.data?.Detailed || err?.response?.data?.detailed || err?.response?.data?.message || err.message || 'Operation failed';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');

        if (editId) {
            setConfirmingUpdate(true);
            return;
        }

        try {
            const payload = buildPayload();
            if (!payload.name || !payload.type || !payload.plateNumber || payload.capacity <= 0) {
                throw new Error(t('generated.pages_admin_ManageVehicles_jsx_66_b874c1d0'));
            }
            await createVehicle(payload);
            setSuccess(t('generated.pages_admin_ManageVehicles_jsx_70_f7bf7ed6'));
            setShowForm(false);
            resetForm();
            fetchVehicles();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const confirmUpdate = async () => {
        if (!editId) return;
        setConfirmingUpdate(false);
        setError(''); setSuccess('');

        try {
            const payload = buildPayload();
            await updateVehicle(editId, payload);
            setSuccess(t('generated.pages_admin_ManageVehicles_jsx_84_411e8bf7'));
            setShowForm(false);
            resetForm();
            fetchVehicles();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const handleEdit = (vehicle) => {
        setEditId(vehicle.id);
        setForm({
            name: vehicle.name,
            type: vehicle.type,
            capacity: String(vehicle.capacity),
            plateNumber: vehicle.plateNumber,
            status: vehicle.status || 'Active'
        });
        setShowForm(true);
    };

    const handleDelete = (id) => {
        setError(''); setSuccess('');
        setConfirmingDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!confirmingDeleteId) return;
        const id = confirmingDeleteId;
        setConfirmingDeleteId(null);
        setError(''); setSuccess('');

        try {
            await deleteVehicle(id);
            setSuccess(t('generated.pages_admin_ManageVehicles_jsx_120_4bd2bc5b'));
            fetchVehicles();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const filteredVehicles = vehicles.filter((vehicle) => {
        const matchesName = filters.name ? (vehicle.name || '').toLowerCase().includes(filters.name.toLowerCase()) : true;
        const matchesType = filters.type ? (vehicle.type || '').toLowerCase().includes(filters.type.toLowerCase()) : true;
        const matchesPlate = filters.plateNumber ? (vehicle.plateNumber || '').toLowerCase().includes(filters.plateNumber.toLowerCase()) : true;
        const matchesStatus = filters.status ? (vehicle.status || '').toLowerCase().includes(filters.status.toLowerCase()) : true;
        return matchesName && matchesType && matchesPlate && matchesStatus;
    });

    const pageCount = Math.max(1, Math.ceil(filteredVehicles.length / itemsPerPage));
    const paginatedVehicles = filteredVehicles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        const newPageCount = Math.max(1, Math.ceil(filteredVehicles.length / itemsPerPage));
        if (currentPage > newPageCount) {
            setCurrentPage(newPageCount);
        }
    }, [currentPage, filteredVehicles.length, itemsPerPage]);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--forest)' }}></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            {/* Header Control Panel */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--charcoal)' ,margin:'20px 0'}}>
                        {t('admin.vehicles.title')}
                    </h1>
                </div>
                <button 
                    onClick={() => { setShowForm(!showForm); resetForm(); }}
                    className={showForm ? "danger-button px-5 py-2.5 font-medium text-sm shadow-sm transition-all duration-200" : "primary-button px-5 py-2.5 font-medium text-sm shadow-sm transition-all duration-200"}
                    style={{ borderRadius: 'var(--radius-sm)' }}
                >
                    {showForm ? t('common.cancel') : `+ ${t('admin.vehicles.newVehicle')}`}
                </button>
            </div>

            {/* Operational Message Output Stack */}
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

            {/* Interactive Grid Filtering Node */}
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-2xl border" style={{ backgroundColor: 'var(--surface-muted)', borderColor: 'rgba(66, 129, 119, 0.08)' }}>
                <input placeholder={t('admin.vehicles.searchName')} value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} className="input-field !bg-white" />
                <input placeholder={t('admin.vehicles.searchType')} value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} className="input-field !bg-white" />
                <input placeholder={t('admin.vehicles.searchPlate')} value={filters.plateNumber} onChange={(e) => setFilters({ ...filters, plateNumber: e.target.value })} className="input-field !bg-white" />
                <input placeholder={t('admin.vehicles.searchStatus')} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="input-field !bg-white" />
            </div>

            {/* Dynamic Dialog Overlays */}
            <ConfirmationModal open={confirmingUpdate} title={t('admin.vehicles.confirmUpdateTitle')} message={t('admin.vehicles.confirmUpdateMessage')} confirmText={t('common.update')} cancelText={t('common.cancel')} onConfirm={confirmUpdate} onCancel={() => setConfirmingUpdate(false)} />
            <ConfirmationModal open={!!confirmingDeleteId} title={t('admin.vehicles.confirmDeleteTitle')} message={t('admin.vehicles.confirmDeleteMessage')} confirmText={t('common.delete')} cancelText={t('common.cancel')} danger onConfirm={confirmDelete} onCancel={() => setConfirmingDeleteId(null)} />

            {/* Entity Insertion and Modification Deck */}
            {showForm && (
                <div className="card mb-8 p-6 transition-all duration-300" style={{ backgroundColor: 'var(--surface)', borderColor: 'rgba(66, 129, 119, 0.12)' }}>
                    <h2 className="text-xl font-bold mb-6 pb-2 border-b" style={{ color: 'var(--forest-dark)', borderColor: 'rgba(66, 129, 119, 0.08)' }}>
                        {editId ? t('admin.vehicles.updateVehicle') : t('admin.vehicles.createVehicle')}
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <label className="flex flex-col gap-1.5">
                            <span className="form-label !mb-0">{t('admin.vehicles.name')}</span>
                            <input placeholder={t('admin.vehicles.name')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="input-field" />
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className="form-label !mb-0">{t('admin.vehicles.type')}</span>
                            <input placeholder={t('admin.vehicles.type')} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required className="input-field" />
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className="form-label !mb-0">{t('admin.vehicles.capacity')}</span>
                            <input placeholder={t('admin.vehicles.capacity')} type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required className="input-field" />
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className="form-label !mb-0">{t('admin.vehicles.plateNumber')}</span>
                            <input placeholder={t('admin.vehicles.plateNumber')} value={form.plateNumber} onChange={(e) => setForm({ ...form, plateNumber: e.target.value })} required maxLength={50} className="input-field" />
                        </label>

                        <label className="flex flex-col gap-1.5 md:col-span-2">
                            <span className="form-label !mb-0">{t('generated.pages_admin_TripDetails_jsx_140_bae7d5be')}</span>
                            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
                                <option value="Active">{t('admin.vehicles.active')}</option>
                                <option value="Inactive">{t('admin.vehicles.inactive')}</option>
                            </select>
                        </label>

                        <div className="md:col-span-2 pt-2">
                            <button type="submit" className="primary-button w-full py-3 text-sm font-semibold shadow-sm" style={{ borderRadius: 'var(--radius-sm)' }}>
                                {editId ? t('admin.vehicles.updateVehicle') : t('admin.vehicles.createVehicle')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List Data Grid Layout wrapper */}
            <div className="grid gap-4">
                {paginatedVehicles.map((vehicle) => (
                    <div 
                        key={vehicle.id} 
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
                                <h3 className="font-bold text-lg" style={{ color: 'var(--charcoal)' }}>{vehicle.name}</h3>
                                <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                                    {vehicle.type} • {vehicle.plateNumber}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--wheat-light)', color: 'var(--charcoal-medium)' }}>
                                        Capacity: {vehicle.capacity}
                                    </span>
                                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" 
                                        style={{ 
                                            backgroundColor: vehicle.status === 'Active' ? 'rgba(66, 129, 119, 0.12)' : 'rgba(107, 31, 42, 0.08)', 
                                            color: vehicle.status === 'Active' ? 'var(--forest-dark)' : 'var(--umber)' 
                                        }}
                                    >
                                        {vehicle.status || 'Active'}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Management Command Matrix Buttons */}
                            <div className="flex flex-wrap gap-2 sm:self-center">
                                <button onClick={() => navigate(`/admin/vehicles/${vehicle.id}`)} className="outline-button px-3.5 py-1.5 text-sm font-medium" style={{ borderRadius: 'var(--radius-sm)' }}>
                                    {t('common.viewDetails')}
                                </button>
                                <button 
                                    onClick={() => handleEdit(vehicle)} 
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
                                    onClick={() => handleDelete(vehicle.id)} 
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
                
                {filteredVehicles.length === 0 && (
                    <div className="text-center py-12 card" style={{ backgroundColor: 'var(--surface)' }}>
                        <p className="text-base font-medium" style={{ color: 'var(--charcoal-medium)' }}>
                            {t('admin.vehicles.noVehiclesFound')}
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination Controls Deck Footer */}
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
                    {[...Array(pageCount)].map((_, index) => (
                        <button 
                            key={index} 
                            onClick={() => setCurrentPage(index + 1)} 
                            className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                            style={currentPage === index + 1 ? {
                                backgroundColor: 'var(--forest)',
                                color: 'var(--surface)',
                                boxShadow: '0 4px 12px rgba(66, 129, 119, 0.15)'
                            } : {
                                backgroundColor: 'var(--surface-muted)',
                                color: 'var(--charcoal-medium)'
                            }}
                        >
                            {index + 1}
                        </button>
                    ))}
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