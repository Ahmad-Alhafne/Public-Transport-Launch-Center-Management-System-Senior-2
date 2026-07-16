import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getRoutes, createRoute, updateRoute, deleteRoute } from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function ManageRoutes() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', startLocation: '', endLocation: '', distanceKm: '', estimatedDurationMins: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [confirmingUpdate, setConfirmingUpdate] = useState(false);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    const [filters, setFilters] = useState({
        name: '',
        startLocation: '',
        endLocation: '',
        distanceKm: '',
        estimatedDurationMins: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchRoutes = async () => {
        try {
            const { data } = await getRoutes();
            setRoutes(data);
        } catch { setError(t('generated.pages_admin_ManageRoutes_load_failed')); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchRoutes(); }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters, routes]);

    const buildPayload = () => ({
        ...form,
        distanceKm: parseFloat(form.distanceKm),
        estimatedDurationMins: parseInt(form.estimatedDurationMins)
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');

        if (editId) {
            setConfirmingUpdate(true);
            return;
        }

        try {
            const payload = buildPayload();
            await createRoute(payload);
            setSuccess(t('generated.pages_admin_ManageRoutes_add_success'));
            setShowForm(false);
            setEditId(null);
            setForm({ name: '', startLocation: '', endLocation: '', distanceKm: '', estimatedDurationMins: '' });
            fetchRoutes();
        } catch (err) { setError(err.response?.data?.Detailed || t('generated.pages_admin_ManageRoutes_operation_failed')); }
    };

    const confirmUpdate = async () => {
        if (!editId) return;
        setConfirmingUpdate(false);
        setError(''); setSuccess('');

        try {
            const payload = buildPayload();
            await updateRoute(editId, { ...payload, isActive: true });
            setSuccess(t('generated.pages_admin_ManageRoutes_update_success'));
            setShowForm(false);
            setEditId(null);
            setForm({ name: '', startLocation: '', endLocation: '', distanceKm: '', estimatedDurationMins: '' });
            fetchRoutes();
        } catch (err) { setError(err.response?.data?.Detailed || t('generated.pages_admin_ManageRoutes_operation_failed')); }
    };

    const handleEdit = (route) => {
        setEditId(route.id);
        setForm({ name: route.name, startLocation: route.startLocation, endLocation: route.endLocation, distanceKm: route.distanceKm, estimatedDurationMins: route.estimatedDurationMins });
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

        try { await deleteRoute(id); setSuccess(t('generated.pages_admin_ManageRoutes_delete_success')); fetchRoutes(); }
        catch (err) { setError(err.response?.data?.Detailed || t('generated.pages_admin_ManageRoutes_delete_failed')); }
    };

    const filteredRoutes = routes.filter((route) => {
        const matchesName = filters.name
            ? (route.name || '').toLowerCase().includes(filters.name.toLowerCase())
            : true;
        const matchesStart = filters.startLocation
            ? (route.startLocation || '').toLowerCase().includes(filters.startLocation.toLowerCase())
            : true;
        const matchesEnd = filters.endLocation
            ? (route.endLocation || '').toLowerCase().includes(filters.endLocation.toLowerCase())
            : true;
        const matchesDistance = filters.distanceKm
            ? String(route.distanceKm).toLowerCase().includes(filters.distanceKm.toLowerCase())
            : true;
        const matchesDuration = filters.estimatedDurationMins
            ? String(route.estimatedDurationMins).toLowerCase().includes(filters.estimatedDurationMins.toLowerCase())
            : true;

        return matchesName && matchesStart && matchesEnd && matchesDistance && matchesDuration;
    });

    const pageCount = Math.max(1, Math.ceil(filteredRoutes.length / itemsPerPage));
    const paginatedRoutes = filteredRoutes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        const newPageCount = Math.max(1, Math.ceil(filteredRoutes.length / itemsPerPage));
        if (currentPage > newPageCount) {
            setCurrentPage(newPageCount);
        }
    }, [currentPage, filteredRoutes.length, itemsPerPage]);

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
                    <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--charcoal)',margin:'20px 0' }}>
                        {t('admin.routes.title')}
                    </h1>
                </div>
                <button 
                    onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', startLocation: '', endLocation: '', distanceKm: '', estimatedDurationMins: '' }); }}
                    className={showForm ? "danger-button px-5 py-2.5 font-medium text-sm shadow-sm transition-all duration-200" : "primary-button px-5 py-2.5 font-medium text-sm shadow-sm transition-all duration-200"}
                    style={{ borderRadius: 'var(--radius-sm)' }}
                >
                    {showForm ? t('common.cancel') : `+ ${t('admin.routes.newRoute')}`}
                </button>
            </div>

            {/* Operational Message Output Stack */}
            {error && <div className="alert alert-error mb-4 text-sm font-medium shadow-sm">{error}</div>}
            {success && <div className="alert alert-success mb-4 text-sm font-medium shadow-sm">{success}</div>}

            {/* Interactive Search Matrix Node */}
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 p-4 rounded-2xl border" style={{ backgroundColor: 'var(--surface-muted)', borderColor: 'rgba(66, 129, 119, 0.08)' }}>
                <input
                    placeholder={t('admin.routes.searchName')}
                    value={filters.name}
                    onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                    className="input-field !bg-white focus:ring-2 focus:ring-offset-1"
                />
                <input
                    placeholder={t('admin.routes.searchStart')}
                    value={filters.startLocation}
                    onChange={(e) => setFilters({ ...filters, startLocation: e.target.value })}
                    className="input-field !bg-white focus:ring-2 focus:ring-offset-1"
                />
                <input
                    placeholder={t('admin.routes.searchEnd')}
                    value={filters.endLocation}
                    onChange={(e) => setFilters({ ...filters, endLocation: e.target.value })}
                    className="input-field !bg-white focus:ring-2 focus:ring-offset-1"
                />
                <input
                    placeholder={t('admin.routes.searchDistance')}
                    value={filters.distanceKm}
                    onChange={(e) => setFilters({ ...filters, distanceKm: e.target.value })}
                    className="input-field !bg-white focus:ring-2 focus:ring-offset-1"
                />
                <input
                    placeholder={t('admin.routes.searchDuration')}
                    value={filters.estimatedDurationMins}
                    onChange={(e) => setFilters({ ...filters, estimatedDurationMins: e.target.value })}
                    className="input-field !bg-white focus:ring-2 focus:ring-offset-1"
                />
            </div>

            {/* Dialog Overlay Modals */}
            <ConfirmationModal
                open={confirmingUpdate}
                title={t('admin.routes.confirmUpdateTitle')}
                message={t('admin.routes.confirmUpdateMessage')}
                confirmText={t('common.update')}
                cancelText={t('common.cancel')}
                onConfirm={confirmUpdate}
                onCancel={() => setConfirmingUpdate(false)}
            />
            <ConfirmationModal
                open={!!confirmingDeleteId}
                title={t('admin.routes.confirmDeleteTitle')}
                message={t('admin.routes.confirmDeleteMessage')}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                danger
                onConfirm={confirmDelete}
                onCancel={() => setConfirmingDeleteId(null)}
            />

            {/* Entity Upsert Form Deck */}
            {showForm && (
                <div className="card mb-8 p-6 transition-all duration-300" style={{ backgroundColor: 'var(--surface)', borderColor: 'rgba(66, 129, 119, 0.12)' }}>
                    <h2 className="text-xl font-bold mb-6 pb-2 border-b" style={{ color: 'var(--forest-dark)', borderColor: 'rgba(66, 129, 119, 0.08)' }}>
                        {editId ? t('common.update') : t('common.create')}
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <label className="flex flex-col gap-1.5">
                            <span className="form-label !mb-0">{t('admin.routes.routeName')}</span>
                            <input placeholder={t('admin.routes.routeName')} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="input-field" />
                        </label>
                        
                        <label className="flex flex-col gap-1.5">
                            <span className="form-label !mb-0">{t('admin.routes.startLocation')}</span>
                            <input placeholder={t('admin.routes.startLocation')} value={form.startLocation} onChange={e => setForm({ ...form, startLocation: e.target.value })} required className="input-field" />
                        </label>
                        
                        <label className="flex flex-col gap-1.5">
                            <span className="form-label !mb-0">{t('admin.routes.endLocation')}</span>
                            <input placeholder={t('admin.routes.endLocation')} value={form.endLocation} onChange={e => setForm({ ...form, endLocation: e.target.value })} required className="input-field" />
                        </label>
                        
                        <label className="flex flex-col gap-1.5">
                            <span className="form-label !mb-0">{t('admin.routes.distanceKm')}</span>
                            <input placeholder={t('admin.routes.distanceKm')} type="number" step="0.1" value={form.distanceKm} onChange={e => setForm({ ...form, distanceKm: e.target.value })} required className="input-field" />
                        </label>
                        
                        <label className="flex flex-col gap-1.5 md:col-span-2">
                            <span className="form-label !mb-0">{t('admin.routes.estimatedDurationMins')}</span>
                            <input placeholder={t('admin.routes.estimatedDurationMins')} type="number" value={form.estimatedDurationMins} onChange={e => setForm({ ...form, estimatedDurationMins: e.target.value })} required className="input-field" />
                        </label>
                        
                        <div className="md:col-span-2 pt-2">
                            <button type="submit" className="primary-button w-full py-3 text-sm font-semibold shadow-sm" style={{ borderRadius: 'var(--radius-sm)' }}>
                                {editId ? t('common.update') : t('common.create')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List Data Matrix Card Deck */}
            <div className="grid gap-4">
                {paginatedRoutes.map(route => (
                    <div 
                        key={route.id} 
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
                            <div className="cursor-pointer space-y-1 flex-1" onClick={() => setExpandedId(expandedId === route.id ? null : route.id)}>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-lg" style={{ color: 'var(--charcoal)' }}>{route.name}</h3>
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--wheat-light)', color: 'var(--charcoal-medium)' }}>
                                        {route.distanceKm} km
                                    </span>
                                </div>
                                <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                                    {route.startLocation} &rarr; {route.endLocation}
                                </p>
                            </div>
                            
                            {/* Management Command Matrix Buttons */}
                            <div className="flex flex-wrap gap-2 sm:self-center">
                                <button 
                                    onClick={() => navigate(`/admin/routes/${route.id}`)} 
                                    className="outline-button px-3.5 py-1.5 text-sm font-medium" 
                                    style={{ borderRadius: 'var(--radius-sm)' }}
                                >
                                    {t('common.viewDetails')}
                                </button>
                                <button 
                                    onClick={() => handleEdit(route)} 
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
                                    onClick={() => handleDelete(route.id)} 
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

                        {/* Interactive Collapsible Block */}
                        {expandedId === route.id && (
                            <div className="mt-4 pt-4 text-sm border-t" style={{ borderColor: 'rgba(66, 129, 119, 0.06)' }}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-medium">
                                    <div>
                                        <span style={{ color: 'var(--charcoal-medium)' }}>{t('admin.routes.start')}:</span>{' '}
                                        <span style={{ color: 'var(--charcoal)' }}>{route.startLocation}</span>
                                    </div>
                                    <div>
                                        <span style={{ color: 'var(--charcoal-medium)' }}>{t('admin.routes.destination')}:</span>{' '}
                                        <span style={{ color: 'var(--charcoal)' }}>{route.endLocation}</span>
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                                    <span className="flex items-center gap-1">📏 {route.distanceKm} km</span>
                                    <span className="flex items-center gap-1">⏱ {route.estimatedDurationMins} mins</span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                
                {filteredRoutes.length === 0 && (
                    <div className="text-center py-12 card" style={{ backgroundColor: 'var(--surface)' }}>
                        <p className="text-base font-medium" style={{ color: 'var(--charcoal-medium)' }}>
                            {t('admin.routes.noRoutesFound')}
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination Segment Frame */}
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